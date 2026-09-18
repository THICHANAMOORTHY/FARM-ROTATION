// ============================================================
// simulate_esp32.js — Pretends to be an ESP32 soil/env sensor client
// so the Live Sensor UI can be tested before hardware is flashed.
//
// Usage:
//   node backend/scripts/simulate_esp32.js [farm_id]        (full NPK+pH+OC sensor)
//   node backend/scripts/simulate_esp32.js [farm_id] --env  (DHT11 + soil moisture only,
//                                                             no NPK/pH — matches
//                                                             esp32/dht11_soil_moisture_client.ino)
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const args = process.argv.slice(2);
const envMode = args.includes('--env');
const farmId = Number(args.find(a => a !== '--env')) || 101;
const port = process.env.PORT || 3000;
const deviceKey = process.env.ESP32_DEVICE_KEY;
const url = `http://localhost:${port}/api/soil-sensor/ingest`;

if (!deviceKey) {
  console.error('ESP32_DEVICE_KEY is not set in backend/.env — add it before running this.');
  process.exit(1);
}

function randomWalk(prev, min, max, maxStep) {
  const next = prev + (Math.random() * 2 - 1) * maxStep;
  return Math.max(min, Math.min(max, next));
}

let reading = { nitrogen: 60, phosphorus: 35, potassium: 70, ph: 6.6, organic_carbon: 0.7 };
let envReading = { air_temperature: 28, air_humidity: 55, soil_moisture: 40, tds: 340 };

async function sendOnce() {
  let body;
  let logLine;

  if (envMode) {
    envReading = {
      air_temperature: Math.round(randomWalk(envReading.air_temperature, 18, 42, 0.8) * 10) / 10,
      air_humidity: Math.round(randomWalk(envReading.air_humidity, 20, 95, 3)),
      soil_moisture: Math.round(randomWalk(envReading.soil_moisture, 5, 90, 4)),
      tds: Math.round(randomWalk(envReading.tds, 50, 1200, 25)),
    };
    body = { farm_id: farmId, device_id: 'esp32-simulator-env', ...envReading };
    logLine = `temp=${envReading.air_temperature}°C humidity=${envReading.air_humidity}% soil_moisture=${envReading.soil_moisture}% tds=${envReading.tds}ppm`;
  } else {
    reading = {
      nitrogen: Math.round(randomWalk(reading.nitrogen, 20, 180, 6)),
      phosphorus: Math.round(randomWalk(reading.phosphorus, 10, 70, 3)),
      potassium: Math.round(randomWalk(reading.potassium, 20, 150, 5)),
      ph: Math.round(randomWalk(reading.ph, 5.0, 8.5, 0.15) * 10) / 10,
      organic_carbon: Math.round(randomWalk(reading.organic_carbon, 0.2, 1.8, 0.05) * 100) / 100,
    };
    body = { farm_id: farmId, device_id: 'esp32-simulator', ...reading };
    logLine = `N=${reading.nitrogen} P=${reading.phosphorus} K=${reading.potassium} pH=${reading.ph} OC=${reading.organic_carbon}`;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Key': deviceKey },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const stamp = new Date().toLocaleTimeString();
    console.log(`[${stamp}] ${res.status} farm=${farmId} ${logLine} -> score=${data.soil_health_score ?? data.error}`);
  } catch (err) {
    console.error('Send failed:', err.message);
  }
}

console.log(`Simulating an ${envMode ? 'env-only (DHT11 + soil moisture)' : 'NPK+pH+OC'} ESP32 for farm_id=${farmId}, posting to ${url} every 5s. Ctrl+C to stop.`);
sendOnce();
setInterval(sendOnce, 5000);
