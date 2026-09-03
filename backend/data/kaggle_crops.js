// ============================================================
// kaggle_crops.js — Auto-generated from 3 merged Kaggle datasets
// Sources:
//   1. madhuraatmarambhagat/crop-recommendation-dataset  (2200 rows)
//   2. aksahaha/crop-recommendation                       (2200 rows)
//   3. javakhan/crops-npk-data-set                        (20000 rows)
// Total rows: 24,400  |  Unique crops: 26
// Generated : 2026-09-03 10:51:30
// Regenerate : python process_crop_dataset.py
// ============================================================

const kaggleCrops = [
  {
    "crop_id": 1,
    "name": "Apple",
    "crop_family": "Fruit",
    "growth_duration_days": 365,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 25.0,
    "p_demand": 136.5,
    "k_demand": 200.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 5000,
    "avg_market_price": 100,
    "avg_cultivation_cost": 50000,
    "disease_risk_index": 35,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 22.6,
    "avg_humidity_pct": 92.3,
    "avg_rainfall_mm": 112.7,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 21.443,
        "median": 25.0,
        "stdev": 11.425,
        "min": 1.0,
        "max": 40.0,
        "n": 194
      },
      "P": {
        "mean": 134.22,
        "median": 136.5,
        "stdev": 8.119,
        "min": 120.0,
        "max": 145.0,
        "n": 200
      },
      "K": {
        "mean": 199.89,
        "median": 200.0,
        "stdev": 3.313,
        "min": 195.0,
        "max": 205.0,
        "n": 200
      },
      "ph": {
        "mean": 5.93,
        "median": 5.886,
        "stdev": 0.268,
        "min": 5.514,
        "max": 6.499,
        "n": 200
      },
      "temperature": {
        "mean": 22.631,
        "median": 22.628,
        "stdev": 0.825,
        "min": 21.037,
        "max": 23.997,
        "n": 200
      },
      "humidity": {
        "mean": 92.333,
        "median": 92.417,
        "stdev": 1.455,
        "min": 90.026,
        "max": 94.92,
        "n": 200
      },
      "rainfall": {
        "mean": 112.655,
        "median": 112.979,
        "stdev": 7.085,
        "min": 100.117,
        "max": 124.983,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 194
  },
  {
    "crop_id": 2,
    "name": "Banana",
    "crop_family": "Fruit",
    "growth_duration_days": 270,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 100.5,
    "p_demand": 81.0,
    "k_demand": 50.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 8000,
    "avg_market_price": 25,
    "avg_cultivation_cost": 40000,
    "disease_risk_index": 50,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.4,
    "avg_humidity_pct": 80.4,
    "avg_rainfall_mm": 104.6,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 100.23,
        "median": 100.5,
        "stdev": 11.079,
        "min": 80.0,
        "max": 120.0,
        "n": 200
      },
      "P": {
        "mean": 82.01,
        "median": 81.0,
        "stdev": 7.671,
        "min": 70.0,
        "max": 95.0,
        "n": 200
      },
      "K": {
        "mean": 50.05,
        "median": 50.0,
        "stdev": 3.374,
        "min": 45.0,
        "max": 55.0,
        "n": 200
      },
      "ph": {
        "mean": 5.984,
        "median": 5.994,
        "stdev": 0.27,
        "min": 5.505,
        "max": 6.49,
        "n": 200
      },
      "temperature": {
        "mean": 27.377,
        "median": 27.443,
        "stdev": 1.425,
        "min": 25.01,
        "max": 29.909,
        "n": 200
      },
      "humidity": {
        "mean": 80.358,
        "median": 80.224,
        "stdev": 2.798,
        "min": 75.032,
        "max": 84.978,
        "n": 200
      },
      "rainfall": {
        "mean": 104.627,
        "median": 105.008,
        "stdev": 9.375,
        "min": 90.11,
        "max": 119.848,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 3,
    "name": "Blackgram",
    "crop_family": "Legume",
    "growth_duration_days": 70,
    "water_requirement": "Low",
    "ideal_ph_min": 6.4,
    "ideal_ph_max": 7.9,
    "n_demand": 41.0,
    "p_demand": 67.0,
    "k_demand": 19.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 550,
    "avg_market_price": 90,
    "avg_cultivation_cost": 9500,
    "disease_risk_index": 22,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 30.0,
    "avg_humidity_pct": 65.1,
    "avg_rainfall_mm": 67.9,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 40.02,
        "median": 41.0,
        "stdev": 12.632,
        "min": 20.0,
        "max": 60.0,
        "n": 200
      },
      "P": {
        "mean": 67.47,
        "median": 67.0,
        "stdev": 7.133,
        "min": 55.0,
        "max": 80.0,
        "n": 200
      },
      "K": {
        "mean": 19.24,
        "median": 19.0,
        "stdev": 3.18,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 7.134,
        "median": 7.165,
        "stdev": 0.372,
        "min": 6.5,
        "max": 7.775,
        "n": 200
      },
      "temperature": {
        "mean": 29.973,
        "median": 29.656,
        "stdev": 2.68,
        "min": 25.097,
        "max": 34.947,
        "n": 200
      },
      "humidity": {
        "mean": 65.118,
        "median": 65.027,
        "stdev": 2.791,
        "min": 60.065,
        "max": 69.961,
        "n": 200
      },
      "rainfall": {
        "mean": 67.884,
        "median": 68.294,
        "stdev": 4.174,
        "min": 60.418,
        "max": 74.916,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 4,
    "name": "Chickpea",
    "crop_family": "Legume",
    "growth_duration_days": 90,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.6,
    "ideal_ph_max": 8.1,
    "n_demand": 39.0,
    "p_demand": 68.0,
    "k_demand": 79.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 600,
    "avg_market_price": 70,
    "avg_cultivation_cost": 10000,
    "disease_risk_index": 20,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 18.9,
    "avg_humidity_pct": 16.9,
    "avg_rainfall_mm": 80.1,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 40.09,
        "median": 39.0,
        "stdev": 12.12,
        "min": 20.0,
        "max": 60.0,
        "n": 200
      },
      "P": {
        "mean": 67.79,
        "median": 68.0,
        "stdev": 7.48,
        "min": 55.0,
        "max": 80.0,
        "n": 200
      },
      "K": {
        "mean": 79.92,
        "median": 79.0,
        "stdev": 3.254,
        "min": 75.0,
        "max": 85.0,
        "n": 200
      },
      "ph": {
        "mean": 7.337,
        "median": 7.357,
        "stdev": 0.799,
        "min": 5.989,
        "max": 8.869,
        "n": 200
      },
      "temperature": {
        "mean": 18.873,
        "median": 18.878,
        "stdev": 1.167,
        "min": 17.025,
        "max": 20.995,
        "n": 200
      },
      "humidity": {
        "mean": 16.86,
        "median": 16.659,
        "stdev": 1.708,
        "min": 14.258,
        "max": 19.97,
        "n": 200
      },
      "rainfall": {
        "mean": 80.059,
        "median": 79.692,
        "stdev": 7.924,
        "min": 65.114,
        "max": 94.782,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 5,
    "name": "Coconut",
    "crop_family": "Fruit",
    "growth_duration_days": 365,
    "water_requirement": "High",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 24.5,
    "p_demand": 15.5,
    "k_demand": 31.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 6000,
    "avg_market_price": 15,
    "avg_cultivation_cost": 20000,
    "disease_risk_index": 20,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.4,
    "avg_humidity_pct": 94.8,
    "avg_rainfall_mm": 175.7,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 22.896,
        "median": 24.5,
        "stdev": 11.06,
        "min": 1.0,
        "max": 40.0,
        "n": 192
      },
      "P": {
        "mean": 16.93,
        "median": 15.5,
        "stdev": 8.336,
        "min": 5.0,
        "max": 30.0,
        "n": 200
      },
      "K": {
        "mean": 30.59,
        "median": 31.0,
        "stdev": 2.991,
        "min": 25.0,
        "max": 35.0,
        "n": 200
      },
      "ph": {
        "mean": 5.977,
        "median": 5.991,
        "stdev": 0.287,
        "min": 5.502,
        "max": 6.47,
        "n": 200
      },
      "temperature": {
        "mean": 27.41,
        "median": 27.385,
        "stdev": 1.382,
        "min": 25.009,
        "max": 29.869,
        "n": 200
      },
      "humidity": {
        "mean": 94.844,
        "median": 94.961,
        "stdev": 2.68,
        "min": 90.017,
        "max": 99.982,
        "n": 200
      },
      "rainfall": {
        "mean": 175.687,
        "median": 172.0,
        "stdev": 29.398,
        "min": 131.09,
        "max": 225.632,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 192
  },
  {
    "crop_id": 6,
    "name": "Coffee",
    "crop_family": "Commercial",
    "growth_duration_days": 365,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 103.0,
    "p_demand": 29.0,
    "k_demand": 30.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 400,
    "avg_market_price": 200,
    "avg_cultivation_cost": 30000,
    "disease_risk_index": 45,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 25.5,
    "avg_humidity_pct": 58.9,
    "avg_rainfall_mm": 158.1,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 101.2,
        "median": 103.0,
        "stdev": 12.314,
        "min": 80.0,
        "max": 120.0,
        "n": 200
      },
      "P": {
        "mean": 28.74,
        "median": 29.0,
        "stdev": 7.258,
        "min": 15.0,
        "max": 40.0,
        "n": 200
      },
      "K": {
        "mean": 29.94,
        "median": 30.0,
        "stdev": 3.239,
        "min": 25.0,
        "max": 35.0,
        "n": 200
      },
      "ph": {
        "mean": 6.79,
        "median": 6.799,
        "stdev": 0.416,
        "min": 6.021,
        "max": 7.493,
        "n": 200
      },
      "temperature": {
        "mean": 25.54,
        "median": 25.657,
        "stdev": 1.499,
        "min": 23.06,
        "max": 27.924,
        "n": 200
      },
      "humidity": {
        "mean": 58.87,
        "median": 57.648,
        "stdev": 5.824,
        "min": 50.046,
        "max": 69.948,
        "n": 200
      },
      "rainfall": {
        "mean": 158.066,
        "median": 157.771,
        "stdev": 25.63,
        "min": 115.156,
        "max": 199.474,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 7,
    "name": "Cotton",
    "crop_family": "Commercial",
    "growth_duration_days": 180,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.2,
    "ideal_ph_max": 7.7,
    "n_demand": 117.0,
    "p_demand": 46.0,
    "k_demand": 19.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 800,
    "avg_market_price": 65,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 55,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 24.0,
    "avg_humidity_pct": 79.8,
    "avg_rainfall_mm": 80.4,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 117.77,
        "median": 117.0,
        "stdev": 11.6,
        "min": 100.0,
        "max": 140.0,
        "n": 200
      },
      "P": {
        "mean": 46.24,
        "median": 46.0,
        "stdev": 7.33,
        "min": 35.0,
        "max": 60.0,
        "n": 200
      },
      "K": {
        "mean": 19.56,
        "median": 19.0,
        "stdev": 3.162,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 6.913,
        "median": 6.841,
        "stdev": 0.626,
        "min": 5.801,
        "max": 7.995,
        "n": 200
      },
      "temperature": {
        "mean": 23.989,
        "median": 23.965,
        "stdev": 1.133,
        "min": 22.001,
        "max": 25.992,
        "n": 200
      },
      "humidity": {
        "mean": 79.843,
        "median": 80.011,
        "stdev": 3.043,
        "min": 75.005,
        "max": 84.877,
        "n": 200
      },
      "rainfall": {
        "mean": 80.398,
        "median": 80.237,
        "stdev": 11.204,
        "min": 60.654,
        "max": 99.931,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 8,
    "name": "Grapes",
    "crop_family": "Fruit",
    "growth_duration_days": 180,
    "water_requirement": "Low",
    "ideal_ph_min": 5.3,
    "ideal_ph_max": 6.8,
    "n_demand": 24.0,
    "p_demand": 133.0,
    "k_demand": 201.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 4000,
    "avg_market_price": 80,
    "avg_cultivation_cost": 45000,
    "disease_risk_index": 60,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 23.9,
    "avg_humidity_pct": 81.9,
    "avg_rainfall_mm": 69.6,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 23.414,
        "median": 24.0,
        "stdev": 12.276,
        "min": 1.0,
        "max": 40.0,
        "n": 198
      },
      "P": {
        "mean": 132.53,
        "median": 133.0,
        "stdev": 7.6,
        "min": 120.0,
        "max": 145.0,
        "n": 200
      },
      "K": {
        "mean": 200.11,
        "median": 201.0,
        "stdev": 3.257,
        "min": 195.0,
        "max": 205.0,
        "n": 200
      },
      "ph": {
        "mean": 6.026,
        "median": 6.002,
        "stdev": 0.298,
        "min": 5.511,
        "max": 6.5,
        "n": 200
      },
      "temperature": {
        "mean": 23.85,
        "median": 23.019,
        "stdev": 9.714,
        "min": 8.826,
        "max": 41.949,
        "n": 200
      },
      "humidity": {
        "mean": 81.875,
        "median": 81.725,
        "stdev": 1.174,
        "min": 80.016,
        "max": 83.984,
        "n": 200
      },
      "rainfall": {
        "mean": 69.612,
        "median": 69.536,
        "stdev": 2.944,
        "min": 65.011,
        "max": 74.915,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 198
  },
  {
    "crop_id": 9,
    "name": "Jute",
    "crop_family": "Commercial",
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 78.0,
    "p_demand": 46.0,
    "k_demand": 40.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 1500,
    "avg_market_price": 40,
    "avg_cultivation_cost": 15000,
    "disease_risk_index": 30,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 25.0,
    "avg_humidity_pct": 79.6,
    "avg_rainfall_mm": 174.8,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 78.4,
        "median": 78.0,
        "stdev": 10.941,
        "min": 60.0,
        "max": 100.0,
        "n": 200
      },
      "P": {
        "mean": 46.86,
        "median": 46.0,
        "stdev": 7.178,
        "min": 35.0,
        "max": 60.0,
        "n": 200
      },
      "K": {
        "mean": 39.99,
        "median": 40.0,
        "stdev": 3.305,
        "min": 35.0,
        "max": 45.0,
        "n": 200
      },
      "ph": {
        "mean": 6.733,
        "median": 6.711,
        "stdev": 0.445,
        "min": 6.003,
        "max": 7.488,
        "n": 200
      },
      "temperature": {
        "mean": 24.958,
        "median": 24.971,
        "stdev": 1.182,
        "min": 23.094,
        "max": 26.986,
        "n": 200
      },
      "humidity": {
        "mean": 79.64,
        "median": 79.469,
        "stdev": 5.494,
        "min": 70.883,
        "max": 89.891,
        "n": 200
      },
      "rainfall": {
        "mean": 174.793,
        "median": 175.591,
        "stdev": 15.04,
        "min": 150.236,
        "max": 199.836,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 10,
    "name": "Kidneybeans",
    "crop_family": "Legume",
    "growth_duration_days": 85,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 22.0,
    "p_demand": 67.0,
    "k_demand": 20.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 700,
    "avg_market_price": 80,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 25,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 20.1,
    "avg_humidity_pct": 21.6,
    "avg_rainfall_mm": 105.9,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 21.173,
        "median": 22.0,
        "stdev": 10.496,
        "min": 1.0,
        "max": 40.0,
        "n": 196
      },
      "P": {
        "mean": 67.54,
        "median": 67.0,
        "stdev": 7.552,
        "min": 55.0,
        "max": 80.0,
        "n": 200
      },
      "K": {
        "mean": 20.05,
        "median": 20.0,
        "stdev": 3.094,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 5.749,
        "median": 5.745,
        "stdev": 0.145,
        "min": 5.503,
        "max": 5.998,
        "n": 200
      },
      "temperature": {
        "mean": 20.115,
        "median": 19.924,
        "stdev": 2.593,
        "min": 15.33,
        "max": 24.924,
        "n": 200
      },
      "humidity": {
        "mean": 21.605,
        "median": 21.349,
        "stdev": 2.162,
        "min": 18.092,
        "max": 24.97,
        "n": 200
      },
      "rainfall": {
        "mean": 105.92,
        "median": 107.399,
        "stdev": 26.046,
        "min": 60.276,
        "max": 149.744,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 196
  },
  {
    "crop_id": 11,
    "name": "Lentil",
    "crop_family": "Legume",
    "growth_duration_days": 110,
    "water_requirement": "Low",
    "ideal_ph_min": 6.2,
    "ideal_ph_max": 7.7,
    "n_demand": 18.0,
    "p_demand": 68.0,
    "k_demand": 19.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 500,
    "avg_market_price": 65,
    "avg_cultivation_cost": 9000,
    "disease_risk_index": 18,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 24.5,
    "avg_humidity_pct": 64.8,
    "avg_rainfall_mm": 45.7,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 19.552,
        "median": 18.0,
        "stdev": 11.783,
        "min": 1.0,
        "max": 40.0,
        "n": 192
      },
      "P": {
        "mean": 68.36,
        "median": 68.0,
        "stdev": 7.317,
        "min": 55.0,
        "max": 80.0,
        "n": 200
      },
      "K": {
        "mean": 19.41,
        "median": 19.0,
        "stdev": 2.961,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 6.928,
        "median": 6.954,
        "stdev": 0.548,
        "min": 5.916,
        "max": 7.841,
        "n": 200
      },
      "temperature": {
        "mean": 24.509,
        "median": 24.947,
        "stdev": 3.313,
        "min": 18.065,
        "max": 29.944,
        "n": 200
      },
      "humidity": {
        "mean": 64.805,
        "median": 64.095,
        "stdev": 2.928,
        "min": 60.091,
        "max": 69.924,
        "n": 200
      },
      "rainfall": {
        "mean": 45.68,
        "median": 46.553,
        "stdev": 5.619,
        "min": 35.035,
        "max": 54.939,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 192
  },
  {
    "crop_id": 12,
    "name": "Maize",
    "crop_family": "Cereal",
    "growth_duration_days": 95,
    "water_requirement": "High",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 79.039,
    "p_demand": 46.327,
    "k_demand": 52.147,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 2500,
    "avg_market_price": 22,
    "avg_cultivation_cost": 20000,
    "disease_risk_index": 35,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.2,
    "avg_humidity_pct": 65.0,
    "avg_rainfall_mm": 202.1,
    "preferred_soil_types": [
      "Silt",
      "Sandy",
      "Saline"
    ],
    "stats": {
      "N": {
        "mean": 78.482,
        "median": 79.039,
        "stdev": 40.249,
        "min": 5.006,
        "max": 149.999,
        "n": 3552
      },
      "P": {
        "mean": 47.09,
        "median": 46.327,
        "stdev": 23.875,
        "min": 5.053,
        "max": 89.917,
        "n": 3552
      },
      "K": {
        "mean": 52.872,
        "median": 52.147,
        "stdev": 26.347,
        "min": 10.047,
        "max": 99.925,
        "n": 3552
      },
      "ph": {
        "mean": 6.499,
        "median": 6.486,
        "stdev": 1.14,
        "min": 4.501,
        "max": 8.5,
        "n": 3552
      },
      "temperature": {
        "mean": 27.152,
        "median": 26.353,
        "stdev": 9.74,
        "min": 10.005,
        "max": 44.985,
        "n": 3552
      },
      "humidity": {
        "mean": 65.024,
        "median": 65.034,
        "stdev": 19.761,
        "min": 30.005,
        "max": 99.989,
        "n": 3552
      },
      "rainfall": {
        "mean": 202.09,
        "median": 197.437,
        "stdev": 110.056,
        "min": 20.517,
        "max": 399.798,
        "n": 3552
      }
    },
    "data_sources": [
      "aksahaha",
      "javakhan",
      "madhuraatmarambhagat"
    ],
    "total_rows": 3552
  },
  {
    "crop_id": 13,
    "name": "Mango",
    "crop_family": "Fruit",
    "growth_duration_days": 365,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 21.0,
    "p_demand": 27.5,
    "k_demand": 30.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 4000,
    "avg_market_price": 60,
    "avg_cultivation_cost": 20000,
    "disease_risk_index": 25,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 31.2,
    "avg_humidity_pct": 50.2,
    "avg_rainfall_mm": 94.7,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 20.691,
        "median": 21.0,
        "stdev": 11.96,
        "min": 1.0,
        "max": 40.0,
        "n": 194
      },
      "P": {
        "mean": 27.18,
        "median": 27.5,
        "stdev": 7.645,
        "min": 15.0,
        "max": 40.0,
        "n": 200
      },
      "K": {
        "mean": 29.92,
        "median": 30.0,
        "stdev": 3.089,
        "min": 25.0,
        "max": 35.0,
        "n": 200
      },
      "ph": {
        "mean": 5.766,
        "median": 5.743,
        "stdev": 0.702,
        "min": 4.508,
        "max": 6.967,
        "n": 200
      },
      "temperature": {
        "mean": 31.209,
        "median": 31.3,
        "stdev": 2.647,
        "min": 27.003,
        "max": 35.99,
        "n": 200
      },
      "humidity": {
        "mean": 50.157,
        "median": 50.282,
        "stdev": 2.749,
        "min": 45.022,
        "max": 54.964,
        "n": 200
      },
      "rainfall": {
        "mean": 94.705,
        "median": 94.906,
        "stdev": 3.33,
        "min": 89.291,
        "max": 100.812,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 194
  },
  {
    "crop_id": 14,
    "name": "Mothbeans",
    "crop_family": "Legume",
    "growth_duration_days": 75,
    "water_requirement": "Low",
    "ideal_ph_min": 6.1,
    "ideal_ph_max": 7.6,
    "n_demand": 22.0,
    "p_demand": 48.5,
    "k_demand": 20.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 400,
    "avg_market_price": 60,
    "avg_cultivation_cost": 8000,
    "disease_risk_index": 20,
    "suitable_seasons": [
      "Kharif",
      "Zaid"
    ],
    "avg_temperature_c": 28.2,
    "avg_humidity_pct": 53.2,
    "avg_rainfall_mm": 51.2,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 21.657,
        "median": 22.0,
        "stdev": 11.163,
        "min": 2.0,
        "max": 40.0,
        "n": 198
      },
      "P": {
        "mean": 48.01,
        "median": 48.5,
        "stdev": 7.528,
        "min": 35.0,
        "max": 60.0,
        "n": 200
      },
      "K": {
        "mean": 20.23,
        "median": 20.0,
        "stdev": 3.04,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 6.831,
        "median": 7.219,
        "stdev": 1.857,
        "min": 3.505,
        "max": 9.935,
        "n": 200
      },
      "temperature": {
        "mean": 28.195,
        "median": 28.371,
        "stdev": 2.204,
        "min": 24.018,
        "max": 31.999,
        "n": 200
      },
      "humidity": {
        "mean": 53.16,
        "median": 53.668,
        "stdev": 6.977,
        "min": 40.009,
        "max": 64.956,
        "n": 200
      },
      "rainfall": {
        "mean": 51.198,
        "median": 51.183,
        "stdev": 13.716,
        "min": 30.92,
        "max": 74.443,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 198
  },
  {
    "crop_id": 15,
    "name": "Mungbean",
    "crop_family": "Legume",
    "growth_duration_days": 65,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 22.0,
    "p_demand": 47.0,
    "k_demand": 20.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 550,
    "avg_market_price": 85,
    "avg_cultivation_cost": 10000,
    "disease_risk_index": 22,
    "suitable_seasons": [
      "Kharif",
      "Zaid"
    ],
    "avg_temperature_c": 28.5,
    "avg_humidity_pct": 85.5,
    "avg_rainfall_mm": 48.4,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 21.202,
        "median": 22.0,
        "stdev": 11.342,
        "min": 1.0,
        "max": 40.0,
        "n": 198
      },
      "P": {
        "mean": 47.28,
        "median": 47.0,
        "stdev": 7.85,
        "min": 35.0,
        "max": 60.0,
        "n": 200
      },
      "K": {
        "mean": 19.87,
        "median": 20.0,
        "stdev": 3.14,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 6.724,
        "median": 6.704,
        "stdev": 0.286,
        "min": 6.219,
        "max": 7.199,
        "n": 200
      },
      "temperature": {
        "mean": 28.526,
        "median": 28.442,
        "stdev": 0.839,
        "min": 27.015,
        "max": 29.915,
        "n": 200
      },
      "humidity": {
        "mean": 85.5,
        "median": 85.954,
        "stdev": 2.844,
        "min": 80.035,
        "max": 89.996,
        "n": 200
      },
      "rainfall": {
        "mean": 48.404,
        "median": 49.028,
        "stdev": 7.099,
        "min": 36.12,
        "max": 59.872,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 198
  },
  {
    "crop_id": 16,
    "name": "Muskmelon",
    "crop_family": "Fruit",
    "growth_duration_days": 75,
    "water_requirement": "Low",
    "ideal_ph_min": 5.6,
    "ideal_ph_max": 7.1,
    "n_demand": 100.0,
    "p_demand": 18.0,
    "k_demand": 50.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 6000,
    "avg_market_price": 12,
    "avg_cultivation_cost": 14000,
    "disease_risk_index": 28,
    "suitable_seasons": [
      "Zaid"
    ],
    "avg_temperature_c": 28.7,
    "avg_humidity_pct": 92.3,
    "avg_rainfall_mm": 24.7,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 100.32,
        "median": 100.0,
        "stdev": 12.146,
        "min": 80.0,
        "max": 120.0,
        "n": 200
      },
      "P": {
        "mean": 17.72,
        "median": 18.0,
        "stdev": 7.169,
        "min": 5.0,
        "max": 30.0,
        "n": 200
      },
      "K": {
        "mean": 50.08,
        "median": 50.0,
        "stdev": 3.21,
        "min": 45.0,
        "max": 55.0,
        "n": 200
      },
      "ph": {
        "mean": 6.359,
        "median": 6.353,
        "stdev": 0.231,
        "min": 6.003,
        "max": 6.781,
        "n": 200
      },
      "temperature": {
        "mean": 28.663,
        "median": 28.852,
        "stdev": 0.859,
        "min": 27.024,
        "max": 29.943,
        "n": 200
      },
      "humidity": {
        "mean": 92.343,
        "median": 92.111,
        "stdev": 1.501,
        "min": 90.015,
        "max": 94.962,
        "n": 200
      },
      "rainfall": {
        "mean": 24.69,
        "median": 24.722,
        "stdev": 2.767,
        "min": 20.211,
        "max": 29.867,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 17,
    "name": "Orange",
    "crop_family": "Fruit",
    "growth_duration_days": 365,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.3,
    "ideal_ph_max": 7.8,
    "n_demand": 19.5,
    "p_demand": 16.0,
    "k_demand": 10.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 4500,
    "avg_market_price": 55,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 30,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 22.8,
    "avg_humidity_pct": 92.2,
    "avg_rainfall_mm": 110.5,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 20.396,
        "median": 19.5,
        "stdev": 11.45,
        "min": 1.0,
        "max": 40.0,
        "n": 192
      },
      "P": {
        "mean": 16.55,
        "median": 16.0,
        "stdev": 7.672,
        "min": 5.0,
        "max": 30.0,
        "n": 200
      },
      "K": {
        "mean": 10.01,
        "median": 10.0,
        "stdev": 3.049,
        "min": 5.0,
        "max": 15.0,
        "n": 200
      },
      "ph": {
        "mean": 7.017,
        "median": 7.023,
        "stdev": 0.575,
        "min": 6.01,
        "max": 7.996,
        "n": 200
      },
      "temperature": {
        "mean": 22.766,
        "median": 22.901,
        "stdev": 7.324,
        "min": 10.011,
        "max": 34.907,
        "n": 200
      },
      "humidity": {
        "mean": 92.17,
        "median": 91.963,
        "stdev": 1.427,
        "min": 90.006,
        "max": 94.964,
        "n": 200
      },
      "rainfall": {
        "mean": 110.475,
        "median": 110.684,
        "stdev": 5.703,
        "min": 100.174,
        "max": 119.695,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 192
  },
  {
    "crop_id": 18,
    "name": "Papaya",
    "crop_family": "Fruit",
    "growth_duration_days": 240,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 49.0,
    "p_demand": 60.0,
    "k_demand": 50.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 7000,
    "avg_market_price": 20,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 40,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 33.7,
    "avg_humidity_pct": 92.4,
    "avg_rainfall_mm": 142.6,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 49.88,
        "median": 49.0,
        "stdev": 12.189,
        "min": 31.0,
        "max": 70.0,
        "n": 200
      },
      "P": {
        "mean": 59.05,
        "median": 60.0,
        "stdev": 7.04,
        "min": 46.0,
        "max": 70.0,
        "n": 200
      },
      "K": {
        "mean": 50.04,
        "median": 50.0,
        "stdev": 3.09,
        "min": 45.0,
        "max": 55.0,
        "n": 200
      },
      "ph": {
        "mean": 6.741,
        "median": 6.741,
        "stdev": 0.147,
        "min": 6.502,
        "max": 6.993,
        "n": 200
      },
      "temperature": {
        "mean": 33.724,
        "median": 33.263,
        "stdev": 6.247,
        "min": 23.012,
        "max": 43.675,
        "n": 200
      },
      "humidity": {
        "mean": 92.403,
        "median": 92.681,
        "stdev": 1.417,
        "min": 90.039,
        "max": 94.945,
        "n": 200
      },
      "rainfall": {
        "mean": 142.628,
        "median": 139.001,
        "stdev": 64.235,
        "min": 40.352,
        "max": 248.859,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 19,
    "name": "Pigeonpeas",
    "crop_family": "Legume",
    "growth_duration_days": 150,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 20.0,
    "p_demand": 69.5,
    "k_demand": 20.0,
    "is_nitrogen_fixer": true,
    "avg_yield_per_acre": 650,
    "avg_market_price": 75,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 25,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 27.7,
    "avg_humidity_pct": 48.1,
    "avg_rainfall_mm": 149.5,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 20.939,
        "median": 20.0,
        "stdev": 11.693,
        "min": 1.0,
        "max": 40.0,
        "n": 198
      },
      "P": {
        "mean": 67.73,
        "median": 69.5,
        "stdev": 7.276,
        "min": 55.0,
        "max": 80.0,
        "n": 200
      },
      "K": {
        "mean": 20.29,
        "median": 20.0,
        "stdev": 2.808,
        "min": 15.0,
        "max": 25.0,
        "n": 200
      },
      "ph": {
        "mean": 5.794,
        "median": 5.69,
        "stdev": 0.828,
        "min": 4.548,
        "max": 7.445,
        "n": 200
      },
      "temperature": {
        "mean": 27.742,
        "median": 28.932,
        "stdev": 5.701,
        "min": 18.319,
        "max": 36.978,
        "n": 200
      },
      "humidity": {
        "mean": 48.062,
        "median": 47.195,
        "stdev": 10.936,
        "min": 30.4,
        "max": 69.691,
        "n": 200
      },
      "rainfall": {
        "mean": 149.458,
        "median": 154.311,
        "stdev": 32.903,
        "min": 90.054,
        "max": 198.83,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 198
  },
  {
    "crop_id": 20,
    "name": "Pomegranate",
    "crop_family": "Fruit",
    "growth_duration_days": 180,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 18.0,
    "p_demand": 20.0,
    "k_demand": 40.0,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 3000,
    "avg_market_price": 120,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 22,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 21.8,
    "avg_humidity_pct": 90.1,
    "avg_rainfall_mm": 107.5,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 19.454,
        "median": 18.0,
        "stdev": 12.325,
        "min": 1.0,
        "max": 40.0,
        "n": 194
      },
      "P": {
        "mean": 18.75,
        "median": 20.0,
        "stdev": 7.369,
        "min": 5.0,
        "max": 30.0,
        "n": 200
      },
      "K": {
        "mean": 40.21,
        "median": 40.0,
        "stdev": 3.025,
        "min": 35.0,
        "max": 45.0,
        "n": 200
      },
      "ph": {
        "mean": 6.429,
        "median": 6.431,
        "stdev": 0.49,
        "min": 5.562,
        "max": 7.2,
        "n": 200
      },
      "temperature": {
        "mean": 21.838,
        "median": 22.354,
        "stdev": 2.201,
        "min": 18.071,
        "max": 24.963,
        "n": 200
      },
      "humidity": {
        "mean": 90.126,
        "median": 89.912,
        "stdev": 2.819,
        "min": 85.129,
        "max": 94.999,
        "n": 200
      },
      "rainfall": {
        "mean": 107.528,
        "median": 107.588,
        "stdev": 2.888,
        "min": 102.518,
        "max": 112.475,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 194
  },
  {
    "crop_id": 21,
    "name": "Potato",
    "crop_family": "Vegetable",
    "growth_duration_days": 90,
    "water_requirement": "High",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 74.635,
    "p_demand": 47.961,
    "k_demand": 54.515,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 8000,
    "avg_market_price": 15,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 45,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 27.7,
    "avg_humidity_pct": 64.6,
    "avg_rainfall_mm": 211.6,
    "preferred_soil_types": [
      "Silt",
      "Clay",
      "Saline"
    ],
    "stats": {
      "N": {
        "mean": 75.494,
        "median": 74.635,
        "stdev": 41.876,
        "min": 5.058,
        "max": 149.948,
        "n": 3362
      },
      "P": {
        "mean": 47.622,
        "median": 47.961,
        "stdev": 24.52,
        "min": 5.0,
        "max": 89.999,
        "n": 3362
      },
      "K": {
        "mean": 54.796,
        "median": 54.515,
        "stdev": 26.04,
        "min": 10.047,
        "max": 99.991,
        "n": 3362
      },
      "ph": {
        "mean": 6.5,
        "median": 6.508,
        "stdev": 1.162,
        "min": 4.501,
        "max": 8.5,
        "n": 3362
      },
      "temperature": {
        "mean": 27.744,
        "median": 27.674,
        "stdev": 9.997,
        "min": 10.004,
        "max": 44.989,
        "n": 3362
      },
      "humidity": {
        "mean": 64.583,
        "median": 63.899,
        "stdev": 20.136,
        "min": 30.002,
        "max": 99.99,
        "n": 3362
      },
      "rainfall": {
        "mean": 211.642,
        "median": 210.401,
        "stdev": 110.817,
        "min": 20.019,
        "max": 399.895,
        "n": 3362
      }
    },
    "data_sources": [
      "javakhan"
    ],
    "total_rows": 3362
  },
  {
    "crop_id": 22,
    "name": "Rice",
    "crop_family": "Cereal",
    "growth_duration_days": 130,
    "water_requirement": "High",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.3,
    "n_demand": 76.419,
    "p_demand": 48.014,
    "k_demand": 52.426,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 2800,
    "avg_market_price": 40,
    "avg_cultivation_cost": 25000,
    "disease_risk_index": 40,
    "suitable_seasons": [
      "Kharif"
    ],
    "avg_temperature_c": 27.1,
    "avg_humidity_pct": 65.4,
    "avg_rainfall_mm": 215.3,
    "preferred_soil_types": [
      "Saline",
      "Silt",
      "Clay"
    ],
    "stats": {
      "N": {
        "mean": 76.317,
        "median": 76.419,
        "stdev": 40.573,
        "min": 5.01,
        "max": 149.892,
        "n": 3468
      },
      "P": {
        "mean": 47.765,
        "median": 48.014,
        "stdev": 23.918,
        "min": 5.041,
        "max": 89.982,
        "n": 3468
      },
      "K": {
        "mean": 54.582,
        "median": 52.426,
        "stdev": 25.872,
        "min": 10.023,
        "max": 99.96,
        "n": 3468
      },
      "ph": {
        "mean": 6.506,
        "median": 6.498,
        "stdev": 1.129,
        "min": 4.5,
        "max": 8.5,
        "n": 3468
      },
      "temperature": {
        "mean": 27.144,
        "median": 26.367,
        "stdev": 9.726,
        "min": 10.005,
        "max": 44.997,
        "n": 3468
      },
      "humidity": {
        "mean": 65.413,
        "median": 66.169,
        "stdev": 20.302,
        "min": 30.061,
        "max": 99.949,
        "n": 3468
      },
      "rainfall": {
        "mean": 215.315,
        "median": 218.688,
        "stdev": 105.213,
        "min": 20.241,
        "max": 399.813,
        "n": 3468
      }
    },
    "data_sources": [
      "aksahaha",
      "javakhan",
      "madhuraatmarambhagat"
    ],
    "total_rows": 3468
  },
  {
    "crop_id": 23,
    "name": "Sugarcane",
    "crop_family": "Commercial",
    "growth_duration_days": 365,
    "water_requirement": "High",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.3,
    "n_demand": 78.374,
    "p_demand": 46.505,
    "k_demand": 56.477,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 40000,
    "avg_market_price": 3,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 40,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.2,
    "avg_humidity_pct": 64.9,
    "avg_rainfall_mm": 213.3,
    "preferred_soil_types": [
      "Saline",
      "Clay",
      "Peaty"
    ],
    "stats": {
      "N": {
        "mean": 77.957,
        "median": 78.374,
        "stdev": 42.236,
        "min": 5.066,
        "max": 149.967,
        "n": 3284
      },
      "P": {
        "mean": 46.911,
        "median": 46.505,
        "stdev": 24.658,
        "min": 5.013,
        "max": 89.934,
        "n": 3284
      },
      "K": {
        "mean": 55.291,
        "median": 56.477,
        "stdev": 25.732,
        "min": 10.001,
        "max": 99.972,
        "n": 3284
      },
      "ph": {
        "mean": 6.521,
        "median": 6.516,
        "stdev": 1.163,
        "min": 4.501,
        "max": 8.499,
        "n": 3284
      },
      "temperature": {
        "mean": 27.204,
        "median": 26.873,
        "stdev": 9.943,
        "min": 10.011,
        "max": 44.975,
        "n": 3284
      },
      "humidity": {
        "mean": 64.915,
        "median": 65.31,
        "stdev": 20.283,
        "min": 30.008,
        "max": 99.987,
        "n": 3284
      },
      "rainfall": {
        "mean": 213.266,
        "median": 217.398,
        "stdev": 110.189,
        "min": 20.057,
        "max": 399.975,
        "n": 3284
      }
    },
    "data_sources": [
      "javakhan"
    ],
    "total_rows": 3284
  },
  {
    "crop_id": 24,
    "name": "Tomato",
    "crop_family": "Solanaceae",
    "growth_duration_days": 110,
    "water_requirement": "High",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 76.632,
    "p_demand": 46.802,
    "k_demand": 54.714,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 9000,
    "avg_market_price": 20,
    "avg_cultivation_cost": 38000,
    "disease_risk_index": 55,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.6,
    "avg_humidity_pct": 65.5,
    "avg_rainfall_mm": 210.7,
    "preferred_soil_types": [
      "Peaty",
      "Loamy",
      "Clay"
    ],
    "stats": {
      "N": {
        "mean": 76.449,
        "median": 76.632,
        "stdev": 41.503,
        "min": 5.008,
        "max": 149.967,
        "n": 3344
      },
      "P": {
        "mean": 47.097,
        "median": 46.802,
        "stdev": 24.41,
        "min": 5.064,
        "max": 89.879,
        "n": 3344
      },
      "K": {
        "mean": 55.011,
        "median": 54.714,
        "stdev": 25.987,
        "min": 10.004,
        "max": 99.996,
        "n": 3344
      },
      "ph": {
        "mean": 6.467,
        "median": 6.462,
        "stdev": 1.15,
        "min": 4.502,
        "max": 8.499,
        "n": 3344
      },
      "temperature": {
        "mean": 27.581,
        "median": 27.847,
        "stdev": 10.058,
        "min": 10.006,
        "max": 44.985,
        "n": 3344
      },
      "humidity": {
        "mean": 65.523,
        "median": 65.496,
        "stdev": 19.986,
        "min": 30.071,
        "max": 99.992,
        "n": 3344
      },
      "rainfall": {
        "mean": 210.686,
        "median": 212.022,
        "stdev": 111.126,
        "min": 20.042,
        "max": 399.963,
        "n": 3344
      }
    },
    "data_sources": [
      "javakhan"
    ],
    "total_rows": 3344
  },
  {
    "crop_id": 25,
    "name": "Watermelon",
    "crop_family": "Fruit",
    "growth_duration_days": 80,
    "water_requirement": "Low",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 99.0,
    "p_demand": 17.5,
    "k_demand": 50.5,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 8000,
    "avg_market_price": 10,
    "avg_cultivation_cost": 15000,
    "disease_risk_index": 28,
    "suitable_seasons": [
      "Zaid"
    ],
    "avg_temperature_c": 25.6,
    "avg_humidity_pct": 85.2,
    "avg_rainfall_mm": 50.8,
    "preferred_soil_types": [],
    "stats": {
      "N": {
        "mean": 99.42,
        "median": 99.0,
        "stdev": 12.534,
        "min": 80.0,
        "max": 120.0,
        "n": 200
      },
      "P": {
        "mean": 17.0,
        "median": 17.5,
        "stdev": 7.517,
        "min": 5.0,
        "max": 30.0,
        "n": 200
      },
      "K": {
        "mean": 50.22,
        "median": 50.5,
        "stdev": 3.256,
        "min": 45.0,
        "max": 55.0,
        "n": 200
      },
      "ph": {
        "mean": 6.496,
        "median": 6.47,
        "stdev": 0.281,
        "min": 6.001,
        "max": 6.957,
        "n": 200
      },
      "temperature": {
        "mean": 25.592,
        "median": 25.604,
        "stdev": 0.848,
        "min": 24.044,
        "max": 26.986,
        "n": 200
      },
      "humidity": {
        "mean": 85.16,
        "median": 85.031,
        "stdev": 2.949,
        "min": 80.026,
        "max": 89.984,
        "n": 200
      },
      "rainfall": {
        "mean": 50.786,
        "median": 50.672,
        "stdev": 5.852,
        "min": 40.127,
        "max": 59.76,
        "n": 200
      }
    },
    "data_sources": [
      "aksahaha",
      "madhuraatmarambhagat"
    ],
    "total_rows": 200
  },
  {
    "crop_id": 26,
    "name": "Wheat",
    "crop_family": "Cereal",
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 79.618,
    "p_demand": 49.549,
    "k_demand": 55.521,
    "is_nitrogen_fixer": false,
    "avg_yield_per_acre": 1800,
    "avg_market_price": 25,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 30,
    "suitable_seasons": [
      "Rabi"
    ],
    "avg_temperature_c": 27.2,
    "avg_humidity_pct": 65.0,
    "avg_rainfall_mm": 208.2,
    "preferred_soil_types": [
      "Sandy",
      "Peaty",
      "Clay"
    ],
    "stats": {
      "N": {
        "mean": 78.75,
        "median": 79.618,
        "stdev": 42.42,
        "min": 5.029,
        "max": 149.991,
        "n": 3390
      },
      "P": {
        "mean": 48.459,
        "median": 49.549,
        "stdev": 24.856,
        "min": 5.044,
        "max": 89.963,
        "n": 3390
      },
      "K": {
        "mean": 55.559,
        "median": 55.521,
        "stdev": 25.884,
        "min": 10.004,
        "max": 99.976,
        "n": 3390
      },
      "ph": {
        "mean": 6.465,
        "median": 6.434,
        "stdev": 1.143,
        "min": 4.5,
        "max": 8.499,
        "n": 3390
      },
      "temperature": {
        "mean": 27.199,
        "median": 27.048,
        "stdev": 10.152,
        "min": 10.044,
        "max": 44.96,
        "n": 3390
      },
      "humidity": {
        "mean": 64.955,
        "median": 64.588,
        "stdev": 20.038,
        "min": 30.011,
        "max": 99.989,
        "n": 3390
      },
      "rainfall": {
        "mean": 208.17,
        "median": 205.299,
        "stdev": 108.877,
        "min": 20.089,
        "max": 399.907,
        "n": 3390
      }
    },
    "data_sources": [
      "javakhan"
    ],
    "total_rows": 3390
  }
];

module.exports = { kaggleCrops };
