import csv
import random

from conftest import synthetic_row
from export_dataset import COLUMNS, select_training_rows, write_dataset


def test_only_real_labelled_samples_are_kept():
    rng = random.Random(1)
    rows = [
        synthetic_row(1, "Good", rng),
        synthetic_row(2, "Good", rng, is_simulated=True),
        synthetic_row(3, "Poor", rng, is_demo=True),
        synthetic_row(4, "Poor", rng, label_quality=None),
        synthetic_row(5, "Moderate", rng),
    ]
    kept, dropped = select_training_rows(rows)
    assert [r["sample_id"] for r in kept] == ["T01-00001", "T01-00005"]
    assert dropped == {"simulated": 1, "demo": 1, "unlabelled": 1}


def test_simulated_is_dropped_even_when_labelled_and_also_demo():
    rng = random.Random(2)
    kept, _ = select_training_rows([synthetic_row(1, "Good", rng, is_simulated=True, is_demo=True)])
    assert kept == []


def test_dataset_and_images_are_written(tmp_path):
    rng = random.Random(3)
    rows = [synthetic_row(1, "Good", rng), synthetic_row(2, "Poor", rng)]
    path = write_dataset(rows, {"T01-00002": b"\xff\xd8\xffjpeg"}, tmp_path)
    with open(path, newline="") as f:
        written = list(csv.DictReader(f))
    assert list(written[0]) == COLUMNS
    assert written[0]["image_file"] == ""
    assert written[1]["image_file"] == "images/T01-00002.jpg"
    assert (tmp_path / "images" / "T01-00002.jpg").read_bytes() == b"\xff\xd8\xffjpeg"
    assert "is_simulated" not in written[0]   # flags are not training inputs
