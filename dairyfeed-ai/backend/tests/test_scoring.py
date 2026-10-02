import pytest
import yaml

from app.models.sample import Readings
from app.services.scoring import interpolate, load_config, quality_from_score, score_sample


def readings(ph=4.0, moisture=65.0, sample_temp=28.0, ambient=27.0) -> Readings:
    return Readings(ph=ph, moisture_pct=moisture, sample_temp_c=sample_temp, ambient_temp_c=ambient)


def test_interpolate_between_and_beyond_points():
    points = [[3.8, 1.0], [4.8, 0.0]]
    assert interpolate(points, 4.3) == pytest.approx(0.5)
    assert interpolate(points, 3.0) == 1.0   # below the first point: first value
    assert interpolate(points, 6.0) == 0.0   # above the last point: last value


def test_good_sample_without_photo_scales_over_available_weights():
    result = score_sample(readings())
    assert result.mould_risk == "Unknown"
    assert result.breakdown == {"ph": 40, "moisture": 30, "temperature": 20, "visual": None}
    assert result.score == 100  # 90 of 90 available points
    assert result.quality == "Good"
    assert result.spoilage_risk == "Low"


def test_photo_mould_risk_feeds_the_visual_score():
    assert score_sample(readings(), "Low").breakdown["visual"] == 10
    high = score_sample(readings(), "High")
    assert high.breakdown["visual"] == 0
    assert high.score == 90
    assert high.quality == "Poor"  # likely mould is always Poor, whatever the score


def test_ph_above_4_8_is_penalised_strongly():
    assert score_sample(readings(ph=4.5)).breakdown["ph"] == 40
    assert score_sample(readings(ph=4.8)).breakdown["ph"] == 20
    assert score_sample(readings(ph=5.5)).breakdown["ph"] == 0


def test_moisture_outside_ideal_range_is_penalised():
    assert score_sample(readings(moisture=55)).breakdown["moisture"] == 18   # 0.6 x 30
    assert score_sample(readings(moisture=50)).breakdown["moisture"] == 9    # 0.3 x 30
    assert score_sample(readings(moisture=75)).breakdown["moisture"] == 18


def test_heating_above_ambient_is_penalised():
    assert score_sample(readings(sample_temp=30.0, ambient=27.0)).breakdown["temperature"] == 20  # +3 degC: fine
    assert score_sample(readings(sample_temp=33.0, ambient=27.0)).breakdown["temperature"] == 8   # +6 degC
    # Colder than the air is fine.
    assert score_sample(readings(sample_temp=20.0, ambient=27.0)).breakdown["temperature"] == 20


@pytest.mark.parametrize(
    ("ph", "sample_temp", "expected"),
    [
        (4.0, 28.0, "Low"),
        (4.6, 28.0, "Medium"),    # pH above 4.5
        (4.0, 31.0, "Medium"),    # 4 degC above ambient
        (5.1, 28.0, "High"),      # pH above 5.0
        (4.0, 34.0, "High"),      # 7 degC above ambient
    ],
)
def test_spoilage_risk(ph, sample_temp, expected):
    assert score_sample(readings(ph=ph, sample_temp=sample_temp)).spoilage_risk == expected


def test_quality_bands_and_caps():
    config = load_config()
    assert quality_from_score(75, "Low", "Unknown", config) == "Good"
    assert quality_from_score(74, "Low", "Unknown", config) == "Moderate"
    assert quality_from_score(50, "Low", "Unknown", config) == "Moderate"
    assert quality_from_score(49, "Low", "Unknown", config) == "Poor"
    assert quality_from_score(95, "High", "Unknown", config) == "Moderate"  # high spoilage caps at Moderate
    assert quality_from_score(95, "Low", "High", config) == "Poor"          # likely mould caps at Poor


def test_weights_must_add_up_to_100(tmp_path):
    config = load_config()
    broken = dict(config, weights={"ph": 50, "moisture": 30, "temperature": 20, "visual": 10})
    path = tmp_path / "scoring_config.yaml"
    path.write_text(yaml.safe_dump(broken))
    with pytest.raises(ValueError, match="add up to 100"):
        load_config(path)
