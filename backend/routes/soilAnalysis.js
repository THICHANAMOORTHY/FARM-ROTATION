const router = require('express').Router();
const db = require('../data/seed');

// ── Helpers ─────────────────────────────────────────────────
function scoreFactor(value, ideal, max = 100) {
  return Math.min(max, Math.max(0, (value / ideal) * max));
}

function phScore(ph) {
  if (ph >= 6.0 && ph <= 7.5) return 100;
  const dist = Math.min(Math.abs(ph - 6.0), Math.abs(ph - 7.5));
  return Math.max(0, 100 - dist * 40);
}

function computeHealth({ nitrogen, phosphorus, potassium, ph, organic_carbon }) {
  const nS  = scoreFactor(nitrogen,       120);
  const pS  = scoreFactor(phosphorus,      45);
  const kS  = scoreFactor(potassium,       90);
  const phS = phScore(ph);
  const ocS = scoreFactor(organic_carbon,   1.0, 100);

  const score = Math.round(nS * 0.25 + pS * 0.20 + kS * 0.20 + phS * 0.20 + ocS * 0.15);

  const deficiencies = [];
  const adequate     = [];

  if (nS  < 50) deficiencies.push('Low Nitrogen');       else adequate.push('Nitrogen');
  if (pS  < 50) deficiencies.push('Low Phosphorus');     else adequate.push('Phosphorus');
  if (kS  < 50) deficiencies.push('Low Potassium');      else adequate.push('Potassium');
  if (phS < 50) deficiencies.push('pH Imbalance');       else adequate.push('pH');
  if (ocS < 50) deficiencies.push('Low Organic Carbon'); else adequate.push('Organic Carbon');

  return { score, deficiencies, adequate };
}

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
