from tests.conftest import DEVICE_KEY, JPEG, good_request

HEADERS = {"X-Device-Key": DEVICE_KEY}
SAMPLE_ID = "DF01-20261002T103015-0007"


def upload(client, data=JPEG, sample_id=SAMPLE_ID, headers=HEADERS):
    return client.post(
        "/api/image/analyze",
        data={"sample_id": sample_id},
        files={"image": ("photo.jpg", data, "image/jpeg")},
        headers=headers,
    )


def test_photo_needs_device_key(client):
    assert upload(client, headers={}).status_code == 401


def test_photo_after_readings_is_stored_and_mould_stays_unknown(client, repo):
    client.post("/api/silage/test", json=good_request(), headers=HEADERS)
    response = upload(client)
    assert response.status_code == 200
    body = response.json()
    assert body["image"]["path"] == f"DF01/{SAMPLE_ID}.jpg"
    assert body["image"]["received_at"] is not None
    assert body["prediction"]["mould_risk"] == "Unknown"   # no image model yet: never guessed
    assert body["prediction"]["breakdown"]["visual"] is None
    assert repo.images[f"DF01/{SAMPLE_ID}.jpg"] == JPEG


def test_photo_before_readings_creates_a_waiting_sample(client):
    body = upload(client).json()
    assert body["device_id"] == "DF01"
    assert body["readings"] is None
    assert body["prediction"] is None   # nothing to score until the readings arrive

    after = client.post("/api/silage/test", json=good_request(), headers=HEADERS).json()
    assert after["prediction"]["quality"] == "Good"
    assert after["image"]["path"] == f"DF01/{SAMPLE_ID}.jpg"


def test_second_photo_for_same_sample_is_ignored(client, repo):
    upload(client)
    upload(client, data=JPEG + b"different")
    assert repo.images[f"DF01/{SAMPLE_ID}.jpg"] == JPEG


def test_non_jpeg_and_oversized_photos_are_rejected(client):
    assert upload(client, data=b"\x89PNG not a jpeg").status_code == 415
    assert upload(client, data=JPEG + b"x" * 6000).status_code == 413   # test limit is 5000 bytes


def test_bad_sample_id_is_rejected(client):
    assert upload(client, sample_id="no-device-prefix!").status_code == 422
    assert upload(client, sample_id="DF01").status_code == 422


def test_image_endpoint_streams_the_photo(client):
    client.post("/api/silage/test", json=good_request(), headers=HEADERS)
    assert client.get(f"/api/silage/{SAMPLE_ID}/image").status_code == 404   # no photo yet
    upload(client)
    response = client.get(f"/api/silage/{SAMPLE_ID}/image")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert response.content == JPEG
