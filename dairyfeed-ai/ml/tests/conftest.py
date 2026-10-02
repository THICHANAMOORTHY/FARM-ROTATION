import random
import sys
from io import BytesIO
from pathlib import Path

import pytest
from PIL import Image

ML_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_DIR))

# ------------------------------------------------------------------------------------------
# SYNTHETIC DATA — FOR TESTS ONLY (CLAUDE.md section 7 allows it for unit tests).
# It is written only to pytest's temporary folders, never to ml/data or ml/models.
# ------------------------------------------------------------------------------------------

QUALITY_PROFILES = {
    "Good": {"ph": (3.8, 4.3), "moisture": (62, 68), "rise": (0, 1.5), "spoilage": "Low"},
    "Moderate": {"ph": (4.6, 4.9), "moisture": (56, 60), "rise": (3, 4.5), "spoilage": "Medium"},
    "Poor": {"ph": (5.3, 6.0), "moisture": (45, 52), "rise": (7, 10), "spoilage": "High"},
}


def synthetic_row(i: int, quality: str, rng: random.Random, **overrides) -> dict:
    p = QUALITY_PROFILES[quality]
    ambient = rng.uniform(25, 32)
    row = {
        "sample_id": f"T01-{i:05d}", "device_id": "T01", "created_at": "2026-10-02T10:00:00+00:00",
        "feed_type": "maize_silage",
        "ph": round(rng.uniform(*p["ph"]), 2), "moisture_pct": round(rng.uniform(*p["moisture"]), 1),
        "sample_temp_c": round(ambient + rng.uniform(*p["rise"]), 1), "ambient_temp_c": round(ambient, 1),
        "rgb_r": rng.randint(100, 150), "rgb_g": rng.randint(90, 140), "rgb_b": rng.randint(30, 60),
        "label_quality": quality, "label_spoilage": p["spoilage"], "label_mould": None,
        "labelled_by": "test", "label_reference": "synthetic test data",
        "is_simulated": False, "is_demo": False,
    }
    row.update(overrides)
    return row


def synthetic_rows(per_class: int, seed: int = 0) -> list[dict]:
    rng = random.Random(seed)
    return [synthetic_row(i * 3 + k, q, rng) for i in range(per_class) for k, q in enumerate(QUALITY_PROFILES)]


def synthetic_photo(mouldy: bool, rng: random.Random) -> bytes:
    """Olive 'silage' picture; mouldy ones get white patches."""
    img = Image.new("RGB", (96, 96), (rng.randint(120, 150), rng.randint(110, 135), rng.randint(35, 60)))
    if mouldy:
        for _ in range(rng.randint(3, 6)):
            x, y, size = rng.randint(0, 70), rng.randint(0, 70), rng.randint(12, 24)
            img.paste((245, 245, 240), (x, y, x + size, y + size))
    buffer = BytesIO()
    img.save(buffer, "JPEG")
    return buffer.getvalue()


@pytest.fixture
def config():
    from common import load_config

    return load_config()
