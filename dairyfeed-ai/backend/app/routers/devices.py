from fastapi import APIRouter, Depends

from app.db import SampleFilters, SampleRepository, get_repository
from app.models.sample import DeviceStatus, row_to_sample

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("", response_model=list[DeviceStatus])
def list_devices(repo: SampleRepository = Depends(get_repository)) -> list[DeviceStatus]:
    """Every device, with when it was last seen and its latest sample."""
    devices = []
    for row in repo.list_devices():
        latest, _ = repo.list_samples(SampleFilters(device_id=row["device_id"]), offset=0, limit=1)
        devices.append(
            DeviceStatus(
                device_id=row["device_id"],
                name=row.get("name"),
                last_seen_at=row.get("last_seen_at"),
                pending_sync=row.get("pending_sync") or 0,
                last_sample=row_to_sample(latest[0]) if latest else None,
            )
        )
    return devices
