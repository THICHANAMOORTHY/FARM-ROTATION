from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import ValidationError

from app.db import SampleFilters, SampleRepository, get_repository
from app.models.sample import (
    BulkItemResult,
    BulkRequest,
    BulkResponse,
    FeedType,
    HistoryPage,
    LabelRequest,
    Sample,
    SilageTestRequest,
    row_to_sample,
)
from app.security import require_admin_token, require_device_key
from app.services.samples import SampleConflict, store_readings

router = APIRouter(prefix="/api/silage", tags=["silage"])


def get_row_or_404(repo: SampleRepository, sample_id: str) -> dict:
    row = repo.get_sample(sample_id)
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No sample with sample_id {sample_id}.")
    return row


def as_utc(value: datetime | None) -> datetime | None:
    """Dates without a timezone are taken as UTC."""
    if value is not None and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


@router.post("/test", response_model=Sample, dependencies=[Depends(require_device_key)])
def submit_test(body: SilageTestRequest, repo: SampleRepository = Depends(get_repository)) -> Sample:
    """A device sends one sample's readings and gets back the prediction and advisory."""
    try:
        row, _ = store_readings(repo, body, offline=False)
    except SampleConflict as error:
        raise HTTPException(status.HTTP_409_CONFLICT, str(error)) from error
    return row_to_sample(row)


@router.post("/bulk", response_model=BulkResponse, dependencies=[Depends(require_device_key)])
def submit_bulk(body: BulkRequest, repo: SampleRepository = Depends(get_repository)) -> BulkResponse:
    """Offline sync: a device sends up to 50 queued readings at once.

    The device may delete from its queue every item whose status is "saved" or "duplicate".
    "rejected" items can never be accepted (bad data or another device's sample_id): the
    device should log and delete them too, so they don't block the queue forever.
    """
    results = []
    for item in body.items:
        sample_id = item.get("sample_id") if isinstance(item.get("sample_id"), str) else None
        try:
            request = SilageTestRequest.model_validate(item)
            _, created = store_readings(repo, request, offline=True)
            results.append(BulkItemResult(sample_id=sample_id, status="saved" if created else "duplicate"))
        except ValidationError as error:
            problems = "; ".join(f"{'.'.join(map(str, e['loc']))}: {e['msg']}" for e in error.errors())
            results.append(BulkItemResult(sample_id=sample_id, status="rejected", detail=problems))
        except SampleConflict as error:
            results.append(BulkItemResult(sample_id=sample_id, status="rejected", detail=str(error)))
    return BulkResponse(results=results)


@router.get("/history", response_model=HistoryPage)
def history(
    device_id: str | None = None,
    farm_id: str | None = None,
    feed_type: FeedType | None = None,
    date_from: datetime | None = Query(default=None, description="ISO date-time; no timezone means UTC"),
    date_to: datetime | None = Query(default=None, description="ISO date-time; no timezone means UTC"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    repo: SampleRepository = Depends(get_repository),
) -> HistoryPage:
    """Samples, newest first, one page at a time."""
    filters = SampleFilters(
        device_id=device_id,
        farm_id=farm_id,
        feed_type=feed_type,
        date_from=as_utc(date_from),
        date_to=as_utc(date_to),
    )
    rows, total = repo.list_samples(filters, offset=(page - 1) * page_size, limit=page_size)
    return HistoryPage(items=[row_to_sample(r) for r in rows], total=total, page=page, page_size=page_size)


@router.get("/{sample_id}", response_model=Sample)
def sample_detail(sample_id: str, repo: SampleRepository = Depends(get_repository)) -> Sample:
    return row_to_sample(get_row_or_404(repo, sample_id))


@router.get("/{sample_id}/image", response_class=Response)
def sample_image(sample_id: str, repo: SampleRepository = Depends(get_repository)) -> Response:
    row = get_row_or_404(repo, sample_id)
    if not row.get("image_path"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Sample {sample_id} has no photo yet.")
    data = repo.get_image(row["image_path"])
    if data is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"The photo for sample {sample_id} could not be found.")
    return Response(content=data, media_type="image/jpeg")


@router.post("/{sample_id}/label", response_model=Sample, dependencies=[Depends(require_admin_token)])
def label_sample(sample_id: str, body: LabelRequest, repo: SampleRepository = Depends(get_repository)) -> Sample:
    """An expert records the true quality (and optionally mould and spoilage) for ML training.

    Labelling never changes the prediction: the prediction is what the device said,
    the label is what the expert found. Sending a new label replaces the old one.
    """
    row = get_row_or_404(repo, sample_id)
    row.update(
        label_quality=body.quality,
        label_mould=body.mould,
        label_spoilage=body.spoilage,
        labelled_by=body.labelled_by,
        label_reference=body.reference,
        labelled_at=datetime.now(timezone.utc),
    )
    return row_to_sample(repo.save_sample(row))
