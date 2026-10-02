from app.config import Settings, get_settings
from app.main import app
from tests.conftest import DEVICE_KEY, good_request

HEADERS = {"X-Device-Key": DEVICE_KEY}


def test_health_reports_storage(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "memory"}


def test_missing_or_wrong_device_key_is_rejected(client):
    assert client.post("/api/silage/test", json=good_request()).status_code == 401
    wrong = client.post("/api/silage/test", json=good_request(), headers={"X-Device-Key": "nope"})
    assert wrong.status_code == 401
    assert wrong.json()["detail"] == "Invalid X-Device-Key."


def test_uploads_disabled_when_server_has_no_device_key(client):
    app.dependency_overrides[get_settings] = lambda: Settings(_env_file=None, device_api_key="")
    response = client.post("/api/silage/test", json=good_request(), headers=HEADERS)
    assert response.status_code == 503


def test_submit_test_returns_prediction_and_stores_it(client, repo):
    response = client.post("/api/silage/test", json=good_request(), headers=HEADERS)
    assert response.status_code == 200
    body = response.json()

    assert body["sample_id"] == "DF01-20261002T103015-0007"
    assert body["time_source"] == "server"
    assert body["prediction"]["quality"] == "Good"
    assert body["prediction"]["mould_risk"] == "Unknown"
    assert body["prediction"]["method"] == "rules"
    assert body["prediction"]["model_version"] is None
    assert body["prediction"]["breakdown"]["visual"] is None
    assert body["advisory"]["level"] == "ok"
    assert body["advisory"]["ta"]
    assert body["flags"] == {"simulated": False, "demo": False, "synced_from_offline": False}

    stored = repo.samples["DF01-20261002T103015-0007"]
    assert stored["ph"] == 4.0
    assert stored["score"] == body["prediction"]["score"]
    assert "DF01" in repo.devices


def test_device_time_is_used_when_ntp_synced(client):
    body = good_request(created_at="2026-10-02T10:30:15+05:30")
    response = client.post("/api/silage/test", json=body, headers=HEADERS)
    assert response.json()["time_source"] == "ntp"
    assert response.json()["created_at"].startswith("2026-10-02T10:30:15")


def test_simulated_flag_is_stored(client, repo):
    client.post("/api/silage/test", json=good_request(flags={"simulated": True}), headers=HEADERS)
    assert repo.samples["DF01-20261002T103015-0007"]["is_simulated"] is True


def test_invalid_input_gives_clear_422(client):
    bad_ph = good_request(readings={"ph": 15, "moisture_pct": 65, "sample_temp_c": 28, "ambient_temp_c": 27})
    assert client.post("/api/silage/test", json=bad_ph, headers=HEADERS).status_code == 422

    wrong_prefix = good_request(sample_id="DF02-20261002T103015-0007")
    response = client.post("/api/silage/test", json=wrong_prefix, headers=HEADERS)
    assert response.status_code == 422
    assert "must start with the device_id" in response.text


def test_retry_returns_the_first_result_unchanged(client):
    first = client.post("/api/silage/test", json=good_request(), headers=HEADERS).json()
    changed = good_request(readings={"ph": 5.5, "moisture_pct": 40, "sample_temp_c": 40, "ambient_temp_c": 27})
    second = client.post("/api/silage/test", json=changed, headers=HEADERS).json()
    assert second == first


def test_same_sample_id_from_another_device_is_a_conflict(client, repo):
    repo.save_sample({"sample_id": "DF01-x", "device_id": "OTHER", "created_at": "2026-10-02T10:00:00Z",
                      "time_source": "server", "feed_type": "other"})
    response = client.post("/api/silage/test", json=good_request(sample_id="DF01-x"), headers=HEADERS)
    assert response.status_code == 409


def test_readings_after_photo_use_the_photo_mould_risk(client, repo):
    # The camera node's photo arrived first and was judged High mould risk.
    repo.save_sample({"sample_id": "DF01-20261002T103015-0007", "device_id": "DF01",
                      "created_at": "2026-10-02T10:30:20Z", "time_source": "server", "feed_type": "other",
                      "image_path": "DF01/DF01-20261002T103015-0007.jpg", "mould_risk": "High"})
    body = client.post("/api/silage/test", json=good_request(), headers=HEADERS).json()
    assert body["prediction"]["mould_risk"] == "High"
    assert body["prediction"]["quality"] == "Poor"
    assert body["prediction"]["breakdown"]["visual"] == 0
    assert body["advisory"]["level"] == "danger"
    assert body["image"]["path"] == "DF01/DF01-20261002T103015-0007.jpg"
