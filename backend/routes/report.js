// ============================================================
// report.js — Aggregates full Farmer Soil Health & Action Plan
// GET /api/report?farm_id=101
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');

router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;

  const farm = db.farms.find(f => f.farm_id === farm_id);
  if (!farm) return res.status(404).json({ error: 'Farm not found' });

  const farmer = db.farmers.find(f => f.farmer_id === farm.farmer_id) || { name: 'Farmer' };
  const soil = db.soil_data.filter(s => s.farm_id === farm_id).pop() || {
    soil_health_score: 58,
    nitrogen: 42, phosphorus: 28, potassium: 55, ph: 6.5, organic_carbon: 0.52,
    deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH']
  };

  const history = db.crop_history.filter(h => h.farm_id === farm_id);
  const rec = db.recommendations.filter(r => r.farm_id === farm_id).pop();
  const plan = db.rotation_plans.filter(p => p.farm_id === farm_id && p.is_recommended).pop() ||
               db.rotation_plans.filter(p => p.farm_id === farm_id)[0];

  const report = {
    report_title: "CropSmart Soil Health & Action Plan",
    generated_at: new Date().toISOString(),
    farm: {
      id: farm.farm_id,
      name: farm.location_name,
      area_acres: farm.area_acres,
      irrigation: farm.irrigation_type,
      farmer_name: farmer.name,
      phone: farmer.phone,
    },
    soil_health: {
      score: soil.soil_health_score,
      status: soil.soil_health_score >= 70 ? "Optimal" : soil.soil_health_score >= 50 ? "Moderate Depletion" : "Critical Deficit",
      deficiencies: soil.deficiencies || ['Low Nitrogen'],
      adequate: soil.adequate || ['Potassium', 'pH'],
      measurements: {
        nitrogen_kg_ha: soil.nitrogen,
        phosphorus_kg_ha: soil.phosphorus,
        potassium_kg_ha: soil.potassium,
        ph: soil.ph,
        organic_carbon_pct: soil.organic_carbon,
      },
    },
    monoculture_warning: {
      detected: history.length >= 2,
      consecutive_seasons: history.length,
      past_crop: "Tomato",
      penalty_applied: true,
      risk_factor: "Pest accumulation & Nitrogen depletion",
    },
    action_plan: {
      primary_crop: rec ? db.crops.find(c => c.crop_id === rec.recommended_crop_id)?.name || "Green Gram" : "Green Gram",
      suitability_score: rec ? rec.final_score : 88.5,
      three_season_rotation: plan ? plan.sequence : ["Tomato", "Green Gram", "Groundnut"],
      projected_total_profit: plan ? plan.total_projected_profit : 102000,
      soil_recovery_trajectory: [soil.soil_health_score, 65, 72, 79],
      rationale: rec ? rec.reasoning : [
        "Improves nitrogen balance through biological fixation",
        "Breaks continuous cultivation disease cycle",
        "Low water requirement suits current irrigation"
      ],
    },
  };

  res.json(report);
});

module.exports = router;
