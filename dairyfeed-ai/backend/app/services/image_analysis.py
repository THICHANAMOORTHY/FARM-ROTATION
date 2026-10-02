"""Mould risk from the sample photo.

Decision (Phase 2): there is no trained image model yet, so every photo gives "Unknown".
We do NOT use a hand-made colour rule: it would be unreliable and could not be defended.
The photos are stored so experts can label them, and Phase 7 trains a model on those labels.
Once a model passes validation, this function returns its "Low" / "High" result instead.
"""

JPEG_START = b"\xff\xd8\xff"


def is_jpeg(data: bytes) -> bool:
    """Every JPEG file starts with the bytes FF D8 FF."""
    return data.startswith(JPEG_START)


def mould_risk_from_image(data: bytes) -> str:
    return "Unknown"
