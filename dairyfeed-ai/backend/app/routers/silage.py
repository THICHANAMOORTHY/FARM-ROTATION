from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.db import SampleRepository, get_repository
from app.models.sample import Sample, SilageTestRequest, row_to_sample
from app.security import require_device_key
from app.services.samples import apply_prediction, readings_columns

router = APIRouter(prefix="/api/silage", tags=["silage"])


@router.post("/test", response_model=Sample, dependencies=[Depends(require_device_key)])
def submit_test(body: SilageTestRequest, repo: SampleRepository = Depends(get_repository)) -> Sample:
    """A device sends one sample's readings and gets back the prediction and advisory."""
    now = datetime.now(timezone.utc)
    existing = repo.get_sample(body.sample_id)

    if existing and existing["device_id"] != body.device_id:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"sample_id {body.sample_id} already belongs to device {existing['device_id']}.",
        )
    if existing and existing.get("ph") is not None:
        # Readings were already received (e.g. the device retried after a lost response).
        # The first upload wins; return the stored result so a retry is always safe.
        return row_to_sample(existing)

    # New sample, or a sample whose photo arrived first.
    row = existing or {
        "sample_id": body.sample_id,
        "device_id": body.device_id,
        "created_at": now,
        "time_source": "server",
    }
    if body.created_at:  # the device clock is NTP-synced: trust its time
        row["created_at"] = body.created_at
        row["time_source"] = "ntp"
    row.update(
        feed_type=body.feed_type,
        farm_id=body.farm_id,
        is_simulated=body.flags.simulated,
        is_demo=body.flags.demo,
        synced_from_offline=False,
    )
    row.update(readings_columns(body))

    saved = repo.save_sample(apply_prediction(row))
    repo.touch_device(body.device_id, now)
    return row_to_sample(saved)
