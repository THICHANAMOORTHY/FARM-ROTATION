// ============================================================
// kaggle_crops.js — Unified Dual-Source Kaggle Agronomy Model
// Datasets merged:
//   1. madhuraatmarambhagat/crop-recommendation-dataset (2,200 rows)
//   2. akshatgupta7/crop-yield-in-indian-states-dataset (19,689 rows)
// Total records analyzed: 21,889 | Total unique crops: 60
// Generated: 2026-09-03 11:33:04
// ============================================================

const kaggleCrops = [
  {
    "crop_id": 1,
    "name": "Apple",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 24.0,
    "p_demand": 136.5,
    "k_demand": 200.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 100,
    "avg_cultivation_cost": 50000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 22.6,
    "avg_humidity_pct": 92.3,
    "avg_rainfall_mm": 113.0,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 2,
    "name": "Arecanut",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.2,
    "p_demand": 42.9,
    "k_demand": 42.9,
    "avg_yield_per_acre": 522.0,
    "avg_market_price": 220,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1838.8,
    "top_states": [
      "Kerala",
      "Assam",
      "Karnataka",
      "Meghalaya"
    ],
    "total_records": 160,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 3,
    "name": "Bajra",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "avg_yield_per_acre": 420.9,
    "avg_market_price": 22,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1052.8,
    "top_states": [
      "Karnataka",
      "Gujarat",
      "Andhra Pradesh",
      "Chhattisgarh"
    ],
    "total_records": 524,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 4,
    "name": "Banana",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 100.5,
    "p_demand": 81.0,
    "k_demand": 50.0,
    "avg_yield_per_acre": 7268.2,
    "avg_market_price": 25,
    "avg_cultivation_cost": 40000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 27.4,
    "avg_humidity_pct": 80.4,
    "avg_rainfall_mm": 1332.5,
    "top_states": [
      "Manipur",
      "Kerala",
      "Gujarat",
      "Meghalaya"
    ],
    "total_records": 343,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 5,
    "name": "Barley",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "avg_yield_per_acre": 554.4,
    "avg_market_price": 20,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1102.2,
    "top_states": [
      "Jammu and Kashmir",
      "West Bengal",
      "Punjab",
      "Uttar Pradesh"
    ],
    "total_records": 297,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 6,
    "name": "Black Gram",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.4,
    "ideal_ph_max": 7.9,
    "n_demand": 41.0,
    "p_demand": 67.0,
    "k_demand": 19.0,
    "avg_yield_per_acre": 230.7,
    "avg_market_price": 90,
    "avg_cultivation_cost": 10500,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 30.0,
    "avg_humidity_pct": 65.1,
    "avg_rainfall_mm": 1252.7,
    "top_states": [
      "Odisha",
      "Puducherry",
      "Karnataka",
      "West Bengal"
    ],
    "total_records": 830,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 7,
    "name": "Black pepper",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 210.4,
    "avg_market_price": 350,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1848.3,
    "top_states": [
      "Karnataka",
      "Kerala",
      "Puducherry",
      "Goa"
    ],
    "total_records": 126,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 8,
    "name": "Cardamom",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 53.4,
    "p_demand": 40.0,
    "k_demand": 40.0,
    "avg_yield_per_acre": 32.4,
    "avg_market_price": 1200,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1323.3,
    "top_states": [
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "West Bengal"
    ],
    "total_records": 73,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 9,
    "name": "Cashewnut",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.4,
    "p_demand": 45.3,
    "k_demand": 45.3,
    "avg_yield_per_acre": 190.2,
    "avg_market_price": 180,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1434.6,
    "top_states": [
      "Kerala",
      "Andhra Pradesh",
      "Puducherry",
      "Tamil Nadu"
    ],
    "total_records": 132,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 10,
    "name": "Castor seed",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 238.8,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1136.9,
    "top_states": [
      "Andhra Pradesh",
      "Gujarat",
      "Assam",
      "Meghalaya"
    ],
    "total_records": 300,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 11,
    "name": "Chickpea",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.6,
    "ideal_ph_max": 8.1,
    "n_demand": 39.0,
    "p_demand": 68.0,
    "k_demand": 79.0,
    "avg_yield_per_acre": 331.8,
    "avg_market_price": 70,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 18.9,
    "avg_humidity_pct": 16.9,
    "avg_rainfall_mm": 1117.9,
    "top_states": [
      "Andhra Pradesh",
      "Karnataka",
      "Haryana",
      "Assam"
    ],
    "total_records": 589,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 12,
    "name": "Coconut",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.2,
    "ideal_ph_max": 6.7,
    "n_demand": 24.0,
    "p_demand": 15.5,
    "k_demand": 31.0,
    "avg_yield_per_acre": 3523362.2,
    "avg_market_price": 20,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 27.4,
    "avg_humidity_pct": 94.8,
    "avg_rainfall_mm": 1566.0,
    "top_states": [
      "Kerala",
      "West Bengal",
      "Assam",
      "Karnataka"
    ],
    "total_records": 265,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 13,
    "name": "Coffee",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 103.0,
    "p_demand": 29.0,
    "k_demand": 30.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 200,
    "avg_cultivation_cost": 30000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 25.5,
    "avg_humidity_pct": 58.9,
    "avg_rainfall_mm": 157.8,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 14,
    "name": "Coriander",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "avg_yield_per_acre": 194.2,
    "avg_market_price": 90,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1066.6,
    "top_states": [
      "Andhra Pradesh",
      "Karnataka",
      "Chhattisgarh",
      "Tamil Nadu"
    ],
    "total_records": 198,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 15,
    "name": "Cotton",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.2,
    "ideal_ph_max": 7.7,
    "n_demand": 117.0,
    "p_demand": 46.0,
    "k_demand": 19.0,
    "avg_yield_per_acre": 582.7,
    "avg_market_price": 65,
    "avg_cultivation_cost": 24000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 24.0,
    "avg_humidity_pct": 79.8,
    "avg_rainfall_mm": 1220.5,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Tamil Nadu",
      "Assam"
    ],
    "total_records": 573,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 16,
    "name": "Cowpea",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 55.1,
    "k_demand": 47.2,
    "avg_yield_per_acre": 311.6,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1238.5,
    "top_states": [
      "Karnataka",
      "Mizoram",
      "Andhra Pradesh",
      "Telangana"
    ],
    "total_records": 131,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 17,
    "name": "Dry chillies",
    "crop_family": "Other",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 408.7,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1235.6,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Puducherry",
      "Manipur"
    ],
    "total_records": 419,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 18,
    "name": "Garlic",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 1400.2,
    "avg_market_price": 90,
    "avg_cultivation_cost": 26000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1117.8,
    "top_states": [
      "Gujarat",
      "Karnataka",
      "Uttarakhand",
      "Chhattisgarh"
    ],
    "total_records": 248,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 19,
    "name": "Ginger",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 2015.3,
    "avg_market_price": 60,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1302.7,
    "top_states": [
      "Manipur",
      "Karnataka",
      "Andhra Pradesh",
      "Meghalaya"
    ],
    "total_records": 321,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 20,
    "name": "Grapes",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.3,
    "ideal_ph_max": 6.8,
    "n_demand": 24.0,
    "p_demand": 133.0,
    "k_demand": 201.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 80,
    "avg_cultivation_cost": 45000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 23.9,
    "avg_humidity_pct": 81.9,
    "avg_rainfall_mm": 69.5,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 21,
    "name": "Green Gram",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 22.0,
    "p_demand": 47.0,
    "k_demand": 20.0,
    "avg_yield_per_acre": 206.4,
    "avg_market_price": 85,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 28.5,
    "avg_humidity_pct": 85.5,
    "avg_rainfall_mm": 1230.8,
    "top_states": [
      "West Bengal",
      "Odisha",
      "Karnataka",
      "Andhra Pradesh"
    ],
    "total_records": 834,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 22,
    "name": "Groundnut",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "avg_yield_per_acre": 485.6,
    "avg_market_price": 65,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1283.1,
    "top_states": [
      "Odisha",
      "West Bengal",
      "Karnataka",
      "Puducherry"
    ],
    "total_records": 725,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 23,
    "name": "Guar seed",
    "crop_family": "Other",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.4,
    "p_demand": 45.3,
    "k_demand": 45.3,
    "avg_yield_per_acre": 327.8,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 653.2,
    "top_states": [
      "Gujarat",
      "Punjab",
      "Uttar Pradesh",
      "Haryana"
    ],
    "total_records": 61,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 24,
    "name": "Horse-gram",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "avg_yield_per_acre": 174.0,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1164.1,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Odisha",
      "Chhattisgarh"
    ],
    "total_records": 365,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 25,
    "name": "Jowar",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "avg_yield_per_acre": 396.6,
    "avg_market_price": 26,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1057.8,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Gujarat",
      "Maharashtra"
    ],
    "total_records": 513,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 26,
    "name": "Jute",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "High",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 78.0,
    "p_demand": 46.0,
    "k_demand": 40.0,
    "avg_yield_per_acre": 3383.2,
    "avg_market_price": 45,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 25.0,
    "avg_humidity_pct": 79.6,
    "avg_rainfall_mm": 1714.2,
    "top_states": [
      "Assam",
      "Meghalaya",
      "West Bengal",
      "Odisha"
    ],
    "total_records": 266,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 27,
    "name": "Khesari",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 50.6,
    "k_demand": 43.3,
    "avg_yield_per_acre": 319.7,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1302.7,
    "top_states": [
      "West Bengal",
      "Bihar",
      "Chhattisgarh",
      "Madhya Pradesh"
    ],
    "total_records": 75,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 28,
    "name": "Kidney Bean",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Low",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 22.0,
    "p_demand": 67.0,
    "k_demand": 20.0,
    "avg_yield_per_acre": 550.0,
    "avg_market_price": 80,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 20.1,
    "avg_humidity_pct": 21.6,
    "avg_rainfall_mm": 107.4,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 29,
    "name": "Linseed",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.2,
    "p_demand": 42.9,
    "k_demand": 42.9,
    "avg_yield_per_acre": 178.1,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1223.0,
    "top_states": [
      "Assam",
      "West Bengal",
      "Bihar",
      "Madhya Pradesh"
    ],
    "total_records": 306,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 30,
    "name": "Maize",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.5,
    "ideal_ph_max": 7.0,
    "n_demand": 76.0,
    "p_demand": 48.5,
    "k_demand": 20.0,
    "avg_yield_per_acre": 793.2,
    "avg_market_price": 24,
    "avg_cultivation_cost": 19000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 22.4,
    "avg_humidity_pct": 65.1,
    "avg_rainfall_mm": 1242.3,
    "top_states": [
      "Karnataka",
      "Bihar",
      "Maharashtra",
      "Odisha"
    ],
    "total_records": 1074,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 31,
    "name": "Mango",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 21.0,
    "p_demand": 27.5,
    "k_demand": 30.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 60,
    "avg_cultivation_cost": 20000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 31.2,
    "avg_humidity_pct": 50.2,
    "avg_rainfall_mm": 94.9,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 32,
    "name": "Mesta",
    "crop_family": "Other",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 2112.5,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1402.7,
    "top_states": [
      "Meghalaya",
      "Andhra Pradesh",
      "Assam",
      "West Bengal"
    ],
    "total_records": 207,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 33,
    "name": "Moth Bean",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.1,
    "ideal_ph_max": 7.6,
    "n_demand": 22.0,
    "p_demand": 48.5,
    "k_demand": 20.0,
    "avg_yield_per_acre": 178.1,
    "avg_market_price": 60,
    "avg_cultivation_cost": 8500,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 28.2,
    "avg_humidity_pct": 53.2,
    "avg_rainfall_mm": 937.8,
    "top_states": [
      "Gujarat",
      "Uttarakhand",
      "Haryana",
      "Himachal Pradesh"
    ],
    "total_records": 208,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 34,
    "name": "Muskmelon",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.6,
    "ideal_ph_max": 7.1,
    "n_demand": 100.0,
    "p_demand": 18.0,
    "k_demand": 50.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 12,
    "avg_cultivation_cost": 14000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 28.7,
    "avg_humidity_pct": 92.3,
    "avg_rainfall_mm": 24.7,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 35,
    "name": "Mustard",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 299.5,
    "avg_market_price": 60,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1281.1,
    "top_states": [
      "Mizoram",
      "Assam",
      "Meghalaya",
      "West Bengal"
    ],
    "total_records": 528,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 36,
    "name": "Niger seed",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 145.7,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1306.0,
    "top_states": [
      "West Bengal",
      "Assam",
      "Karnataka",
      "Andhra Pradesh"
    ],
    "total_records": 190,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 37,
    "name": "Onion",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "avg_yield_per_acre": 3832.4,
    "avg_market_price": 25,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1111.7,
    "top_states": [
      "Karnataka",
      "Andhra Pradesh",
      "Uttar Pradesh",
      "Gujarat"
    ],
    "total_records": 447,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 38,
    "name": "Orange",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.3,
    "ideal_ph_max": 7.8,
    "n_demand": 19.0,
    "p_demand": 16.0,
    "k_demand": 10.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 55,
    "avg_cultivation_cost": 22000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 22.8,
    "avg_humidity_pct": 92.2,
    "avg_rainfall_mm": 110.7,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 39,
    "name": "Papaya",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 49.0,
    "p_demand": 60.0,
    "k_demand": 50.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 20,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 33.7,
    "avg_humidity_pct": 92.4,
    "avg_rainfall_mm": 139.0,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 40,
    "name": "Peas & Beans",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "avg_yield_per_acre": 376.4,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1317.2,
    "top_states": [
      "Nagaland",
      "Jammu and Kashmir",
      "Haryana",
      "Himachal Pradesh"
    ],
    "total_records": 369,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 41,
    "name": "Pigeon Pea",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.0,
    "ideal_ph_max": 6.5,
    "n_demand": 20.0,
    "p_demand": 69.5,
    "k_demand": 20.0,
    "avg_yield_per_acre": 315.7,
    "avg_market_price": 75,
    "avg_cultivation_cost": 12000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 27.7,
    "avg_humidity_pct": 48.1,
    "avg_rainfall_mm": 1178.9,
    "top_states": [
      "Andhra Pradesh",
      "Assam",
      "Karnataka",
      "West Bengal"
    ],
    "total_records": 608,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 42,
    "name": "Pomegranate",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 18.0,
    "p_demand": 20.0,
    "k_demand": 40.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 120,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 21.8,
    "avg_humidity_pct": 90.1,
    "avg_rainfall_mm": 107.6,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 43,
    "name": "Potato",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "avg_yield_per_acre": 4119.7,
    "avg_market_price": 18,
    "avg_cultivation_cost": 25000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1296.3,
    "top_states": [
      "Karnataka",
      "Uttarakhand",
      "West Bengal",
      "Himachal Pradesh"
    ],
    "total_records": 627,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 44,
    "name": "Ragi",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "avg_yield_per_acre": 420.9,
    "avg_market_price": 32,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1255.4,
    "top_states": [
      "Karnataka",
      "Odisha",
      "Andhra Pradesh",
      "Puducherry"
    ],
    "total_records": 498,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 45,
    "name": "Red Lentil",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.2,
    "ideal_ph_max": 7.7,
    "n_demand": 16.5,
    "p_demand": 68.0,
    "k_demand": 19.0,
    "avg_yield_per_acre": 283.3,
    "avg_market_price": 65,
    "avg_cultivation_cost": 9500,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 24.5,
    "avg_humidity_pct": 64.8,
    "avg_rainfall_mm": 1250.8,
    "top_states": [
      "West Bengal",
      "Punjab",
      "Jammu and Kashmir",
      "Haryana"
    ],
    "total_records": 424,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 46,
    "name": "Rice",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.7,
    "ideal_ph_max": 7.2,
    "n_demand": 80.0,
    "p_demand": 47.0,
    "k_demand": 40.0,
    "avg_yield_per_acre": 890.3,
    "avg_market_price": 35,
    "avg_cultivation_cost": 24000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 23.7,
    "avg_humidity_pct": 82.3,
    "avg_rainfall_mm": 1402.7,
    "top_states": [
      "Assam",
      "Karnataka",
      "West Bengal",
      "Bihar"
    ],
    "total_records": 1297,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)",
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 47,
    "name": "Safflower",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 226.6,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1157.0,
    "top_states": [
      "Andhra Pradesh",
      "West Bengal",
      "Karnataka",
      "Maharashtra"
    ],
    "total_records": 168,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 48,
    "name": "Sannhamp",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 50.1,
    "k_demand": 42.9,
    "avg_yield_per_acre": 190.2,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1136.0,
    "top_states": [
      "West Bengal",
      "Karnataka",
      "Chhattisgarh",
      "Uttar Pradesh"
    ],
    "total_records": 153,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 49,
    "name": "Sesamum",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "avg_yield_per_acre": 178.1,
    "avg_market_price": 110,
    "avg_cultivation_cost": 11000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1309.0,
    "top_states": [
      "Odisha",
      "West Bengal",
      "Maharashtra",
      "Andhra Pradesh"
    ],
    "total_records": 684,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 50,
    "name": "Small millets",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "avg_yield_per_acre": 303.5,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1288.9,
    "top_states": [
      "West Bengal",
      "Andhra Pradesh",
      "Maharashtra",
      "Uttar Pradesh"
    ],
    "total_records": 484,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 51,
    "name": "Soybean",
    "crop_family": "Legume",
    "is_nitrogen_fixer": true,
    "growth_duration_days": 75,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.5,
    "n_demand": 25.0,
    "p_demand": 52.8,
    "k_demand": 45.2,
    "avg_yield_per_acre": 408.7,
    "avg_market_price": 55,
    "avg_cultivation_cost": 14000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1319.8,
    "top_states": [
      "Andhra Pradesh",
      "West Bengal",
      "Madhya Pradesh",
      "Uttar Pradesh"
    ],
    "total_records": 345,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 52,
    "name": "Sugarcane",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.2,
    "p_demand": 42.9,
    "k_demand": 42.9,
    "avg_yield_per_acre": 21513.1,
    "avg_market_price": 3.5,
    "avg_cultivation_cost": 38000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1329.1,
    "top_states": [
      "Manipur",
      "Uttar Pradesh",
      "Assam",
      "Meghalaya"
    ],
    "total_records": 605,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 53,
    "name": "Sunflower",
    "crop_family": "Oilseed",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 339.9,
    "avg_market_price": 50,
    "avg_cultivation_cost": 13000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1147.5,
    "top_states": [
      "Karnataka",
      "Maharashtra",
      "Nagaland",
      "Andhra Pradesh"
    ],
    "total_records": 440,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 54,
    "name": "Sweet Potato",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 3452.0,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1291.5,
    "top_states": [
      "Andhra Pradesh",
      "Assam",
      "Meghalaya",
      "Kerala"
    ],
    "total_records": 268,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 55,
    "name": "Tapioca",
    "crop_family": "Vegetable",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "avg_yield_per_acre": 4508.2,
    "avg_market_price": 35,
    "avg_cultivation_cost": 16000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1563.4,
    "top_states": [
      "Puducherry",
      "Andhra Pradesh",
      "Kerala",
      "Assam"
    ],
    "total_records": 200,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 56,
    "name": "Tobacco",
    "crop_family": "Commercial",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 60.3,
    "p_demand": 45.2,
    "k_demand": 45.2,
    "avg_yield_per_acre": 566.6,
    "avg_market_price": 95,
    "avg_cultivation_cost": 28000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1206.3,
    "top_states": [
      "Gujarat",
      "Uttar Pradesh",
      "Andhra Pradesh",
      "Assam"
    ],
    "total_records": 362,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 57,
    "name": "Tomato",
    "crop_family": "Solanaceae",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 48.0,
    "p_demand": 36.0,
    "k_demand": 36.0,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 20,
    "avg_cultivation_cost": 35000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1000.0,
    "top_states": [
      "All India"
    ],
    "total_records": 0,
    "data_sources": []
  },
  {
    "crop_id": 58,
    "name": "Turmeric",
    "crop_family": "Spices",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Medium",
    "ideal_ph_min": 6.0,
    "ideal_ph_max": 7.2,
    "n_demand": 57.8,
    "p_demand": 43.3,
    "k_demand": 43.3,
    "avg_yield_per_acre": 817.5,
    "avg_market_price": 80,
    "avg_cultivation_cost": 32000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1349.5,
    "top_states": [
      "Assam",
      "Karnataka",
      "Kerala",
      "Manipur"
    ],
    "total_records": 334,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  },
  {
    "crop_id": 59,
    "name": "Watermelon",
    "crop_family": "Fruit",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 120,
    "water_requirement": "Low",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 99.0,
    "p_demand": 17.5,
    "k_demand": 50.5,
    "avg_yield_per_acre": 4000.0,
    "avg_market_price": 10,
    "avg_cultivation_cost": 15000,
    "disease_risk_index": 30.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi"
    ],
    "avg_temperature_c": 25.6,
    "avg_humidity_pct": 85.2,
    "avg_rainfall_mm": 50.7,
    "top_states": [
      "All India"
    ],
    "total_records": 100,
    "data_sources": [
      "crop-recommendation-dataset (sensor NPK/pH)"
    ]
  },
  {
    "crop_id": 60,
    "name": "Wheat",
    "crop_family": "Cereal",
    "is_nitrogen_fixer": false,
    "growth_duration_days": 110,
    "water_requirement": "Medium",
    "ideal_ph_min": 5.8,
    "ideal_ph_max": 7.2,
    "n_demand": 72.2,
    "p_demand": 36.1,
    "k_demand": 36.1,
    "avg_yield_per_acre": 675.8,
    "avg_market_price": 28,
    "avg_cultivation_cost": 18000,
    "disease_risk_index": 18.0,
    "suitable_seasons": [
      "Kharif",
      "Rabi",
      "Zaid"
    ],
    "avg_temperature_c": 26.5,
    "avg_humidity_pct": 70.0,
    "avg_rainfall_mm": 1246.2,
    "top_states": [
      "Andhra Pradesh",
      "Assam",
      "Karnataka",
      "West Bengal"
    ],
    "total_records": 543,
    "data_sources": [
      "crop-yield-in-indian-states (harvest yield & seasons)"
    ]
  }
];

module.exports = { kaggleCrops };
