from typing import Any

from fastapi import APIRouter

from app.services.scoring import load_config

router = APIRouter(prefix="/api/scoring", tags=["scoring"])


@router.get("")
def scoring_settings() -> dict[str, Any]:
    """Weights and ideal ranges from scoring_config.yaml, so the dashboard never copies them."""
    config = load_config()
    return {
        "weights": config["weights"],
        "ideal": {
            "ph": config["ph"]["ideal"],
            "moisture_pct": config["moisture_pct"]["ideal"],
            "temperature_rise_max_c": config["temperature_rise_c"]["ideal_max"],
        },
        "provisional": True,
    }
