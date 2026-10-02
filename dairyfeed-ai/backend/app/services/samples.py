"""Turns readings into stored sample rows, and (re)computes the prediction and advisory.

Readings and the photo can arrive in either order, so the prediction is recomputed
whenever either one arrives (the photo endpoint arrives in Phase 2).
"""

from app.db import Row
from app.models.sample import SilageTestRequest, row_to_sample
from app.services.advisory import build_advisory
from app.services.predictor import predict


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
