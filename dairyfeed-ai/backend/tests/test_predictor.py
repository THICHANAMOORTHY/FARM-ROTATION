"""The backend uses a trained model only when it passed validation and matches today's inputs."""

import json
from io import BytesIO

import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import RandomForestClassifier

from app.services.features import IMAGE_FEATURES, TABULAR_FEATURES, image_features
from app.services.image_analysis import mould_risk_from_image
from app.services.predictor import load_validated_model, predict

GOOD_ROW = {
    "sample_id": "DF01-1", "device_id": "DF01", "created_at": "2026-10-02T10:00:00+00:00",
    "time_source": "server", "feed_type": "maize_silage",
    "ph": 4.0, "moisture_pct": 65.0, "sample_temp_c": 28.0, "ambient_temp_c": 27.0,
    "rgb_r": 120, "rgb_g": 110, "rgb_b": 40,
}


def save_model(folder, name, version, label, features, passed=True):
    """A tiny model that always answers `label`, saved like ml/common.py does."""
    out = folder / f"{name}-v{version}"
    out.mkdir()
    model = RandomForestClassifier(n_estimators=1, random_state=0).fit(np.zeros((2, len(features))), [label, label])
    joblib.dump(model, out / "model.joblib")
    metadata = {"model_version": f"{name}-v{version}", "features": features, "passed_validation": passed}
    (out / "metadata.json").write_text(json.dumps(metadata))


def test_no_model_means_rules(no_trained_models):
    p = predict(GOOD_ROW)
    assert (p.method, p.model_version, p.quality) == ("rules", None, "Good")


def test_validated_quality_model_is_used(no_trained_models):
    save_model(no_trained_models, "tabular-quality", 1, "Moderate", TABULAR_FEATURES)
    p = predict(GOOD_ROW)
    assert p.quality == "Moderate"
    assert p.method == "ml"
    assert p.model_version == "tabular-quality-v1"
    assert p.score == 100                      # score and breakdown always come from the rules
    assert p.breakdown["ph"] == 40


def test_newest_passing_version_wins_and_failed_ones_are_ignored(no_trained_models):
    save_model(no_trained_models, "tabular-quality", 1, "Moderate", TABULAR_FEATURES)
    save_model(no_trained_models, "tabular-quality", 2, "Poor", TABULAR_FEATURES)
    save_model(no_trained_models, "tabular-quality", 3, "Good", TABULAR_FEATURES, passed=False)
    p = predict(GOOD_ROW)
    assert (p.quality, p.model_version) == ("Poor", "tabular-quality-v2")


def test_model_trained_on_other_inputs_is_ignored(no_trained_models):
    save_model(no_trained_models, "tabular-quality", 1, "Poor", TABULAR_FEATURES[:-1])
    assert predict(GOOD_ROW).method == "rules"


def test_missing_rgb_falls_back_to_rules(no_trained_models):
    save_model(no_trained_models, "tabular-quality", 1, "Poor", TABULAR_FEATURES)
    assert predict({**GOOD_ROW, "rgb_r": None}).method == "rules"


def test_spoilage_model_and_safety_caps(no_trained_models):
    save_model(no_trained_models, "tabular-quality", 1, "Good", TABULAR_FEATURES)
    save_model(no_trained_models, "tabular-spoilage", 1, "High", TABULAR_FEATURES)
    p = predict(GOOD_ROW)
    assert p.spoilage_risk == "High"
    assert p.quality == "Moderate"             # high spoilage caps a "Good" model answer
    assert p.model_version == "tabular-quality-v1, tabular-spoilage-v1"
    assert predict(GOOD_ROW, mould_risk="High").quality == "Poor"   # likely mould is always Poor


def jpeg(colour):
    buffer = BytesIO()
    Image.new("RGB", (64, 64), colour).save(buffer, "JPEG")
    return buffer.getvalue()


def test_image_model_only_when_validated(no_trained_models):
    assert mould_risk_from_image(jpeg((140, 130, 50))) == ("Unknown", None)
    save_model(no_trained_models, "image-mould", 1, "High", IMAGE_FEATURES)
    load_validated_model.cache_clear()   # models load once; in real use, restart the backend after training
    assert mould_risk_from_image(jpeg((140, 130, 50))) == ("High", "image-mould-v1")


def test_unreadable_photo_stays_unknown(no_trained_models):
    save_model(no_trained_models, "image-mould", 1, "High", IMAGE_FEATURES)
    assert mould_risk_from_image(b"\xff\xd8\xff not really a jpeg") == ("Unknown", None)


def test_image_features_see_white_patches():
    plain = image_features(jpeg((140, 130, 50)))
    white = image_features(jpeg((250, 250, 250)))
    i = IMAGE_FEATURES.index("white_fraction")
    assert plain[i] < 0.05 and white[i] > 0.9
