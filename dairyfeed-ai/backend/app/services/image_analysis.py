"""Mould risk from the sample photo.

Uses the trained image model (ml/train_image.py) ONLY if it passed validation.
Until then every photo gives "Unknown": no hand-made colour rule decides mould.
The photos are stored so experts can label them, and the model is trained on those labels.
"""

from app.services.features import image_features

JPEG_START = b"\xff\xd8\xff"


def is_jpeg(data: bytes) -> bool:
    """Every JPEG file starts with the bytes FF D8 FF."""
    return data.startswith(JPEG_START)


def mould_risk_from_image(data: bytes) -> tuple[str, str | None]:
    """Returns (mould risk, model version). ("Unknown", None) when no validated model exists."""
    from app.services.predictor import get_model  # imported here to avoid a circular import

    model = get_model("image-mould")
    if model is None:
        return "Unknown", None
    try:
        features = image_features(data)
    except OSError:  # a JPEG header but unreadable picture
        return "Unknown", None
    return str(model[0].predict([features])[0]), model[1]
