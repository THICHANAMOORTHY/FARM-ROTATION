"""Request and response shapes for silage samples (see CLAUDE.md section 4).

The database stores a sample as flat columns (see supabase/schema.sql).
`row_to_sample` turns a database row into the nested JSON the API returns.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator

FeedType = Literal["maize_silage", "sorghum_silage", "napier_silage", "other"]
Quality = Literal["Good", "Moderate", "Poor"]
SpoilageRisk = Literal["Low", "Medium", "High"]
MouldRisk = Literal["Low", "High", "Unknown"]
AdvisoryLevel = Literal["ok", "warn", "danger"]


class RGB(BaseModel):
    r: int = Field(ge=0, le=255)
    g: int = Field(ge=0, le=255)
    b: int = Field(ge=0, le=255)


class Readings(BaseModel):
    ph: float = Field(ge=0, le=14)
    moisture_pct: float = Field(ge=0, le=100)
    sample_temp_c: float = Field(ge=-10, le=80)
    ambient_temp_c: float = Field(ge=-10, le=60)
    moisture_raw: int | None = None
    rgb: RGB | None = None


class RequestFlags(BaseModel):
    simulated: bool = False
    demo: bool = False


class SilageTestRequest(BaseModel):
    """What a sensor node sends to POST /api/silage/test."""

    sample_id: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    device_id: str = Field(min_length=1, max_length=32, pattern=r"^[A-Za-z0-9_]+$")
    # Send created_at only if the device clock is NTP-synced; otherwise the server time is used.
    created_at: datetime | None = None
    feed_type: FeedType = "other"
    farm_id: str | None = Field(default=None, max_length=64)
    readings: Readings
    flags: RequestFlags = RequestFlags()

    @model_validator(mode="after")
    def sample_id_matches_device(self) -> "SilageTestRequest":
        if not self.sample_id.startswith(f"{self.device_id}-"):
            raise ValueError(f"sample_id must start with the device_id followed by '-' ('{self.device_id}-...')")
        return self


class Prediction(BaseModel):
    quality: Quality
    spoilage_risk: SpoilageRisk
    mould_risk: MouldRisk
    score: int = Field(ge=0, le=100)
    method: Literal["rules", "ml"]
    model_version: str | None = None
    # Points earned per component. "visual" is None when there is no photo.
    breakdown: dict[str, int | None]


class Advisory(BaseModel):
    level: AdvisoryLevel
    en: str
    ta: str


class ImageInfo(BaseModel):
    path: str | None = None
    received_at: datetime | None = None


class Label(BaseModel):
    quality: Quality | None = None
    mould: Literal["Low", "High"] | None = None
    spoilage: SpoilageRisk | None = None
    labelled_by: str | None = None
    reference: str | None = None
    labelled_at: datetime | None = None


class SampleFlags(BaseModel):
    simulated: bool = False
    demo: bool = False
    synced_from_offline: bool = False


class Sample(BaseModel):
    """A full sample, as the API returns it."""

    sample_id: str
    device_id: str
    created_at: datetime
    time_source: Literal["ntp", "server"]
    feed_type: FeedType
    farm_id: str | None = None
    readings: Readings | None = None
    image: ImageInfo
    prediction: Prediction | None = None
    advisory: Advisory | None = None
    label: Label | None = None
    flags: SampleFlags


def row_to_sample(row: dict[str, Any]) -> Sample:
    """Convert a flat database row into the nested API shape."""
    readings = None
    if row.get("ph") is not None:
        rgb = None
        if row.get("rgb_r") is not None:
            rgb = RGB(r=row["rgb_r"], g=row["rgb_g"], b=row["rgb_b"])
        readings = Readings(
            ph=row["ph"],
            moisture_pct=row["moisture_pct"],
            sample_temp_c=row["sample_temp_c"],
            ambient_temp_c=row["ambient_temp_c"],
            moisture_raw=row.get("moisture_raw"),
            rgb=rgb,
        )

    prediction = None
    if row.get("quality") is not None:
        prediction = Prediction(
            quality=row["quality"],
            spoilage_risk=row["spoilage_risk"],
            mould_risk=row["mould_risk"],
            score=row["score"],
            method=row["method"],
            model_version=row.get("model_version"),
            breakdown=row.get("breakdown") or {},
        )

    advisory = None
    if row.get("advisory_level") is not None:
        advisory = Advisory(level=row["advisory_level"], en=row["advisory_en"], ta=row["advisory_ta"])

    label = None
    if row.get("label_quality") or row.get("label_mould") or row.get("label_spoilage"):
        label = Label(
            quality=row.get("label_quality"),
            mould=row.get("label_mould"),
            spoilage=row.get("label_spoilage"),
            labelled_by=row.get("labelled_by"),
            reference=row.get("label_reference"),
            labelled_at=row.get("labelled_at"),
        )

    return Sample(
        sample_id=row["sample_id"],
        device_id=row["device_id"],
        created_at=row["created_at"],
        time_source=row["time_source"],
        feed_type=row["feed_type"],
        farm_id=row.get("farm_id"),
        readings=readings,
        image=ImageInfo(path=row.get("image_path"), received_at=row.get("image_received_at")),
        prediction=prediction,
        advisory=advisory,
        label=label,
        flags=SampleFlags(
            simulated=row.get("is_simulated", False),
            demo=row.get("is_demo", False),
            synced_from_offline=row.get("synced_from_offline", False),
        ),
    )


class LabelRequest(BaseModel):
    """What an expert sends to POST /api/silage/{sample_id}/label."""

    quality: Quality
    mould: Literal["Low", "High"] | None = None
    spoilage: SpoilageRisk | None = None
    labelled_by: str = Field(min_length=1, max_length=80)
    reference: str = Field(min_length=1, max_length=120)   # 'expert visual', 'lab report', ...


class HistoryPage(BaseModel):
    items: list[Sample]
    total: int
    page: int
    page_size: int


class BulkRequest(BaseModel):
    """Offline sync. Items are checked one by one, so one bad item never blocks the rest."""

    items: list[dict[str, Any]] = Field(min_length=1, max_length=50)


class BulkItemResult(BaseModel):
    sample_id: str | None
    # saved: stored now. duplicate: was already stored. rejected: will never be accepted (see detail).
    status: Literal["saved", "duplicate", "rejected"]
    detail: str | None = None


class BulkResponse(BaseModel):
    results: list[BulkItemResult]


class StatsSummary(BaseModel):
    total: int
    awaiting_readings: int          # photo received, readings not yet
    by_quality: dict[str, int]
    by_spoilage_risk: dict[str, int]
    by_mould_risk: dict[str, int]
    labelled: int
