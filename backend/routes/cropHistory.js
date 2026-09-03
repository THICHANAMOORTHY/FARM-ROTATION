const router = require('express').Router();
const db = require('../data/seed');

// ── POST /api/crop-history ───────────────────────────────────
router.post('/', (req, res) => {
  const { farm_id = 101, history } = req.body;
  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'history array required' });
  }

  // Detect rotation issues
  const cropNames   = history.map(h => h.crop);
  const cropCounts  = cropNames.reduce((acc, c) => { acc[c] = (acc[c] || 0) + 1; return acc; }, {});
  const maxCount    = Math.max(...Object.values(cropCounts));
  const penalized   = Object.keys(cropCounts).find(k => cropCounts[k] === maxCount);
  const families    = db.crops
    .filter(c => history.some(h => h.crop === c.name))
    .map(c => c.crop_family);
  const uniqueFamilies = [...new Set(families)];
  const allFamilies    = ['Legume', 'Cereal', 'Solanaceae', 'Asteraceae'];
  const suitable_families = allFamilies.filter(f => !uniqueFamilies.includes(f));
  if (suitable_families.length === 0) suitable_families.push('Legume'); // fallback

  let rotation_issue    = 'None';
  let nutrient_pressure = 'Low';
  if (maxCount >= 3) { rotation_issue = 'Continuous cultivation'; nutrient_pressure = 'High'; }
  else if (maxCount === 2) { rotation_issue = 'Repeated crop'; nutrient_pressure = 'Medium'; }

  // Persist to in-memory store
  history.forEach((h, idx) => {
    const crop = db.crops.find(c => c.name === h.crop);
    const season = db.seasons.find(s => s.name === h.season);
    db.crop_history.push({
      history_id:     db.counters.history_id++,
      farm_id,
      crop_id:        crop?.crop_id || null,
      season_id:      season?.season_id || null,
      year:           h.year,
      sequence_order: idx + 1,
      yield_actual:   h.yield || 0,
      cost_actual:    h.cost  || 0,
      revenue_actual: h.revenue || 0,
      profit_actual:  (h.revenue || 0) - (h.cost || 0),
    });
  });

  res.json({ rotation_issue, nutrient_pressure, penalized_crop: penalized, suitable_crop_families: suitable_families });
});

// GET crop history for a farm
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const history = db.crop_history
    .filter(h => h.farm_id === farm_id)
    .sort((a, b) => a.sequence_order - b.sequence_order)
    .map(h => ({
      ...h,
      crop_name:   db.crops.find(c => c.crop_id === h.crop_id)?.name || 'Unknown',
      season_name: db.seasons.find(s => s.season_id === h.season_id)?.name || 'Unknown',
    }));
  res.json({ farm_id, history });
});

module.exports = router;
