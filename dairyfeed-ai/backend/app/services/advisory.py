"""Builds the farmer advisory (English + Tamil) from app/advisory_templates.yaml."""

from functools import lru_cache
from pathlib import Path
from typing import Any

import yaml

from app.models.sample import Advisory, Readings
from app.services.scoring import load_config

TEMPLATES_PATH = Path(__file__).resolve().parent.parent / "advisory_templates.yaml"


@lru_cache
def load_templates(path: Path = TEMPLATES_PATH) -> dict[str, Any]:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def advisory_level(quality: str, spoilage_risk: str, mould_risk: str) -> str:
    if quality == "Poor" or spoilage_risk == "High" or mould_risk == "High":
        return "danger"
    if quality == "Moderate" or spoilage_risk == "Medium":
        return "warn"
    return "ok"


def triggered_tips(readings: Readings, mould_risk: str, config: dict[str, Any]) -> list[str]:
    """Which tips apply, in the order they are shown. Uses the 'ideal' ranges from scoring_config.yaml."""
    tips = []
    ph_min, ph_max = config["ph"]["ideal"]
    if readings.ph > ph_max:
        tips.append("ph_high")
    elif readings.ph < ph_min:
        tips.append("ph_low")

    moisture_min, moisture_max = config["moisture_pct"]["ideal"]
    if readings.moisture_pct < moisture_min:
        tips.append("moisture_low")
    elif readings.moisture_pct > moisture_max:
        tips.append("moisture_high")

    if readings.sample_temp_c - readings.ambient_temp_c > config["temperature_rise_c"]["ideal_max"]:
        tips.append("heating")

    if mould_risk == "High":
        tips.append("mould_high")
    elif mould_risk == "Unknown":
        tips.append("mould_unknown")
    return tips


def build_advisory(readings: Readings, quality: str, spoilage_risk: str, mould_risk: str) -> Advisory:
    templates = load_templates()
    level = advisory_level(quality, spoilage_risk, mould_risk)
    parts = [templates["level"][level]]
    parts += [templates["tips"][tip] for tip in triggered_tips(readings, mould_risk, load_config())]
    parts.append(templates["footer"])
    return Advisory(
        level=level,
        en=" ".join(part["en"] for part in parts),
        ta=" ".join(part["ta"] for part in parts),
    )
