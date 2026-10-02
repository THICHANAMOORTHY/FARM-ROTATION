"""Trains the mould model from sample photos labelled by experts.

Each photo is reduced to simple colour statistics (backend/app/services/features.py), and a
random forest learns from the expert mould labels which patterns mean mould.

Run from dairyfeed-ai/ml, after export_dataset.py:
    python train_image.py

Refuses to train (exit code 2) if Low or High mould has fewer than min_samples_per_class photos.
"""

import argparse
from pathlib import Path
from typing import Any

import numpy as np

from common import (
    DATA_DIR,
    IMAGE_FEATURES,
    MODELS_DIR,
    NotEnoughData,
    check_enough_data,
    image_features,
    load_config,
    print_summary,
    read_dataset,
    train_and_save,
)


def build_xy(rows: list[dict[str, Any]], data_dir: Path) -> tuple[np.ndarray, np.ndarray, int]:
    """Rows -> (features, mould labels, number skipped). Skips rows without a photo or mould label."""
    X, y, skipped = [], [], 0
    for row in rows:
        image = data_dir / row["image_file"] if row.get("image_file") else None
        if not row.get("label_mould") or image is None or not image.exists():
            skipped += 1
            continue
        X.append(image_features(image.read_bytes()))
        y.append(row["label_mould"])
    return np.array(X, dtype=float).reshape(-1, len(IMAGE_FEATURES)), np.array(y), skipped


def train(dataset: Path, models_dir: Path, config: dict[str, Any]) -> dict[str, Any]:
    spec = config["targets"]["mould"]
    X, y, skipped = build_xy(read_dataset(dataset), dataset.parent)
    counts = check_enough_data(list(y), spec["classes"], config["min_samples_per_class"])
    return train_and_save("image-mould", X, y, "mould", spec["classes"], IMAGE_FEATURES, counts, skipped, config, models_dir)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dataset", type=Path, default=DATA_DIR / "dataset.csv")
    args = parser.parse_args()
    try:
        metadata = train(args.dataset, MODELS_DIR, load_config())
    except NotEnoughData as error:
        print(f"REFUSED to train: {error}")
        raise SystemExit(2) from error
    print_summary(metadata, MODELS_DIR / metadata["model_version"])


if __name__ == "__main__":
    main()
