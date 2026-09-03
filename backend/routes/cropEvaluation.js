const router = require('express').Router();
const db = require('../data/seed');

function clamp(v, lo = 0, hi = 100) { return Math.min(hi, Math.max(lo, v)); }

// ── Statistical Soil-pH Score ────────────────────────────────
// Uses the crop's ideal_ph_min/max derived from the merged dataset
function phMatchScore(soilPh, crop) {
  const mid   = (crop.ideal_ph_min + crop.ideal_ph_max) / 2;
  const range = (crop.ideal_ph_max - crop.ideal_ph_min) / 2;
  const dist  = Math.abs(soilPh - mid);
  // Perfect inside range → 100, degrades outside
  if (dist <= range) return 100;
  return clamp(100 - ((dist - range) / 0.5) * 25);
}

// ── Nutrient Match Score ─────────────────────────────────────
// If we have full stats (mean + stdev from dataset), score as Z-score distance
// Falls back to simple ratio otherwise
function nutrientScore(soilVal, crop_mean, crop_stdev) {
  if (!crop_mean) return 70; // neutral if unknown
  if (!crop_stdev || crop_stdev === 0) {
    return clamp((soilVal / crop_mean) * 100);
  }
  // How many stdevs away is the soil value from what this crop needs?
  const z = Math.abs(soilVal - crop_mean) / crop_stdev;
  // z=0 → 100,  z=1 → 80,  z=2 → 55,  z=3 → 25
  return clamp(100 - z * 22);
}

// ── Rainfall / Water Score ───────────────────────────────────
// Uses dataset avg_rainfall_mm and farm irrigation type
function waterScore(crop, farm, weather) {
  const waterMap = { Rainfed:'Low', Low:'Low', Moderate:'Medium', Drip:'Low', Canal:'High', High:'High' };
  const farmWater = waterMap[farm.irrigation_type] || 'Medium';
  const waterRank = { Low:1, Medium:2, High:3 };

  // Direct requirement match
  const reqRank  = waterRank[crop.water_requirement] || 2;
  const farmRank = waterRank[farmWater] || 2;
  const mismatch = Math.abs(reqRank - farmRank);
  const baseScore = mismatch === 0 ? 95 : mismatch === 1 ? 70 : 45;

  // Bonus if crop's avg_rainfall_mm aligns with local weather
  let weatherBonus = 0;
  if (weather && weather.rainfall_mm && crop.avg_rainfall_mm) {
    const ratio = weather.rainfall_mm / crop.avg_rainfall_mm;
    // ratio close to 1.0 → good match
    weatherBonus = clamp(20 - Math.abs(1 - ratio) * 30);
  }

  return clamp(baseScore * 0.85 + weatherBonus * 0.15);
}

// ── Profit Score ─────────────────────────────────────────────
function profitScore(crop) {
  const estRevenue = crop.avg_yield_per_acre * crop.avg_market_price;
  const estProfit  = estRevenue - crop.avg_cultivation_cost;
  // Benchmark: 30000 profit/acre = 100 score
  return clamp((estProfit / 30000) * 100);
}

// ── Climate Fit Score ────────────────────────────────────────
// Uses dataset-derived avg_temperature_c and avg_humidity_pct
function climateFitScore(crop, weather) {
  if (!weather || !crop.avg_temperature_c) return 75;
  const tempDiff = Math.abs((weather.avg_temp_c || 26) - crop.avg_temperature_c);
  const humDiff  = Math.abs((weather.humidity_pct || 70) - crop.avg_humidity_pct);
  const tempScore = clamp(100 - tempDiff * 4);
  const humScore  = clamp(100 - humDiff * 1.2);
  return clamp(tempScore * 0.6 + humScore * 0.4);
}

// ── Master Scorer ────────────────────────────────────────────
function scoreCrop(crop, soil, farm, history, weather) {
  const stats = crop.stats || {};

  // 1. Soil suitability: pH match (50%) + N/P/K nutrient match (50%)
  const phScore = phMatchScore(soil.ph || 6.5, crop);
  const nScore  = nutrientScore(soil.nitrogen   || 50, stats.N?.mean,  stats.N?.stdev);
  const pScore  = nutrientScore(soil.phosphorus || 40, stats.P?.mean,  stats.P?.stdev);
  const kScore  = nutrientScore(soil.potassium  || 60, stats.K?.mean,  stats.K?.stdev);
  const soil_suitability = clamp(phScore * 0.4 + nScore * 0.2 + pScore * 0.2 + kScore * 0.2);

  // 2. Season suitability (binary, validated at candidate filter stage)
  const season_suitability = clamp(90 + Math.random() * 10);

  // 3. Rotation score — reward crop family diversity from history
  const histFamilies = history
    .map(h => db.crops.find(c => c.crop_id === h.crop_id)?.crop_family)
    .filter(Boolean);
  const isNew = !histFamilies.includes(crop.crop_family);
  const rotation_score = clamp(isNew ? 88 + Math.random() * 12 : 45 + Math.random() * 20);

  // 4. Water score (uses rainfall stats from dataset)
  const water_score = waterScore(crop, farm, weather);

  // 5. Profit score
  const profit_score = profitScore(crop);

  // 6. Risk score
  const risk_score = clamp(100 - (crop.disease_risk_index || 30));

  // 7. Climate fit (bonus dimension using dataset climate data)
  const climate_score = climateFitScore(crop, weather);

  // Weighted final — 6 primary dimensions + climate as tiebreaker
  const final_score = clamp(
    soil_suitability  * 0.22 +
    season_suitability* 0.18 +
    rotation_score    * 0.20 +
    water_score       * 0.15 +
    profit_score      * 0.13 +
    risk_score        * 0.08 +
    climate_score     * 0.04
  );

  // Build predicted financials
  const yieldVar    = 0.85 + Math.random() * 0.30;
  const exp_yield   = Math.round(crop.avg_yield_per_acre  * yieldVar);
  const exp_revenue = Math.round(exp_yield * crop.avg_market_price);
  const exp_cost    = Math.round(crop.avg_cultivation_cost * (0.90 + Math.random() * 0.20));
  const exp_profit  = exp_revenue - exp_cost;

  return {
    crop_id:            crop.crop_id,
    crop:               crop.name,
    crop_family:        crop.crop_family,
    is_nitrogen_fixer:  crop.is_nitrogen_fixer,
    water_requirement:  crop.water_requirement,
    // Score dimensions
    soil_suitability:   Math.round(soil_suitability),
    season_suitability: Math.round(season_suitability),
    rotation_score:     Math.round(rotation_score),
    water_score:        Math.round(water_score),
    profit_score:       Math.round(profit_score),
    risk_score:         Math.round(risk_score),
    climate_score:      Math.round(climate_score),
    final_score:        parseFloat(final_score.toFixed(1)),
    // Financials
    predicted_yield:    exp_yield,
    predicted_revenue:  exp_revenue,
    predicted_cost:     exp_cost,
    predicted_profit:   exp_profit,
    // Dataset stats (useful for UI display)
    avg_n:              crop.n_demand,
    avg_p:              crop.p_demand,
    avg_k:              crop.k_demand,
    avg_ph:             crop.stats?.ph?.mean || null,
    avg_temp:           crop.avg_temperature_c,
    avg_humidity:       crop.avg_humidity_pct,
    avg_rainfall:       crop.avg_rainfall_mm,
    data_rows:          crop.total_rows || null,
  };
}

// ── POST /api/crop-evaluation ────────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, run_id, candidate_crop_ids } = req.body;

  if (!candidate_crop_ids || !Array.isArray(candidate_crop_ids)) {
    return res.status(400).json({ error: 'candidate_crop_ids array required' });
  }

  const soil = [...db.soil_data]
    .filter(s => s.farm_id === farm_id)
    .sort((a, b) => b.soil_id - a.soil_id)[0]
    || { ph: 6.5, nitrogen: 50, phosphorus: 40, potassium: 60, soil_health_score: 58 };

  const farm    = db.farms.find(f => f.farm_id === farm_id) || {};
  const history = db.crop_history.filter(h => h.farm_id === farm_id);
  const weather = db.weather_data.find(w => w.farm_id === farm_id);

  const results = candidate_crop_ids
    .map(id => db.crops.find(c => c.crop_id === id))
    .filter(Boolean)
    .map(crop => scoreCrop(crop, soil, farm, history, weather))
    .sort((a, b) => b.final_score - a.final_score)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  // Persist
  results.forEach(r => {
    db.crop_evaluations.push({
      evaluation_id:       db.counters.eval_id++,
      farm_id, run_id,
      crop_id:             r.crop_id,
      soil_suitability:    r.soil_suitability,
      season_suitability:  r.season_suitability,
      rotation_score:      r.rotation_score,
      water_score:         r.water_score,
      profit_score:        r.profit_score,
      risk_score:          r.risk_score,
      predicted_yield:     r.predicted_yield,
      predicted_revenue:   r.predicted_revenue,
      predicted_cost:      r.predicted_cost,
      predicted_profit:    r.predicted_profit,
      final_score:         r.final_score,
      rank:                r.rank,
    });
  });

  res.json({ run_id, results });
});

module.exports = router;
