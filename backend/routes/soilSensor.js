// ============================================================
// soilSensor.js — ESP32 Live Soil Sensor Ingestion
// Device-authenticated endpoint (shared key, not user JWT) that
// an ESP32 posts readings to, plus polling endpoints the frontend
// uses to display Live Sensor mode on the Soil Analysis page.
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');
const { computeHealth } = require('../utils/soilScoring');

// A reading counts as "live" (device actively connected) if it
// arrived within this window; otherwise it's shown as stale/last-known.
const LIVE_WINDOW_MS = 30 * 1000;

function requireDeviceKey(req, res, next) {
  const expected = process.env.ESP32_DEVICE_KEY;
  if (!expected) {
    return res.status(503).json({ error: 'ESP32_DEVICE_KEY is not configured on the server — set it in backend/.env' });
  }
  const provided = req.get('X-Device-Key');
  if (provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing X-Device-Key header' });
  }
  next();
}

// ─────────────────────────────────────────────────────────────
// POST /api/soil-sensor/ingest — ESP32 pushes a reading
// Body: { farm_id, device_id, nitrogen, phosphorus, potassium, ph, organic_carbon }
// ─────────────────────────────────────────────────────────────
router.post('/ingest', requireDeviceKey, (req, res) => {
  const { farm_id = 101, device_id, nitrogen, phosphorus, potassium, ph, organic_carbon } = req.body;

  const values = { nitrogen, phosphorus, potassium, ph, organic_carbon };
  const missing = Object.entries(values).filter(([, v]) => v === undefined || v === null || Number.isNaN(Number(v)));
  if (missing.length) {
    return res.status(400).json({ error: `Missing/invalid sensor field(s): ${missing.map(([k]) => k).join(', ')}` });
  }

  const numeric = {
    nitrogen: Number(nitrogen), phosphorus: Number(phosphorus), potassium: Number(potassium),
    ph: Number(ph), organic_carbon: Number(organic_carbon),
  };

  const { score, deficiencies, adequate } = computeHealth(numeric);

  const entry = {
    soil_id: db.counters.soil_id++,
    farm_id: Number(farm_id),
    recorded_date: new Date().toISOString().slice(0, 10),
    ...numeric,
    soil_health_score: score,
    deficiencies,
    source: 'esp32',
  };
  db.soil_data.push(entry);

  db.live_sensor_status[farm_id] = {
    device_id: device_id || 'esp32-unknown',
    last_seen: Date.now(),
    last_reading: entry,
  };

  res.json({ success: true, soil_id: entry.soil_id, soil_health_score: score, deficiencies, adequate });
});

// ─────────────────────────────────────────────────────────────
// GET /api/soil-sensor/latest?farm_id=101 — frontend polling target
// ─────────────────────────────────────────────────────────────
router.get('/latest', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const status = db.live_sensor_status[farm_id];

  if (!status) {
    return res.json({ connected: false, ever_connected: false, reading: null });
  }

  const ageMs = Date.now() - status.last_seen;
  res.json({
    connected: ageMs <= LIVE_WINDOW_MS,
    ever_connected: true,
    seconds_ago: Math.round(ageMs / 1000),
    device_id: status.device_id,
    reading: status.last_reading,
  });
});

module.exports = router;
