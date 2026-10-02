import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.db import InMemoryRepository, get_repository
from app.main import app

DEVICE_KEY = "test-device-key"
ADMIN_TOKEN = "test-admin-token"
JPEG = b"\xff\xd8\xff\xe0" + b"fake jpeg body"


@pytest.fixture(autouse=True)
def no_trained_models(tmp_path, monkeypatch):
    """Every test starts with an empty models folder, so results never depend on what's in ml/models.
    Tests that need a model write one into this folder."""
    from app.services import predictor

    folder = tmp_path / "models"
    folder.mkdir()
    monkeypatch.setattr(predictor, "models_dir", lambda: folder)
    predictor.load_validated_model.cache_clear()
    yield folder
    predictor.load_validated_model.cache_clear()


@pytest.fixture
def repo() -> InMemoryRepository:
    return InMemoryRepository()


@pytest.fixture
def client(repo: InMemoryRepository):
    """An API client using in-memory storage and a known device key. No Supabase needed."""
    app.dependency_overrides[get_repository] = lambda: repo
    app.dependency_overrides[get_settings] = lambda: Settings(
        _env_file=None, device_api_key=DEVICE_KEY, admin_token=ADMIN_TOKEN, max_image_bytes=5000
    )
    yield TestClient(app)
    app.dependency_overrides.clear()


def good_request(**overrides) -> dict:
    """A well-fermented sample. Tests change only the fields they care about."""
    body = {
        "sample_id": "DF01-20261002T103015-0007",
        "device_id": "DF01",
        "feed_type": "maize_silage",
        "readings": {"ph": 4.0, "moisture_pct": 65.0, "sample_temp_c": 28.0, "ambient_temp_c": 27.0},
    }
    body.update(overrides)
    return body
