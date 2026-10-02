import random

from scripts.simulate_device import PROFILES, make_sample, run
from tests.conftest import DEVICE_KEY


def test_every_simulated_sample_is_flagged(client, repo):
    run(client, DEVICE_KEY, count=12, devices=["DF01", "DF02"], seed=1)
    assert len(repo.samples) == 12
    assert all(row["is_simulated"] for row in repo.samples.values())
    assert {row["device_id"] for row in repo.samples.values()} == {"DF01", "DF02"}


def test_photos_are_attached_and_mould_stays_unknown(client, repo):
    run(client, DEVICE_KEY, count=3, seed=2)
    assert len(repo.images) == 3
    assert all(row["mould_risk"] == "Unknown" for row in repo.samples.values())


def test_offline_mode_uses_bulk_sync(client, repo):
    results = run(client, DEVICE_KEY, count=60, offline=True, photo=False, seed=3)  # two batches
    assert len(results) == 60
    assert {r["status"] for r in results} == {"saved"}
    assert all(row["synced_from_offline"] for row in repo.samples.values())


def test_profiles_produce_the_expected_quality(client):
    good = run(client, DEVICE_KEY, count=10, profile="good", photo=False, seed=4)
    poor = run(client, DEVICE_KEY, count=10, profile="poor", photo=False, seed=5)
    assert {r["prediction"]["quality"] for r in good} == {"Good"}
    assert {r["prediction"]["quality"] for r in poor} == {"Poor"}


def test_samples_match_the_firmware_shape():
    rng = random.Random(6)
    from datetime import datetime, timezone

    sample = make_sample("DF01", datetime(2026, 10, 2, 10, 30, 15, tzinfo=timezone.utc), 7, "good", rng)
    assert sample["sample_id"] == "DF01-20261002T103015-0007"
    low, high = PROFILES["good"]["ph"]
    assert low <= sample["readings"]["ph"] <= high
    assert set(sample["readings"]["rgb"]) == {"r", "g", "b"}
    assert sample["flags"] == {"simulated": True}
