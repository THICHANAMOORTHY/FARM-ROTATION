from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.config import Settings, get_settings
from app.db import SampleRepository, get_repository
from app.models.sample import Sample, row_to_sample
from app.security import require_device_key
from app.services.image_analysis import is_jpeg
from app.services.samples import store_image

router = APIRouter(prefix="/api/image", tags=["image"])


@router.post("/analyze", response_model=Sample, dependencies=[Depends(require_device_key)])
async def analyze_image(
    sample_id: str = Form(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_]+-[A-Za-z0-9_-]+$"),
    image: UploadFile = File(description="JPEG photo of the sample"),
    repo: SampleRepository = Depends(get_repository),
    settings: Settings = Depends(get_settings),
) -> Sample:
    """The camera node uploads the photo for a sample_id.

    The photo is stored and the prediction recomputed. Mould risk stays "Unknown" until a
    validated image model exists (see app/services/image_analysis.py).
    """
    data = await image.read(settings.max_image_bytes + 1)
    if len(data) > settings.max_image_bytes:
        raise HTTPException(
            status.HTTP_413_CONTENT_TOO_LARGE,
            f"Image is larger than {settings.max_image_bytes} bytes.",
        )
    if not is_jpeg(data):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Image must be a JPEG.")

    row, _ = store_image(repo, sample_id, data)
    return row_to_sample(row)
