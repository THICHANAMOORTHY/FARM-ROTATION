// ============================================================
// seed.js — In-memory database for CropSmart P025 (CLEARED)
// ============================================================

const { v4: uuidv4 } = require('uuid');
const { kaggleCrops } = require('./kaggle_crops');

const seasons = [
  { season_id: 1, name: 'Kharif', start_month: 6, end_month: 10 },
  { season_id: 2, name: 'Rabi',   start_month: 11, end_month: 3  },
  { season_id: 3, name: 'Zaid',   start_month: 4,  end_month: 5  },
];

const crops = [...kaggleCrops];

const farmers = [
  { farmer_id: 1, name: 'Ramesh Kumar', phone: '9876543210', email: 'ramesh@farm.in', preferred_lang: 'en' },
];

const farms = [
  {
    farm_id: 101, farmer_id: 1,
    name: 'Coimbatore Farm',
    location_name: 'Coimbatore, Tamil Nadu',
    latitude: 11.0168, longitude: 76.9558,
    area_acres: 4.5,
    irrigation: 'Drip',
    irrigation_type: 'Drip',
  },
  {
    farm_id: 102, farmer_id: 1,
    name: 'Nashik Agro Field',
    location_name: 'Nashik, Maharashtra',
    latitude: 19.9975, longitude: 73.7898,
    area_acres: 6.0,
    irrigation: 'Sprinkler',
    irrigation_type: 'Sprinkler',
  },
  {
    farm_id: 103, farmer_id: 1,
    name: 'Ludhiana Granary',
    location_name: 'Ludhiana, Punjab',
    latitude: 30.9010, longitude: 75.8573,
    area_acres: 8.5,
    irrigation: 'Canal Flood',
    irrigation_type: 'Canal Flood',
  },
  {
    farm_id: 104, farmer_id: 1,
    name: 'Guntur Chili & Pulses',
    location_name: 'Guntur, Andhra Pradesh',
    latitude: 16.3067, longitude: 80.4365,
    area_acres: 5.2,
    irrigation: 'Drip',
    irrigation_type: 'Drip',
  },
  {
    farm_id: 105, farmer_id: 1,
    name: 'Varanasi Gangetic Plains',
    location_name: 'Varanasi, Uttar Pradesh',
    latitude: 25.3176, longitude: 82.9739,
    area_acres: 3.8,
    irrigation: 'Tube Well',
    irrigation_type: 'Tube Well',
  },
  {
    farm_id: 106, farmer_id: 1,
    name: 'Indore Malwa Farm',
    location_name: 'Indore, Madhya Pradesh',
    latitude: 22.7196, longitude: 75.8577,
    area_acres: 7.0,
    irrigation: 'Rainfed & Sprinkler',
    irrigation_type: 'Rainfed & Sprinkler',
  },
  {
    farm_id: 107, farmer_id: 1,
    name: 'Mysuru Deccan Basin',
    location_name: 'Mysuru, Karnataka',
    latitude: 12.2958, longitude: 76.6394,
    area_acres: 4.0,
    irrigation: 'Drip & Borewell',
    irrigation_type: 'Drip & Borewell',
  },
];

let soil_data = [
  {
    soil_id: 5001, farm_id: 101, recorded_date: '2026-09-01',
    nitrogen: 42, phosphorus: 28, potassium: 55,
    ph: 6.5, organic_carbon: 0.52,
    soil_health_score: 58,
    deficiencies: ['Low Nitrogen', 'Low Organic Carbon'],
    adequate: ['Potassium', 'pH'],
    source: 'lab_report',
  },
  {
    soil_id: 5002, farm_id: 102, recorded_date: '2026-09-01',
    nitrogen: 65, phosphorus: 35, potassium: 72,
    ph: 7.2, organic_carbon: 0.68,
    soil_health_score: 74,
    deficiencies: ['Moderate Nitrogen'],
    adequate: ['Phosphorus', 'Potassium', 'pH'],
    source: 'lab_report',
  },
  {
    soil_id: 5003, farm_id: 103, recorded_date: '2026-09-01',
    nitrogen: 50, phosphorus: 42, potassium: 48,
    ph: 7.8, organic_carbon: 0.45,
    soil_health_score: 61,
    deficiencies: ['Low Organic Carbon', 'High Alkalinity'],
    adequate: ['Phosphorus'],
    source: 'lab_report',
  },
  {
    soil_id: 5004, farm_id: 104, recorded_date: '2026-09-01',
    nitrogen: 38, phosphorus: 25, potassium: 60,
    ph: 6.8, organic_carbon: 0.48,
    soil_health_score: 54,
    deficiencies: ['Low Nitrogen', 'Low Phosphorus'],
    adequate: ['Potassium', 'pH'],
    source: 'lab_report',
  },
  {
    soil_id: 5005, farm_id: 105, recorded_date: '2026-09-01',
    nitrogen: 58, phosphorus: 32, potassium: 64,
    ph: 7.0, organic_carbon: 0.62,
    soil_health_score: 69,
    deficiencies: ['Slight Nitrogen Deficit'],
    adequate: ['Phosphorus', 'Potassium', 'Organic Carbon'],
    source: 'lab_report',
  },
  {
    soil_id: 5006, farm_id: 106, recorded_date: '2026-09-01',
    nitrogen: 46, phosphorus: 30, potassium: 52,
    ph: 7.4, organic_carbon: 0.55,
    soil_health_score: 62,
    deficiencies: ['Low Nitrogen'],
    adequate: ['Potassium', 'pH'],
    source: 'lab_report',
  },
  {
    soil_id: 5007, farm_id: 107, recorded_date: '2026-09-01',
    nitrogen: 52, phosphorus: 38, potassium: 68,
    ph: 6.3, organic_carbon: 0.71,
    soil_health_score: 72,
    deficiencies: ['Mild Acidity'],
    adequate: ['Nitrogen', 'Phosphorus', 'Potassium', 'Organic Carbon'],
    source: 'lab_report',
  },
];

const tomatoCrop = crops.find(c => c.name === 'Tomato');
const tomatoId = tomatoCrop ? tomatoCrop.crop_id : 48;

let crop_history = [
  { history_id: 1, farm_id: 101, crop_id: tomatoId, season_id: 1, year: 2023, sequence_order: 1, yield_actual: 8500, cost_actual: 36000, revenue_actual: 51000, profit_actual: 15000 },
  { history_id: 2, farm_id: 101, crop_id: tomatoId, season_id: 2, year: 2024, sequence_order: 2, yield_actual: 8800, cost_actual: 37000, revenue_actual: 49000, profit_actual: 12000 },
  { history_id: 3, farm_id: 101, crop_id: tomatoId, season_id: 1, year: 2025, sequence_order: 3, yield_actual: 8200, cost_actual: 38000, revenue_actual: 47000, profit_actual: 9000 },
  { history_id: 4, farm_id: 102, crop_id: 44, season_id: 1, year: 2025, sequence_order: 1, yield_actual: 1200, cost_actual: 18000, revenue_actual: 42000, profit_actual: 24000 },
  { history_id: 5, farm_id: 103, crop_id: 50, season_id: 2, year: 2025, sequence_order: 1, yield_actual: 2400, cost_actual: 22000, revenue_actual: 58000, profit_actual: 36000 },
];

let weather_data = [
  { weather_id: 1, farm_id: 101, season_id: 1, year: 2026, rainfall_mm: 1120, avg_temp_c: 28.5, humidity_pct: 72, water_availability_index: 68 },
];

let crop_evaluations = [];
let rotation_plans = [];
let rotation_plan_seasons = [];
let soil_simulation_log = [];
let recommendations = [];

const counters = { soil_id: 5002, eval_id: 1, plan_id: 7001, plan_season_id: 1, sim_id: 1, rec_id: 1, history_id: 4 };

module.exports = {
  seasons, crops, farmers, farms,
  soil_data, crop_history, weather_data,
  crop_evaluations, rotation_plans, rotation_plan_seasons,
  soil_simulation_log, recommendations,
  counters,
  uuidv4,
};
