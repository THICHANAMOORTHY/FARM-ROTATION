import pytest

from app.models.sample import Readings
from app.services.advisory import advisory_level, build_advisory, load_templates

GOOD = Readings(ph=4.0, moisture_pct=65, sample_temp_c=28, ambient_temp_c=27)


def all_templates() -> list[dict]:
    templates = load_templates()
    return [*templates["level"].values(), *templates["tips"].values(), templates["footer"]]


def test_every_template_has_english_and_tamil():
    for template in all_templates():
        assert template["en"].strip()
        assert template["ta"].strip()


@pytest.mark.parametrize("word", ["toxin", "aflatoxin", "mycotoxin", "protein", "fibre", "fiber"])
def test_no_template_claims_lab_level_detection(word):
    for template in all_templates():
        assert word not in template["en"].lower()


@pytest.mark.parametrize(
    ("quality", "spoilage", "mould", "expected"),
    [
        ("Good", "Low", "Unknown", "ok"),
        ("Good", "Low", "Low", "ok"),
        ("Moderate", "Low", "Unknown", "warn"),
        ("Good", "Medium", "Unknown", "warn"),
        ("Poor", "Low", "Unknown", "danger"),
        ("Moderate", "High", "Unknown", "danger"),
        ("Good", "Low", "High", "danger"),
    ],
)
def test_advisory_level(quality, spoilage, mould, expected):
    assert advisory_level(quality, spoilage, mould) == expected


def test_danger_always_says_do_not_feed_until_checked():
    advisory = build_advisory(GOOD, "Poor", "High", "Unknown")
    assert advisory.level == "danger"
    assert "Do not feed until it is checked by a veterinarian" in advisory.en
    assert "கால்நடை மருத்துவர்" in advisory.ta


def test_good_sample_without_photo_reminds_to_check_for_mould():
    advisory = build_advisory(GOOD, "Good", "Low", "Unknown")
    assert advisory.level == "ok"
    assert "No photo yet" in advisory.en
    assert advisory.en.endswith("This is a screening result, not a lab test.")


def test_tips_match_the_problem_found():
    hot_wet_sour = Readings(ph=5.2, moisture_pct=80, sample_temp_c=35, ambient_temp_c=27)
    advisory = build_advisory(hot_wet_sour, "Poor", "High", "Low")
    assert "pH is high" in advisory.en
    assert "too wet" in advisory.en
    assert "warmer than the air" in advisory.en
    assert "No photo yet" not in advisory.en
