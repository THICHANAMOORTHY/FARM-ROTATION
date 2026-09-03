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

const farmers = [];
const farms = [];
let soil_data = [];
let crop_history = [];
let weather_data = [];

let crop_evaluations = [];
let rotation_plans = [];
let rotation_plan_seasons = [];
let soil_simulation_log = [];
let recommendations = [];

const counters = { soil_id: 1, eval_id: 1, plan_id: 1, plan_season_id: 1, sim_id: 1, rec_id: 1, history_id: 1 };

module.exports = {
  seasons, crops, farmers, farms,
  soil_data, crop_history, weather_data,
  crop_evaluations, rotation_plans, rotation_plan_seasons,
  soil_simulation_log, recommendations,
  counters,
  uuidv4,
};
