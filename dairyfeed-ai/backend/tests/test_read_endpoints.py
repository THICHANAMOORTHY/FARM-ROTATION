from tests.conftest import ADMIN_TOKEN, DEVICE_KEY, good_request

HEADERS = {"X-Device-Key": DEVICE_KEY}
ADMIN = {"X-Admin-Token": ADMIN_TOKEN}
BAD_READINGS = {"ph": 5.3, "moisture_pct": 80, "sample_temp_c": 35, "ambient_temp_c": 27}


def add(client, sample_id, created_at, **overrides):
    body = good_request(sample_id=sample_id, created_at=created_at, **overrides)
    assert client.post("/api/silage/test", json=body, headers=HEADERS).status_code == 200


def seed(client):
    add(client, "DF01-1", "2026-10-01T08:00:00+00:00")
    add(client, "DF01-2", "2026-10-02T08:00:00+00:00", readings=BAD_READINGS, farm_id="farm-a")
    add(client, "DF02-1", "2026-10-03T08:00:00+00:00", device_id="DF02", feed_type="napier_silage")


def test_history_is_newest_first_and_paginated(client):
    seed(client)
    page1 = client.get("/api/silage/history?page_size=2").json()
    assert page1["total"] == 3
    assert [s["sample_id"] for s in page1["items"]] == ["DF02-1", "DF01-2"]
    page2 = client.get("/api/silage/history?page_size=2&page=2").json()
    assert [s["sample_id"] for s in page2["items"]] == ["DF01-1"]


def test_history_filters(client):
    seed(client)

    def ids(query):
        return [s["sample_id"] for s in client.get(f"/api/silage/history?{query}").json()["items"]]

    assert ids("device_id=DF01") == ["DF01-2", "DF01-1"]
    assert ids("farm_id=farm-a") == ["DF01-2"]
    assert ids("feed_type=napier_silage") == ["DF02-1"]
    assert ids("date_from=2026-10-02T00:00:00&date_to=2026-10-02T23:59:59") == ["DF01-2"]
    assert client.get("/api/silage/history?feed_type=rice").status_code == 422
    assert client.get("/api/silage/history?page_size=101").status_code == 422


def test_detail_and_advisory(client):
    seed(client)
    detail = client.get("/api/silage/DF01-2").json()
    assert detail["readings"]["ph"] == 5.3
    assert detail["farm_id"] == "farm-a"

    advisory = client.get("/api/advisory/DF01-2").json()
    assert advisory == detail["advisory"]
    assert advisory["level"] == "danger"

    assert client.get("/api/silage/DF09-404").status_code == 404
    assert client.get("/api/advisory/DF09-404").status_code == 404


def test_advisory_waits_for_readings(client):
    client.post("/api/image/analyze", data={"sample_id": "DF01-photo"},
                files={"image": ("p.jpg", b"\xff\xd8\xff\xe0x", "image/jpeg")}, headers=HEADERS)
    response = client.get("/api/advisory/DF01-photo")
    assert response.status_code == 404
    assert "readings not received" in response.json()["detail"]


def test_labelling_needs_admin_token_and_keeps_prediction(client):
    seed(client)
    label = {"quality": "Poor", "mould": "High", "labelled_by": "Dr. Expert", "reference": "expert visual"}
    assert client.post("/api/silage/DF01-1/label", json=label).status_code == 401
    assert client.post("/api/silage/DF01-1/label", json=label, headers={"X-Admin-Token": "nope"}).status_code == 401
    assert client.post("/api/silage/DF09-404/label", json=label, headers=ADMIN).status_code == 404

    body = client.post("/api/silage/DF01-1/label", json=label, headers=ADMIN).json()
    assert body["label"]["quality"] == "Poor"
    assert body["label"]["mould"] == "High"
    assert body["label"]["spoilage"] is None
    assert body["label"]["labelled_at"] is not None
    assert body["prediction"]["quality"] == "Good"   # the device's prediction is not changed


def test_label_needs_quality_and_who_labelled(client):
    seed(client)
    response = client.post("/api/silage/DF01-1/label", json={"quality": "Poor"}, headers=ADMIN)
    assert response.status_code == 422


def test_stats_summary(client):
    seed(client)
    client.post("/api/image/analyze", data={"sample_id": "DF01-photo"},
                files={"image": ("p.jpg", b"\xff\xd8\xff\xe0x", "image/jpeg")}, headers=HEADERS)
    client.post("/api/silage/DF01-1/label", headers=ADMIN,
                json={"quality": "Good", "labelled_by": "Dr. Expert", "reference": "lab report"})

    stats = client.get("/api/stats/summary").json()
    assert stats["total"] == 4
    assert stats["awaiting_readings"] == 1
    assert stats["by_quality"] == {"Good": 2, "Moderate": 0, "Poor": 1}
    assert stats["by_spoilage_risk"] == {"Low": 2, "Medium": 0, "High": 1}
    assert stats["by_mould_risk"] == {"Low": 0, "High": 0, "Unknown": 4}
    assert stats["labelled"] == 1

    only_df02 = client.get("/api/stats/summary?device_id=DF02").json()
    assert only_df02["total"] == 1
    assert only_df02["by_quality"]["Good"] == 1
