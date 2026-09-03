const router = require('express').Router();
const db = require('../data/seed');

function healthDelta(crop) {
  // Each crop modifies soil health differently
  if (crop.is_nitrogen_fixer) return +12;                    // Legumes improve soil
  if (crop.crop_family === 'Cereal') return -5;              // Cereals deplete slightly
  if (crop.water_requirement === 'High') return -8;          // High-water crops deplete more
  return -2;
}

function clamp(v, lo = 0, hi = 100) { return Math.min(hi, Math.max(lo, v)); }

function buildPlan(label, sequence, baseHealth, baseProfit, isRecommended = false) {
  let health = baseHealth;
  const seasonal_profit = [];
  const profitMult = { A: 0.85, B: 1.0, C: 0.93 };

  sequence.forEach(cropName => {
    const crop   = db.crops.find(c => c.name === cropName);
    const profit = crop
      ? Math.round((crop.avg_yield_per_acre * crop.avg_market_price - crop.avg_cultivation_cost) * (profitMult[label] || 1))
      : 20000;
    seasonal_profit.push(profit);
    health = clamp(health + (crop ? healthDelta(crop) : -3));
  });

  const plan = {
    plan_id:                db.counters.plan_id++,
    plan_label:             label,
    sequence,
    seasonal_profit,
    total_projected_profit: seasonal_profit.reduce((a, b) => a + b, 0),
    final_soil_health:      Math.round(health),
    is_recommended:         isRecommended,
  };

  return plan;
}

// ── POST /api/optimize-rotation ──────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, run_id, horizon_seasons = 3 } = req.body;

  // Get base state
  const soil    = [...db.soil_data].filter(s => s.farm_id === farm_id).sort((a,b) => b.soil_id - a.soil_id)[0]
               || { soil_health_score: 58 };
  const history = db.crop_history.filter(h => h.farm_id === farm_id);
  const lastCrop= history.length
    ? db.crops.find(c => c.crop_id === history[history.length - 1].crop_id)?.name || 'Tomato'
    : 'Tomato';

  // Determine best candidates from evaluations
  const evals = db.crop_evaluations
    .filter(e => e.farm_id === farm_id)
    .sort((a, b) => b.final_score - a.final_score);

  const top1 = evals[0] ? db.crops.find(c => c.crop_id === evals[0].crop_id)?.name : 'Green Gram';
  const top2 = evals[1] ? db.crops.find(c => c.crop_id === evals[1].crop_id)?.name : 'Groundnut';
  const top3 = evals[2] ? db.crops.find(c => c.crop_id === evals[2].crop_id)?.name : 'Maize';

  const baseHealth = soil.soil_health_score;

  // Plan A: continue current (bad)
  const planA = buildPlan('A', Array(horizon_seasons).fill(lastCrop), baseHealth, 0, false);
  // Plan B: recommended rotation (best)
  const planB = buildPlan('B', [lastCrop, top1, top2], baseHealth, 0, true);
  // Plan C: alternative rotation
  const planC = buildPlan('C', [lastCrop, top2, top3 || top1], baseHealth, 0, false);

  const plans = [planA, planB, planC];

  // Persist rotation plans
  plans.forEach(plan => {
    const record = {
      plan_id:               plan.plan_id,
      farm_id, run_id,
      plan_label:            plan.plan_label,
      total_projected_profit:plan.total_projected_profit,
      final_soil_health:     plan.final_soil_health,
      is_recommended:        plan.is_recommended,
      created_at:            new Date().toISOString(),
    };
    db.rotation_plans.push(record);

    plan.sequence.forEach((cropName, i) => {
      const crop = db.crops.find(c => c.name === cropName);
      db.rotation_plan_seasons.push({
        plan_season_id:    db.counters.plan_season_id++,
        plan_id:           plan.plan_id,
        season_order:      i + 1,
        crop_id:           crop?.crop_id || null,
        expected_profit:   plan.seasonal_profit[i],
        soil_health_before: null,
        soil_health_after:  null,
      });
    });
  });

  res.json({ plans });
});

module.exports = router;
