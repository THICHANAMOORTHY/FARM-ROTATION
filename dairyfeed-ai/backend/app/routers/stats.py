from fastapi import APIRouter, Depends

from app.db import SampleRepository, get_repository
from app.models.sample import StatsSummary

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/summary", response_model=StatsSummary)
def summary(device_id: str | None = None, repo: SampleRepository = Depends(get_repository)) -> StatsSummary:
    """Counts for the dashboard cards. Optionally for one device only."""

    def count_each(column: str, values: list[str]) -> dict[str, int]:
        return {value: repo.count_samples(column, value, device_id) for value in values}

    total = repo.count_samples(device_id=device_id)
    return StatsSummary(
        total=total,
        awaiting_readings=repo.count_samples("quality", None, device_id),
        by_quality=count_each("quality", ["Good", "Moderate", "Poor"]),
        by_spoilage_risk=count_each("spoilage_risk", ["Low", "Medium", "High"]),
        by_mould_risk=count_each("mould_risk", ["Low", "High", "Unknown"]),
        labelled=total - repo.count_samples("label_quality", None, device_id),
    )
