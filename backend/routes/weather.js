// ============================================================
//  routes/weather.js — Real-Time Weather & Agricultural Advisory
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../data/seed');

// 5-minute memory cache
const weatherCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

// WMO Weather Interpretation Codes (WW)
const WMO_CODES = {
  0:  { label: 'Clear Sky', icon: '☀️', condition: 'Sunny' },
  1:  { label: 'Mainly Clear', icon: '🌤️', condition: 'Mostly Sunny' },
  2:  { label: 'Partly Cloudy', icon: '⛅', condition: 'Partly Cloudy' },
  3:  { label: 'Overcast', icon: '☁️', condition: 'Cloudy' },
  45: { label: 'Foggy', icon: '🌫️', condition: 'Fog' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️', condition: 'Fog' },
  51: { label: 'Light Drizzle', icon: '🌦️', condition: 'Drizzle' },
  53: { label: 'Moderate Drizzle', icon: '🌦️', condition: 'Drizzle' },
  55: { label: 'Dense Drizzle', icon: '🌧️', condition: 'Drizzle' },
  61: { label: 'Slight Rain', icon: '🌦️', condition: 'Rain' },
  63: { label: 'Moderate Rain', icon: '🌧️', condition: 'Rain' },
  65: { label: 'Heavy Rain', icon: '🌧️', condition: 'Heavy Rain' },
  71: { label: 'Slight Snow Fall', icon: '🌨️', condition: 'Snow' },
  73: { label: 'Moderate Snow Fall', icon: '❄️', condition: 'Snow' },
  75: { label: 'Heavy Snow Fall', icon: '❄️', condition: 'Snow' },
  80: { label: 'Slight Rain Showers', icon: '🌦️', condition: 'Showers' },
  81: { label: 'Moderate Rain Showers', icon: '🌧️', condition: 'Showers' },
  82: { label: 'Violent Rain Showers', icon: '⛈️', condition: 'Showers' },
  95: { label: 'Thunderstorm', icon: '⛈️', condition: 'Thunderstorm' },
  96: { label: 'Thunderstorm with Slight Hail', icon: '⛈️', condition: 'Hailstorm' },
  99: { label: 'Thunderstorm with Heavy Hail', icon: '⛈️', condition: 'Hailstorm' },
};

function decodeWeatherCode(code) {
  return WMO_CODES[code] || { label: 'Partly Cloudy', icon: '⛅', condition: 'Partly Cloudy' };
}

// Generate Agricultural Advisories based on real-time microclimate
function generateAgriAdvisories(current, daily) {
  const advisories = [];
  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const precip = current.precipitation;
  const nextRainProb = daily?.precipitation_probability_max?.[0] ?? 0;

  // 1. Spraying Suitability
  if (wind > 20) {
    advisories.push({
      category: 'Spraying',
      status: 'warning',
      title: 'High Wind Velocity',
      message: `Wind speed is ${wind.toFixed(1)} km/h. Avoid pesticide/fertilizer spraying to prevent chemical drift.`,
      icon: '💨',
    });
  } else if (precip > 0.5 || nextRainProb > 60) {
    advisories.push({
      category: 'Spraying',
      status: 'danger',
      title: 'Rain Hazard',
      message: `Precipitation active or high rain risk (${nextRainProb}%). Delay chemical applications to avoid wash-off.`,
      icon: '🌧️',
    });
  } else if (wind < 12 && humidity < 80) {
    advisories.push({
      category: 'Spraying',
      status: 'success',
      title: 'Optimal Spray Window',
      message: `Calm wind (${wind.toFixed(1)} km/h) & moderate humidity. Excellent conditions for foliar nutrient sprays.`,
      icon: '🌿',
    });
  }

  // 2. Irrigation Advice
  if (precip >= 5 || nextRainProb >= 70) {
    advisories.push({
      category: 'Irrigation',
      status: 'info',
      title: 'Irrigation Suspension',
      message: `Substantial rain received (${precip} mm) or imminent. Suspend planned irrigation to conserve water and prevent root rot.`,
      icon: '💧',
    });
  } else if (temp > 34 && humidity < 45) {
    advisories.push({
      category: 'Irrigation',
      status: 'warning',
      title: 'High Evapotranspiration',
      message: `Temperature is ${temp.toFixed(1)}°C with dry air (${humidity}% RH). Increase drip/irrigation frequency for moisture-sensitive crops.`,
      icon: '☀️',
    });
  } else {
    advisories.push({
      category: 'Irrigation',
      status: 'success',
      title: 'Normal Irrigation Schedule',
      message: 'Moisture loss is balanced. Maintain standard rotation irrigation schedule.',
      icon: '🚿',
    });
  }

  // 3. Fungal & Pest Risk
  if (humidity > 78 && temp >= 22 && temp <= 30) {
    advisories.push({
      category: 'Pest Risk',
      status: 'danger',
      title: 'High Fungal Disease Risk',
      message: `Warm humid climate (${temp.toFixed(1)}°C, ${humidity}% RH) accelerates blast, powdery mildew & fungal spores. Inspect crop canopy.`,
      icon: '🍄',
    });
  } else if (humidity > 70) {
    advisories.push({
      category: 'Pest Risk',
      status: 'warning',
      title: 'Moderate Pest Activity',
      message: 'Elevated humidity detected. Monitor lower leaves and pulses for aphid/caterpillar infestation.',
      icon: '🐛',
    });
  } else {
    advisories.push({
      category: 'Pest Risk',
      status: 'success',
      title: 'Low Disease Pressure',
      message: 'Current ambient temperature and dry conditions suppress major airborne fungal pathogens.',
      icon: '🛡️',
    });
  }

  return advisories;
}

// ── GET /api/weather ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    let { farm_id, lat, lon, location_name } = req.query;

    // Resolve location
    if (farm_id) {
      const fId = parseInt(farm_id, 10);
      const farm = db.farms.find(f => f.farm_id === fId);
      if (farm) {
        lat = farm.latitude;
        lon = farm.longitude;
        location_name = farm.location_name || farm.name;
      }
    }

    // Default fallback to Coimbatore if missing
    if (!lat || !lon) {
      const defaultFarm = db.farms[0] || { latitude: 11.0168, longitude: 76.9558, location_name: 'Coimbatore' };
      lat = defaultFarm.latitude;
      lon = defaultFarm.longitude;
      if (!location_name) location_name = defaultFarm.location_name;
    }

    lat = parseFloat(lat);
    lon = parseFloat(lon);

    const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json({ ...cached.data, cached: true, location_name: location_name || cached.data.location_name });
    }

    // Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
      `&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo responded with status ${response.status}`);
    }

    const raw = await response.json();
    const cur = raw.current || {};
    const daily = raw.daily || {};

    const condition = decodeWeatherCode(cur.weather_code);

    // Format 7-day forecast
    const forecast = [];
    if (daily.time && daily.time.length) {
      for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
        const dCond = decodeWeatherCode(daily.weather_code?.[i] ?? 0);
        forecast.push({
          date: daily.time[i],
          day: new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
          max_temp: Math.round(daily.temperature_2m_max?.[i] ?? 0),
          min_temp: Math.round(daily.temperature_2m_min?.[i] ?? 0),
          precipitation_mm: daily.precipitation_sum?.[i] ?? 0,
          rain_probability: daily.precipitation_probability_max?.[i] ?? 0,
          icon: dCond.icon,
          label: dCond.label,
        });
      }
    }

    const advisories = generateAgriAdvisories(cur, daily);

    const result = {
      location: {
        name: location_name || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
        latitude: lat,
        longitude: lon,
        elevation: raw.elevation,
        timezone: raw.timezone,
      },
      current: {
        time: cur.time,
        temperature: Math.round(cur.temperature_2m * 10) / 10,
        feels_like: Math.round(cur.apparent_temperature * 10) / 10,
        humidity: Math.round(cur.relative_humidity_2m),
        precipitation_mm: cur.precipitation,
        weather_code: cur.weather_code,
        condition: condition.condition,
        label: condition.label,
        icon: condition.icon,
        wind_speed_kmh: Math.round(cur.wind_speed_10m * 10) / 10,
        wind_direction: cur.wind_direction_10m,
        pressure_hpa: Math.round(cur.surface_pressure || 1013),
      },
      forecast,
      advisories,
      last_updated: new Date().toISOString(),
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: result });
    res.json(result);

  } catch (err) {
    console.error('Weather API error:', err.message);

    // High fidelity fallback data so the dashboard never breaks
    const fallbackCondition = decodeWeatherCode(1);
    res.json({
      location: {
        name: req.query.location_name || 'Coimbatore',
        latitude: parseFloat(req.query.lat) || 11.0168,
        longitude: parseFloat(req.query.lon) || 76.9558,
        timezone: 'Asia/Kolkata',
      },
      current: {
        time: new Date().toISOString(),
        temperature: 30.5,
        feels_like: 33.2,
        humidity: 62,
        precipitation_mm: 0.0,
        weather_code: 1,
        condition: 'Partly Cloudy',
        label: 'Mainly Clear',
        icon: '🌤️',
        wind_speed_kmh: 12.0,
        wind_direction: 180,
        pressure_hpa: 1011,
      },
      forecast: [
        { date: 'Today', day: 'Today', max_temp: 32, min_temp: 23, precipitation_mm: 0, rain_probability: 10, icon: '🌤️', label: 'Mainly Clear' },
        { date: 'Day 2', day: 'Tomorrow', max_temp: 33, min_temp: 24, precipitation_mm: 1.2, rain_probability: 30, icon: '⛅', label: 'Partly Cloudy' },
        { date: 'Day 3', day: 'Thu', max_temp: 31, min_temp: 22, precipitation_mm: 5.0, rain_probability: 60, icon: '🌦️', label: 'Scattered Showers' },
      ],
      advisories: [
        {
          category: 'Spraying',
          status: 'success',
          title: 'Favorable Spraying Window',
          message: 'Mild winds and moderate humidity support foliar fertilizer application.',
          icon: '🌿'
        },
        {
          category: 'Irrigation',
          status: 'info',
          title: 'Standard Irrigation',
          message: 'Maintain regulated irrigation for current rotation sequence.',
          icon: '💧'
        }
      ],
      last_updated: new Date().toISOString(),
      fallback: true,
      error: err.message,
    });
  }
});

// ── GET /api/weather/search ──────────────────────────────────
// Search geocoding locations
router.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Query parameter q must be at least 2 characters.' });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;
    const response = await fetch(geoUrl);
    if (!response.ok) throw new Error(`Geocoding failed with status ${response.status}`);

    const data = await response.json();
    const results = (data.results || []).map(r => ({
      id: r.id,
      name: r.name,
      admin1: r.admin1 || '',
      country: r.country || '',
      latitude: r.latitude,
      longitude: r.longitude,
      display_name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    }));

    res.json({ results });
  } catch (err) {
    console.error('Geocoding search error:', err.message);
    res.status(500).json({ error: 'Failed to search location' });
  }
});

module.exports = router;
