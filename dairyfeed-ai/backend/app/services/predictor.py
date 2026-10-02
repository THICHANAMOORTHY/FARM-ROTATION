"""Chooses how a sample is predicted: a trained ML model, or the rules.

For now there is no validated model, so this always uses the rules (method = "rules").
Phase 7 adds loading a model from ml/models/ — used ONLY if its metadata says it passed
validation; otherwise the rules are used, as now.
"""

from app.models.sample import Prediction, Readings
from app.services.scoring import score_sample


def predict(readings: Readings, mould_risk: str = "Unknown") -> Prediction:
    result = score_sample(readings, mould_risk)
    return Prediction(
        quality=result.quality,
        spoilage_risk=result.spoilage_risk,
        mould_risk=result.mould_risk,
        score=result.score,
        method="rules",
        model_version=None,
        breakdown=result.breakdown,
    )
