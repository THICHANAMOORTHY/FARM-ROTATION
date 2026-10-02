"""Chooses how a sample is predicted: trained ML models, or the rules.

A model is used ONLY if its metadata.json says passed_validation: true AND it was trained on
the same inputs the backend computes now (features.py). Otherwise the rules are used.

What a validated model replaces:
  - tabular-quality  -> quality
  - tabular-spoilage -> spoilage risk
  - image-mould      -> mould risk (see image_analysis.py; without it mould stays Unknown)
The 0-100 score and its breakdown always come from the rules, so every result can be explained.
The safety caps (high spoilage -> at best Moderate, likely mould -> Poor) apply in every case.

Models are loaded once. After training a new model, restart the backend.
"""

import json
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib

from app.config import get_settings
from app.models.sample import Prediction, row_to_sample
from app.services.features import IMAGE_FEATURES, TABULAR_FEATURES, tabular_features
from app.services.scoring import apply_quality_caps, load_config, score_sample

log = logging.getLogger(__name__)

DEFAULT_MODELS_DIR = Path(__file__).resolve().parents[3] / "ml" / "models"
EXPECTED_FEATURES = {"tabular-quality": TABULAR_FEATURES, "tabular-spoilage": TABULAR_FEATURES, "image-mould": IMAGE_FEATURES}


def models_dir() -> Path:
    configured = get_settings().ml_models_dir
    return Path(configured) if configured else DEFAULT_MODELS_DIR


@lru_cache
def load_validated_model(directory: str, name: str) -> tuple[Any, str] | None:
    """Newest <name>-vN in `directory` that passed validation. Returns (model, version) or None."""
    candidates = []
    for path in Path(directory).glob(f"{name}-v*"):
        suffix = path.name.rsplit("-v", 1)[1]
        if suffix.isdigit() and (path / "metadata.json").exists() and (path / "model.joblib").exists():
            candidates.append((int(suffix), path))
    for _, path in sorted(candidates, reverse=True):
        metadata = json.loads((path / "metadata.json").read_text())
        if not metadata.get("passed_validation"):
            continue
        if metadata.get("features") != EXPECTED_FEATURES[name]:
            log.warning("Ignoring %s: trained on different inputs than features.py computes now", path.name)
            continue
        log.info("Using model %s", metadata["model_version"])
        return joblib.load(path / "model.joblib"), metadata["model_version"]
    return None


def get_model(name: str) -> tuple[Any, str] | None:
    return load_validated_model(str(models_dir()), name)


def predict(row: dict[str, Any], mould_risk: str = "Unknown") -> Prediction:
    """Prediction for a sample row that has readings. mould_risk comes from the photo (or Unknown)."""
    readings = row_to_sample(row).readings
    rules = score_sample(readings, mould_risk)
    quality, spoilage = rules.quality, rules.spoilage_risk
    versions = []

    features = tabular_features(row)
    if features is not None:  # models need every input, including RGB
        quality_model = get_model("tabular-quality")
        if quality_model:
            quality = str(quality_model[0].predict([features])[0])
            versions.append(quality_model[1])
        spoilage_model = get_model("tabular-spoilage")
        if spoilage_model:
            spoilage = str(spoilage_model[0].predict([features])[0])
            versions.append(spoilage_model[1])
    if row.get("mould_model_version"):
        versions.append(row["mould_model_version"])

    return Prediction(
        quality=apply_quality_caps(quality, spoilage, mould_risk, load_config()),
        spoilage_risk=spoilage,
        mould_risk=mould_risk,
        score=rules.score,
        method="ml" if versions else "rules",
        model_version=", ".join(versions) if versions else None,
        breakdown=rules.breakdown,
    )
