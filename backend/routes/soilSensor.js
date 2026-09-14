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

// Latest known nutrient reading for a farm, regardless of source (manual
// entry, seed data, or a prior ESP32 post) — used to carry nutrients over
// when an env-only device (no NPK/pH capability) posts a reading, so it
// doesn't blank out an existing soil test that just isn't in
// live_sensor_status yet (e.g. right after a server restart).
function getLatestNutrientReading(farm_id) {
  const candidates = db.soil_data.filter(s => s.farm_id === farm_id && s.nitrogen !== undefined && s.nitrogen !== null);
  if (!candidates.length) return null;
  return candidates.sort((a, b) => b.soil_id - a.soil_id)[0];
}

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
//
// Supports two kinds of devices, in the same payload shape:
//  - A full soil sensor: nitrogen, phosphorus, potassium, ph, organic_carbon
//    (all required together) -> computes a real soil_health_score.
//  - A simpler env sensor (e.g. DHT11 + analog soil moisture probe, no NPK/pH
//    capability): just air_temperature / air_humidity / soil_moisture. These
//    are never part of the health score — they're shown as supplementary
//    info tiles in Live Sensor mode.
// A request may send nutrients only, env fields only, or both. Whatever
// isn't sent in THIS request is carried over from the farm's last known
// reading, so an env-only device doesn't blank out an existing soil test
// (and vice versa) — each device just updates the fields it actually has.
// ─────────────────────────────────────────────────────────────
router.post('/ingest', requireDeviceKey, (req, res) => {
  const {
    farm_id = 101, device_id,
    nitrogen, phosphorus, potassium, ph, organic_carbon,
    air_temperature, air_humidity, soil_moisture,
  } = req.body;

  const nutrientFields = { nitrogen, phosphorus, potassium, ph, organic_carbon };
  const nutrientsProvided = Object.values(nutrientFields).some(v => v !== undefined);
  if (nutrientsProvided) {
    const missing = Object.entries(nutrientFields).filter(([, v]) => v === undefined || v === null || Number.isNaN(Number(v)));
    if (missing.length) {
      return res.status(400).json({ error: `Nitrogen/phosphorus/potassium/ph/organic_carbon must be sent together — missing/invalid: ${missing.map(([k]) => k).join(', ')}` });
    }
  }

  const envFields = { air_temperature, air_humidity, soil_moisture };
  for (const [key, v] of Object.entries(envFields)) {
    if (v !== undefined && Number.isNaN(Number(v))) {
      return res.status(400).json({ error: `${key} must be a number if provided` });
    }
  }
  if (!nutrientsProvided && Object.values(envFields).every(v => v === undefined)) {
    return res.status(400).json({ error: 'Provide either the full nutrient set (nitrogen/phosphorus/potassium/ph/organic_carbon) or at least one of air_temperature/air_humidity/soil_moisture' });
  }

  const prevStatus = db.live_sensor_status[farm_id];
  const prevReading = prevStatus ? prevStatus.last_reading : null;
  // Fall back to the farm's latest nutrient reading from ANY source (manual
  // entry, seed data, a prior ESP32 post) when live_sensor_status has none
  // yet for this farm — e.g. right after a server restart.
  const lastNutrients = (prevReading && prevReading.nitrogen !== undefined && prevReading.nitrogen !== null)
    ? prevReading
    : getLatestNutrientReading(Number(farm_id));

  // Carry over whichever side (nutrients vs env) wasn't sent in this request.
  const numeric = nutrientsProvided
    ? {
        nitrogen: Number(nitrogen), phosphorus: Number(phosphorus), potassium: Number(potassium),
        ph: Number(ph), organic_carbon: Number(organic_carbon),
      }
    : (lastNutrients
      ? {
          nitrogen: lastNutrients.nitrogen, phosphorus: lastNutrients.phosphorus, potassium: lastNutrients.potassium,
          ph: lastNutrients.ph, organic_carbon: lastNutrients.organic_carbon,
        }
      : null);

  let score = lastNutrients ? lastNutrients.soil_health_score : undefined;
  let deficiencies = lastNutrients ? lastNutrients.deficiencies : undefined;
  let adequate;
  if (numeric) {
    ({ score, deficiencies, adequate } = computeHealth(numeric));
  }

  const entry = {
    soil_id: db.counters.soil_id++,
    farm_id: Number(farm_id),
    recorded_date: new Date().toISOString().slice(0, 10),
    ...(numeric || {}),
    air_temperature: air_temperature !== undefined ? Number(air_temperature) : (prevReading ? prevReading.air_temperature : null),
    air_humidity: air_humidity !== undefined ? Number(air_humidity) : (prevReading ? prevReading.air_humidity : null),
    soil_moisture: soil_moisture !== undefined ? Number(soil_moisture) : (prevReading ? prevReading.soil_moisture : null),
    soil_health_score: score,
    deficiencies,
    source: 'esp32',
  };

  // Only add to the scored soil-test history when nutrients were actually
  // freshly measured in THIS request — not when `numeric` is just carried
  // over from a prior (possibly seeded/demo) reading. Otherwise an env-only
  // device re-stamps old data as a "new" entry every time it pings, which
  // would re-tag seeded demo numbers as fresh and defeat the whole point
  // of not showing fake data.
  if (nutrientsProvided) db.soil_data.push(entry);

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
