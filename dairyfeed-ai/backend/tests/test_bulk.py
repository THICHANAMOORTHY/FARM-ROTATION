from tests.conftest import DEVICE_KEY, good_request

HEADERS = {"X-Device-Key": DEVICE_KEY}


def test_bulk_needs_device_key(client):
    assert client.post("/api/silage/bulk", json={"items": [good_request()]}).status_code == 401


def test_bulk_saves_marks_offline_and_is_idempotent(client, repo):
    items = [good_request(sample_id=f"DF01-20261002T1030{i}-000{i}") for i in range(3)]
    first = client.post("/api/silage/bulk", json={"items": items}, headers=HEADERS).json()
    assert [r["status"] for r in first["results"]] == ["saved", "saved", "saved"]
    assert all(row["synced_from_offline"] for row in repo.samples.values())

    # The device didn't get the reply and sends the same batch again.
    again = client.post("/api/silage/bulk", json={"items": items}, headers=HEADERS).json()
    assert [r["status"] for r in again["results"]] == ["duplicate", "duplicate", "duplicate"]
    assert len(repo.samples) == 3


def test_one_bad_item_does_not_block_the_rest(client, repo):
    bad = good_request(sample_id="DF01-bad")
    bad["readings"] = {"ph": 99, "moisture_pct": 65, "sample_temp_c": 28, "ambient_temp_c": 27}
    items = [good_request(sample_id="DF01-a"), bad, {"no": "sample id"}, good_request(sample_id="DF01-b")]

    results = client.post("/api/silage/bulk", json={"items": items}, headers=HEADERS).json()["results"]
    assert [r["status"] for r in results] == ["saved", "rejected", "rejected", "saved"]
    assert results[1]["sample_id"] == "DF01-bad"
    assert "readings.ph" in results[1]["detail"]
    assert results[2]["sample_id"] is None
    assert set(repo.samples) == {"DF01-a", "DF01-b"}


def test_another_devices_sample_id_is_rejected(client, repo):
    repo.save_sample({"sample_id": "DF01-x", "device_id": "OTHER", "created_at": "2026-10-02T10:00:00+00:00",
                      "time_source": "server", "feed_type": "other"})
    results = client.post("/api/silage/bulk", json={"items": [good_request(sample_id="DF01-x")]},
                          headers=HEADERS).json()["results"]
    assert results[0]["status"] == "rejected"
    assert "already belongs to device OTHER" in results[0]["detail"]


def test_batch_size_is_limited(client):
    assert client.post("/api/silage/bulk", json={"items": []}, headers=HEADERS).status_code == 422
    items = [good_request(sample_id=f"DF01-{i}") for i in range(51)]
    assert client.post("/api/silage/bulk", json={"items": items}, headers=HEADERS).status_code == 422
