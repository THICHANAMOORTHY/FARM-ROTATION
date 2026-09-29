const router = require('express').Router();
const db = require('../data/seed');
const { v4: uuidv4 } = require('uuid');

// ── GET /api/candidate-crops?farm_id=101&season=Kharif ───────
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const season  = req.query.season || 'Kharif';

  let farm = db.farms.find(f => f.farm_id === farm_id);
  if (!farm) {
    farm = (typeof db.ensureFarm === 'function')
      ? db.ensureFarm(farm_id)
      : (db.farms[0] || { farm_id, irrigation_type: 'Drip' });
  }

  // Detect penalized crops from history
  const history   = db.crop_history.filter(h => h.farm_id === farm_id);
  const cropCounts = {};
  history.forEach(h => { cropCounts[h.crop_id] = (cropCounts[h.crop_id] || 0) + 1; });
  const penalizedIds = Object.keys(cropCounts)
    .filter(id => cropCounts[id] >= 2)
    .map(Number);

  // Water compatibility map
  const waterMap = {
    Rainfed: ['Low'],
    Low:     ['Low'],
    Moderate:['Low','Medium'],
    Drip:    ['Low','Medium'],
    Canal:   ['Low','Medium','High'],
    High:    ['Low','Medium','High'],
  };
  const allowedWater = waterMap[farm.irrigation_type] || ['Low','Medium','High'];

  const candidates = [];
  const excluded   = [];

  db.crops.forEach(crop => {
    const seasonOk = crop.suitable_seasons.includes(season);
    const waterOk  = allowedWater.includes(crop.water_requirement);
    const rotOk    = !penalizedIds.includes(crop.crop_id);

    if (!seasonOk) {
      excluded.push({ crop: crop.name, reason: 'Season mismatch' });
    } else if (!waterOk) {
      excluded.push({ crop: crop.name, reason: 'Water availability mismatch' });
    } else if (!rotOk) {
      excluded.push({ crop: crop.name, reason: 'Continuous cultivation penalty' });
    } else {
      candidates.push(crop.name);
    }
  });

  const run_id = uuidv4();
  res.json({ run_id, season, farm_id, candidates, excluded });
});

module.exports = router;
