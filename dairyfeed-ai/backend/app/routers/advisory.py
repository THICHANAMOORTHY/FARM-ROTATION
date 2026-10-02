from fastapi import APIRouter, Depends, HTTPException, status

from app.db import SampleRepository, get_repository
from app.models.sample import Advisory, row_to_sample

router = APIRouter(prefix="/api/advisory", tags=["advisory"])


@router.get("/{sample_id}", response_model=Advisory)
def get_advisory(sample_id: str, repo: SampleRepository = Depends(get_repository)) -> Advisory:
    row = repo.get_sample(sample_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No sample with sample_id {sample_id}.")
    advisory = row_to_sample(row).advisory
    if advisory is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Sample {sample_id} has no advisory yet: readings not received.")
    return advisory
