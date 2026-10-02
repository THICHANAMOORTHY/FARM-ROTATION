import json
import random
import subprocess
import sys

import pytest
from conftest import ML_DIR, synthetic_photo, synthetic_rows

import train_image
import train_tabular
from common import NotEnoughData, check_enough_data
from export_dataset import write_dataset


def make_dataset(tmp_path, rows, images=None):
    return write_dataset(rows, images or {}, tmp_path / "data")


def test_refusal_names_every_short_class():
    with pytest.raises(NotEnoughData) as error:
        check_enough_data(["Good"] * 20 + ["Moderate"] * 4, ["Good", "Moderate", "Poor"], 15)
    message = str(error.value)
    assert "Moderate: 4" in message and "Poor: 0" in message and "Good" not in message.split("Short:")[1]


def test_tabular_refuses_with_too_few_samples(tmp_path, config):
    dataset = make_dataset(tmp_path, synthetic_rows(per_class=10))
    with pytest.raises(NotEnoughData):
        train_tabular.train("quality", dataset, tmp_path / "models", config)
    assert not (tmp_path / "models").exists()   # nothing is saved when training is refused


def test_tabular_cli_exits_2_and_says_refused(tmp_path):
    dataset = make_dataset(tmp_path, synthetic_rows(per_class=5))
    result = subprocess.run(
        [sys.executable, "train_tabular.py", "--dataset", str(dataset)], cwd=ML_DIR, capture_output=True, text=True
    )
    assert result.returncode == 2
    assert "REFUSED to train" in result.stdout


def test_tabular_trains_validates_and_saves(tmp_path, config):
    dataset = make_dataset(tmp_path, synthetic_rows(per_class=20))
    models = tmp_path / "models"
    metadata = train_tabular.train("quality", dataset, models, config)

    out = models / "tabular-quality-v1"
    assert (out / "model.joblib").exists()
    assert metadata["passed_validation"] is True
    assert metadata["class_counts"] == {"Good": 20, "Moderate": 20, "Poor": 20}
    metrics = json.loads((out / "metrics.json").read_text())
    assert set(metrics["per_class"]) == {"Good", "Moderate", "Poor"}
    assert metrics["confusion_matrix"]["labels"] == ["Good", "Moderate", "Poor"]
    assert len(metrics["confusion_matrix"]["matrix"]) == 3
    assert "ph" in metrics["feature_importance"]

    # A second run never overwrites the first.
    train_tabular.train("quality", dataset, models, config)
    assert (models / "tabular-quality-v2").exists()


def test_model_that_cannot_tell_classes_apart_fails_validation(tmp_path, config):
    rows = synthetic_rows(per_class=20)
    rng = random.Random(9)
    for row in rows:   # shuffle labels: the readings no longer say anything about quality
        row["label_quality"] = rng.choice(["Good", "Moderate", "Poor"])
    # keep at least 15 per class so training is allowed
    counts = {q: sum(r["label_quality"] == q for r in rows) for q in ("Good", "Moderate", "Poor")}
    assert min(counts.values()) >= 15
    metadata = train_tabular.train("quality", make_dataset(tmp_path, rows), tmp_path / "models", config)
    assert metadata["passed_validation"] is False
    assert metadata["failed_because"]


def test_rows_missing_rgb_are_skipped_and_counted(tmp_path, config):
    rows = synthetic_rows(per_class=20)
    rows[0]["rgb_r"] = None
    metadata = train_tabular.train("quality", make_dataset(tmp_path, rows), tmp_path / "models", config)
    assert metadata["samples"] == 59
    assert metadata["skipped_samples"] == 1


def test_spoilage_target(tmp_path, config):
    metadata = train_tabular.train("spoilage", make_dataset(tmp_path, synthetic_rows(20)), tmp_path / "models", config)
    assert metadata["classes"] == ["Low", "Medium", "High"]
    assert (tmp_path / "models" / "tabular-spoilage-v1").exists()


def test_image_model_refuses_then_learns_white_patches(tmp_path, config):
    rng = random.Random(4)
    rows = synthetic_rows(per_class=14)   # 42 rows
    images = {}
    for i, row in enumerate(rows):
        mouldy = i % 2 == 0
        row["label_mould"] = "High" if mouldy else "Low"
        images[row["sample_id"]] = synthetic_photo(mouldy, rng)

    few = make_dataset(tmp_path / "few", rows[:20], {k: images[k] for k in [r["sample_id"] for r in rows[:20]]})
    with pytest.raises(NotEnoughData):
        train_image.train(few, tmp_path / "models", config)

    metadata = train_image.train(make_dataset(tmp_path, rows, images), tmp_path / "models", config)
    assert metadata["class_counts"] == {"Low": 21, "High": 21}
    assert metadata["passed_validation"] is True
    assert (tmp_path / "models" / "image-mould-v1" / "model.joblib").exists()

