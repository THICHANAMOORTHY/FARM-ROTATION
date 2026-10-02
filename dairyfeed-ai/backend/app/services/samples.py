"""Stores readings and photos as sample rows, and (re)computes the prediction and advisory.

Readings and the photo can arrive in either order, so the prediction is recomputed
whenever either one arrives. For both, the first upload wins: sending the same
sample_id again returns what is already stored, so device retries are always safe.
"""

from datetime import datetime, timezone

from app.db import Row, SampleRepository
from app.models.sample import SilageTestRequest, row_to_sample
from app.services.advisory import build_advisory
from app.services.image_analysis import mould_risk_from_image
from app.services.predictor import predict


class SampleConflict(Exception):
    """The sample_id already belongs to a different device."""


def device_id_from_sample_id(sample_id: str) -> str:
    """sample_id looks like 'DF01-20261002T103015-0007'; the part before the first '-' is the device."""
    return sample_id.split("-", 1)[0]


def readings_columns(body: SilageTestRequest) -> Row:
    r = body.readings
    return {
        "ph": r.ph,
        "moisture_raw": r.moisture_raw,
        "moisture_pct": r.moisture_pct,
        "sample_temp_c": r.sample_temp_c,
        "ambient_temp_c": r.ambient_temp_c,
        "rgb_r": r.rgb.r if r.rgb else None,
        "rgb_g": r.rgb.g if r.rgb else None,
        "rgb_b": r.rgb.b if r.rgb else None,
    }


def apply_prediction(row: Row) -> Row:
    """Fill the prediction and advisory columns of a row that has readings. Returns the same row."""
    readings = row_to_sample(row).readings
    if readings is None:
        return row  # photo only so far: nothing to score until the readings arrive

    # Mould risk only comes from a photo. No photo means Unknown — never a guessed value.
    mould_risk = row.get("mould_risk") if row.get("image_path") else None
    prediction = predict(readings, mould_risk or "Unknown")
    advisory = build_advisory(readings, prediction.quality, prediction.spoilage_risk, prediction.mould_risk)

    row.update(
        quality=prediction.quality,
        spoilage_risk=prediction.spoilage_risk,
        mould_risk=prediction.mould_risk,
        score=prediction.score,
        method=prediction.method,
        model_version=prediction.model_version,
        breakdown=prediction.breakdown,
        advisory_level=advisory.level,
        advisory_en=advisory.en,
        advisory_ta=advisory.ta,
    )
    return row


def new_row(sample_id: str, device_id: str, now: datetime) -> Row:
    return {
        "sample_id": sample_id,
        "device_id": device_id,
        "created_at": now,
        "time_source": "server",
        "feed_type": "other",
    }


def store_readings(repo: SampleRepository, body: SilageTestRequest, *, offline: bool) -> tuple[Row, bool]:
    """Store one sample's readings. Returns (stored row, created).

    created is False when the readings were already stored; the stored row is returned unchanged.
    Raises SampleConflict if the sample_id belongs to another device.
    """
    now = datetime.now(timezone.utc)
    existing = repo.get_sample(body.sample_id)

    if existing and existing["device_id"] != body.device_id:
        raise SampleConflict(f"sample_id {body.sample_id} already belongs to device {existing['device_id']}.")
    if existing and existing.get("ph") is not None:
        return existing, False

    # New sample, or a sample whose photo arrived first.
    row = existing or new_row(body.sample_id, body.device_id, now)
    if body.created_at:  # the device clock is NTP-synced: trust its time
        row["created_at"] = body.created_at
        row["time_source"] = "ntp"
    row.update(
        feed_type=body.feed_type,
        farm_id=body.farm_id,
        is_simulated=body.flags.simulated,
        is_demo=body.flags.demo,
        synced_from_offline=offline,
    )
    row.update(readings_columns(body))

    saved = repo.save_sample(apply_prediction(row))
    repo.touch_device(body.device_id, now)
    return saved, True


def image_path(device_id: str, sample_id: str) -> str:
    return f"{device_id}/{sample_id}.jpg"


def store_image(repo: SampleRepository, sample_id: str, data: bytes) -> tuple[Row, bool]:
    """Store a sample's photo and recompute its prediction. Returns (stored row, created).

    created is False when a photo was already stored; the stored row is returned unchanged.
    """
    now = datetime.now(timezone.utc)
    device_id = device_id_from_sample_id(sample_id)
    existing = repo.get_sample(sample_id)
    if existing and existing.get("image_path"):
        return existing, False

    path = image_path(device_id, sample_id)
    repo.save_image(path, data)  # file first: a row must never point at a missing photo

    row = existing or new_row(sample_id, device_id, now)
    row.update(image_path=path, image_received_at=now, mould_risk=mould_risk_from_image(data))

    saved = repo.save_sample(apply_prediction(row))
    repo.touch_device(device_id, now)
    return saved, True
