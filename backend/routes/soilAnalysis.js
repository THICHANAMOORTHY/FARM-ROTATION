const router = require('express').Router();
const db = require('../data/seed');
const { computeHealth } = require('../utils/soilScoring');

// ── POST /api/soil-analysis ──────────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, nitrogen, phosphorus, potassium, ph, organic_carbon } = req.body;

  if ([nitrogen, phosphorus, potassium, ph, organic_carbon].some(v => v === undefined)) {
    return res.status(400).json({ error: 'All soil parameters required (N, P, K, ph, organic_carbon)' });
  }

  const { score, deficiencies, adequate } = computeHealth({ nitrogen, phosphorus, potassium, ph, organic_carbon });

  // Persist to in-memory store
  const entry = {
    soil_id: db.counters.soil_id++,
    farm_id,
    recorded_date: new Date().toISOString().slice(0, 10),
    nitrogen, phosphorus, potassium, ph, organic_carbon,
    soil_health_score: score,
    deficiencies,
    source: 'manual',
  };
  db.soil_data.push(entry);

  // Also update latest entry for farm
  const existing = db.soil_data.find(s => s.farm_id === farm_id && s.soil_id !== entry.soil_id);
  if (existing) Object.assign(existing, entry);

  res.json({
    soil_id:          entry.soil_id,
    soil_health_score: score,
    deficiencies,
    adequate,
  });
});

// GET latest soil data for a farm
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const latest = [...db.soil_data]
    .filter(s => s.farm_id === farm_id)
    .sort((a, b) => b.soil_id - a.soil_id)[0];
  if (!latest) return res.status(404).json({ error: 'No soil data found' });
  res.json(latest);
});

module.exports = router;
