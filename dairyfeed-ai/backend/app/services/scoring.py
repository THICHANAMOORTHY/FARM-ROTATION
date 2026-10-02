"""Rule-based silage score. Always available, even with zero training data.

Every threshold and weight comes from app/scoring_config.yaml — none are written here.
"""

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

from app.models.sample import Readings

CONFIG_PATH = Path(__file__).resolve().parent.parent / "scoring_config.yaml"


@lru_cache
def load_config(path: Path = CONFIG_PATH) -> dict[str, Any]:
    with open(path, encoding="utf-8") as f:
        config = yaml.safe_load(f)
    total = sum(config["weights"].values())
    if total != 100:
        raise ValueError(f"scoring_config.yaml: weights must add up to 100, got {total}")
    return config


@dataclass
class RuleResult:
    quality: str          # Good / Moderate / Poor
    spoilage_risk: str    # Low / Medium / High
    mould_risk: str       # Low / High / Unknown
    score: int            # 0-100
    breakdown: dict[str, int | None]


def interpolate(points: list[list[float]], x: float) -> float:
    """Read a fraction (0-1) off a curve of [reading, fraction] points.

    Example: points [[3.8, 1.0], [4.8, 0.0]] and x = 4.3 gives 0.5 (halfway).
    """
    if x <= points[0][0]:
        return points[0][1]
    if x >= points[-1][0]:
        return points[-1][1]
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        if x1 <= x <= x2:
            return y1 + (y2 - y1) * (x - x1) / (x2 - x1)
    raise ValueError("points must be sorted by reading")  # unreachable for a sorted list


def spoilage_risk(ph: float, temperature_rise: float, config: dict[str, Any]) -> str:
    rules = config["spoilage_risk"]
    if ph > rules["high"]["ph_above"] or temperature_rise > rules["high"]["temperature_rise_above"]:
        return "High"
    if ph > rules["medium"]["ph_above"] or temperature_rise > rules["medium"]["temperature_rise_above"]:
        return "Medium"
    return "Low"


def quality_from_score(score: int, spoilage: str, mould: str, config: dict[str, Any]) -> str:
    bands = config["quality"]
    if score >= bands["good_min"]:
        quality = "Good"
    elif score >= bands["moderate_min"]:
        quality = "Moderate"
    else:
        quality = "Poor"

    # Caps: some findings limit the quality whatever the score.
    order = ["Poor", "Moderate", "Good"]
    caps = config["quality_caps"]
    if spoilage == "High":
        quality = min(quality, caps["spoilage_high"], key=order.index)
    if mould == "High":
        quality = min(quality, caps["mould_high"], key=order.index)
    return quality


def score_sample(readings: Readings, mould_risk: str = "Unknown", config: dict[str, Any] | None = None) -> RuleResult:
    """Score one sample.

    mould_risk comes from the photo ("Low" or "High"), or "Unknown" if there is no photo yet.
    """
    config = config or load_config()
    weights = config["weights"]
    temperature_rise = readings.sample_temp_c - readings.ambient_temp_c

    fractions: dict[str, float | None] = {
        "ph": interpolate(config["ph"]["points"], readings.ph),
        "moisture": interpolate(config["moisture_pct"]["points"], readings.moisture_pct),
        "temperature": interpolate(config["temperature_rise_c"]["points"], temperature_rise),
        "visual": config["visual"][mould_risk] if mould_risk != "Unknown" else None,
    }

    # Points per component. A component with no data (visual without a photo) is left out,
    # and the score is scaled over the weights that are available.
    breakdown: dict[str, int | None] = {}
    earned = 0.0
    available = 0
    for name, fraction in fractions.items():
        if fraction is None:
            breakdown[name] = None
            continue
        points = fraction * weights[name]
        breakdown[name] = round(points)
        earned += points
        available += weights[name]

    score = round(earned / available * 100)
    spoilage = spoilage_risk(readings.ph, temperature_rise, config)
    quality = quality_from_score(score, spoilage, mould_risk, config)
    return RuleResult(
        quality=quality,
        spoilage_risk=spoilage,
        mould_risk=mould_risk,
        score=score,
        breakdown=breakdown,
    )
