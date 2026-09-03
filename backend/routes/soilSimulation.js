const router = require('express').Router();
const db = require('../data/seed');

function nutrientLabel(value, ideal) {
  const ratio = value / ideal;
  if (ratio < 0.4) return 'Low';
  if (ratio < 0.7) return 'Medium';
  if (ratio < 1.0) return 'Improved';
  return 'Good';
}

function applySeasonEffects(state, crop) {
  if (!crop) return state;

  // Legumes fix nitrogen
  if (crop.is_nitrogen_fixer) {
    state.nitrogen  = Math.min(160, state.nitrogen  + 20);
    state.organic_carbon = Math.min(2.0, state.organic_carbon + 0.1);
  } else {
    state.nitrogen  = Math.max(20, state.nitrogen  - crop.n_demand * 0.3);
    state.phosphorus= Math.max(10, state.phosphorus - crop.p_demand * 0.2);
    state.potassium = Math.max(20, state.potassium  - crop.k_demand * 0.2);
  }

  // High-water crops deplete OC
  if (crop.water_requirement === 'High') {
    state.organic_carbon = Math.max(0.1, state.organic_carbon - 0.08);
  } else {
    state.organic_carbon = Math.min(2.0, state.organic_carbon + 0.05);
  }

  // Recompute health score
  const nS  = Math.min(100, (state.nitrogen       / 120) * 100);
  const pS  = Math.min(100, (state.phosphorus      /  45) * 100);
  const kS  = Math.min(100, (state.potassium        /  90) * 100);
  const phS = 100; // pH assumed stable
  const ocS = Math.min(100, (state.organic_carbon  /   1) * 100);
  state.soil_health = Math.round(nS*0.25 + pS*0.20 + kS*0.20 + phS*0.20 + ocS*0.15);

  return state;
}

// ── POST /api/soil-simulation ────────────────────────────────
router.post('/', (req, res) => {
  const { plan_id } = req.body;
  if (!plan_id) return res.status(400).json({ error: 'plan_id required' });

  const plan = db.rotation_plans.find(p => p.plan_id === plan_id);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  const planSeasons = db.rotation_plan_seasons
    .filter(ps => ps.plan_id === plan_id)
    .sort((a, b) => a.season_order - b.season_order);

  // Get current soil state
  const soil = [...db.soil_data]
    .filter(s => s.farm_id === (plan.farm_id || 101))
    .sort((a,b) => b.soil_id - a.soil_id)[0]
    || { nitrogen: 42, phosphorus: 28, potassium: 55, organic_carbon: 0.52, soil_health_score: 58 };

  let state = {
    nitrogen:      soil.nitrogen,
    phosphorus:    soil.phosphorus,
    potassium:     soil.potassium,
    organic_carbon:soil.organic_carbon,
    soil_health:   soil.soil_health_score,
  };

  const timeline = [{
    season: 0,
    soil_health: state.soil_health,
    n:  nutrientLabel(state.nitrogen,       120),
    p:  nutrientLabel(state.phosphorus,      45),
    k:  nutrientLabel(state.potassium,       90),
    oc: nutrientLabel(state.organic_carbon,   1),
    crop: 'Current',
  }];

  planSeasons.forEach((ps, idx) => {
    const crop = db.crops.find(c => c.crop_id === ps.crop_id);
    state = applySeasonEffects({ ...state }, crop);

    const entry = {
      season: idx + 1,
      soil_health: state.soil_health,
      n:  nutrientLabel(state.nitrogen,       120),
      p:  nutrientLabel(state.phosphorus,      45),
      k:  nutrientLabel(state.potassium,       90),
      oc: nutrientLabel(state.organic_carbon,   1),
      crop: crop?.name || 'Unknown',
    };
    timeline.push(entry);

    db.soil_simulation_log.push({
      sim_id:               db.counters.sim_id++,
      plan_id,
      season_order:         idx + 1,
      predicted_n:          entry.n,
      predicted_p:          entry.p,
      predicted_k:          entry.k,
      predicted_oc:         entry.oc,
      predicted_soil_health:entry.soil_health,
    });
  });

  res.json({ plan_id, timeline });
});

module.exports = router;
