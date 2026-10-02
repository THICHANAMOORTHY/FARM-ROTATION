"""Trains the readings model: pH, moisture, temperature, RGB, feed type -> quality or spoilage.

Run from dairyfeed-ai/ml, after export_dataset.py:
    python train_tabular.py --target quality
    python train_tabular.py --target spoilage

Refuses to train (exit code 2) if any class has fewer than min_samples_per_class samples.
"""

import argparse
from pathlib import Path
from typing import Any

import numpy as np

from common import (
    DATA_DIR,
    MODELS_DIR,
    TABULAR_FEATURES,
    NotEnoughData,
    check_enough_data,
    load_config,
    print_summary,
    read_dataset,
    tabular_features,
    train_and_save,
)


def build_xy(rows: list[dict[str, Any]], label_column: str) -> tuple[np.ndarray, np.ndarray, int]:
    """Rows -> (features, labels, number skipped). Skips rows without this label or a reading."""
    X, y, skipped = [], [], 0
    for row in rows:
        label = row.get(label_column)
        features = tabular_features(row)
        if not label or features is None:
            skipped += 1
            continue
        X.append(features)
        y.append(label)
    return np.array(X, dtype=float).reshape(-1, len(TABULAR_FEATURES)), np.array(y), skipped


def train(target: str, dataset: Path, models_dir: Path, config: dict[str, Any]) -> dict[str, Any]:
    spec = config["targets"][target]
    X, y, skipped = build_xy(read_dataset(dataset), spec["label_column"])
    counts = check_enough_data(list(y), spec["classes"], config["min_samples_per_class"])
    return train_and_save(
        f"tabular-{target}", X, y, target, spec["classes"], TABULAR_FEATURES, counts, skipped, config, models_dir
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--target", choices=["quality", "spoilage"], default="quality")
    parser.add_argument("--dataset", type=Path, default=DATA_DIR / "dataset.csv")
    args = parser.parse_args()
    try:
        metadata = train(args.target, args.dataset, MODELS_DIR, load_config())
    except NotEnoughData as error:
        print(f"REFUSED to train: {error}")
        raise SystemExit(2) from error
    print_summary(metadata, MODELS_DIR / metadata["model_version"])


if __name__ == "__main__":
    main()
