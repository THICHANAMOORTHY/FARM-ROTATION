"""Exports the training dataset from Supabase to ml/data/.

Only REAL, EXPERT-LABELLED samples are exported (CLAUDE.md section 7):
  - samples with flags.simulated or flags.demo are excluded,
  - samples without a label are excluded.

Output:
  ml/data/dataset.csv          one row per sample: readings + labels
  ml/data/images/<id>.jpg      the photo, when the sample has one

Run from dairyfeed-ai/ml:   python export_dataset.py
Uses SUPABASE_URL and SUPABASE_SERVICE_KEY from backend/.env.
"""

import csv
from pathlib import Path
from typing import Any

from common import DATA_DIR, ML_DIR

COLUMNS = [
    "sample_id", "device_id", "created_at", "feed_type",
    "ph", "moisture_pct", "sample_temp_c", "ambient_temp_c", "rgb_r", "rgb_g", "rgb_b",
    "image_file",
    "label_quality", "label_spoilage", "label_mould", "labelled_by", "label_reference",
]


def select_training_rows(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """Keep only real, labelled samples. Returns (kept rows, how many were dropped and why)."""
    kept = []
    dropped = {"simulated": 0, "demo": 0, "unlabelled": 0}
    for row in rows:
        if row.get("is_simulated"):
            dropped["simulated"] += 1
        elif row.get("is_demo"):
            dropped["demo"] += 1
        elif not row.get("label_quality"):
            dropped["unlabelled"] += 1
        else:
            kept.append(row)
    return kept, dropped


def write_dataset(rows: list[dict[str, Any]], images: dict[str, bytes], out_dir: Path) -> Path:
    """Writes dataset.csv and the images. `images` maps sample_id -> JPEG bytes."""
    image_dir = out_dir / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "dataset.csv"
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        for row in rows:
            image_file = ""
            if row["sample_id"] in images:
                image_file = f"images/{row['sample_id']}.jpg"
                (out_dir / image_file).write_bytes(images[row["sample_id"]])
            writer.writerow({**{c: row.get(c) for c in COLUMNS}, "image_file": image_file})
    return path


def fetch_from_supabase() -> tuple[list[dict[str, Any]], dict[str, bytes]]:
    from supabase import create_client

    from app.config import Settings

    settings = Settings(_env_file=ML_DIR.parent / "backend" / ".env")
    if not settings.supabase_enabled:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_KEY in backend/.env first.")
    client = create_client(settings.supabase_url, settings.supabase_service_key)

    # The database does the first filtering; select_training_rows() checks again.
    rows: list[dict[str, Any]] = []
    page = 1000
    while True:
        batch = (
            client.table("silage_samples").select("*")
            .eq("is_simulated", False).eq("is_demo", False).not_.is_("label_quality", "null")
            .order("id").range(len(rows), len(rows) + page - 1).execute().data
        )
        rows.extend(batch)
        if len(batch) < page:
            break

    images = {}
    for row in rows:
        if row.get("image_path"):
            images[row["sample_id"]] = client.storage.from_("silage-images").download(row["image_path"])
    return rows, images


def main() -> None:
    rows, images = fetch_from_supabase()
    kept, dropped = select_training_rows(rows)
    path = write_dataset(kept, images, DATA_DIR)
    print(f"Exported {len(kept)} real, labelled samples to {path}")
    print(f"  with photo: {sum(1 for r in kept if r['sample_id'] in images)}")
    print(f"  dropped: {dropped}")


if __name__ == "__main__":
    main()
