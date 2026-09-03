// ============================================================
// gpsZones.js — GPS Precision Farm Zone Allocation & Spatial Soil Analysis
// GET  /api/gps-zones?farm_id=101&lat=11.0168&lon=76.9558
// POST /api/gps-zones/analyze
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../data/seed');

// Default GPS Micro-Zones for Farm #101 (Coimbatore 4.5 Acres)
function getDefaultFarmZones(farm_id = 101, baseLat = 11.0168, baseLon = 76.9558) {
  return [
    {
      zone_id: 'ZONE-A',
      zone_name: 'Zone A — North Block (Upland)',
      tamil_name: 'மண்டலம் A — வடக்கு பகுதி (மேட்டு நிலம்)',
      area_acres: 1.5,
      gps_coordinates: {
        center: [baseLat + 0.0008, baseLon - 0.0006],
        bounds: [
          [baseLat + 0.0012, baseLon - 0.0010],
          [baseLat + 0.0012, baseLon - 0.0002],
          [baseLat + 0.0004, baseLon - 0.0002],
          [baseLat + 0.0004, baseLon - 0.0010]
        ]
      },
      elevation_m: 412,
      soil_texture: 'Red Sandy Loam',
      soil_health_score: 54,
      fertility_status: 'Severe Nitrogen Deficit',
      soil_data: {
        nitrogen: 36.5,       // kg/ha (Severe Deficit)
        phosphorus: 24.0,     // kg/ha
        potassium: 50.0,      // kg/ha
        ph: 6.3,              // Slightly acidic
        organic_carbon: 0.44, // % (Low)
        ec: 0.38,             // dS/m
        soil_moisture_pct: 18 // Low
      },
      monoculture_history: ['Tomato', 'Tomato', 'Tomato'],
      allocated_crop: {
        name: 'Green Gram (Moong)',
        tamil_name: 'பாசிப்பயறு',
        family: 'Legume (N-Fixer)',
        seed_rate_kg_acre: 9.0,
        growth_days: 75,
        projected_profit_acre: 34200,
        zone_total_profit: 51300,
        biological_objective: 'Fixes 45 kg N/ha naturally; breaks 3-year tomato blight spore reservoir in upland sandy soil.'
      },
      prescribed_feeding: {
        fym_tonnes: 6.0,
        neem_cake_kg: 150,
        dap_kg: 35,
        mop_kg: 20,
        rhizobium_kg: 3.0,
        micronutrient: 'Zinc Sulphate @ 15 kg/acre'
      }
    },
    {
      zone_id: 'ZONE-B',
      zone_name: 'Zone B — East Block (Midland Restorer)',
      tamil_name: 'மண்டலம் B — கிழக்கு பகுதி (நடு நிலம்)',
      area_acres: 1.2,
      gps_coordinates: {
        center: [baseLat + 0.0006, baseLon + 0.0008],
        bounds: [
          [baseLat + 0.0010, baseLon + 0.0003],
          [baseLat + 0.0010, baseLon + 0.0012],
          [baseLat + 0.0002, baseLon + 0.0012],
          [baseLat + 0.0002, baseLon + 0.0003]
        ]
      },
      elevation_m: 409,
      soil_texture: 'Red Clay Loam',
      soil_health_score: 66,
      fertility_status: 'Moderate Organic Depletion',
      soil_data: {
        nitrogen: 48.0,
        phosphorus: 32.0,
        potassium: 62.0,
        ph: 6.6,
        organic_carbon: 0.58,
        ec: 0.42,
        soil_moisture_pct: 26
      },
      monoculture_history: ['Tomato', 'Tomato', 'Maize'],
      allocated_crop: {
        name: 'Groundnut (Peanut)',
        tamil_name: 'நிலக்கடலை',
        family: 'Legume (Restorer)',
        seed_rate_kg_acre: 52.0,
        growth_days: 105,
        projected_profit_acre: 41800,
        zone_total_profit: 50160,
        biological_objective: 'Deep taproot system aerates compacted midland clay loam and incorporates 2.8 tonnes dry biomass.'
      },
      prescribed_feeding: {
        fym_tonnes: 4.8,
        neem_cake_kg: 120,
        dap_kg: 30,
        mop_kg: 18,
        rhizobium_kg: 2.5,
        micronutrient: 'Gypsum @ 80 kg/acre at 45 DAS'
      }
    },
    {
      zone_id: 'ZONE-C',
      zone_name: 'Zone C — South Block (Lowland Moisture Rich)',
      tamil_name: 'மண்டலம் C — தெற்கு பகுதி (ஈரப்பதம் மிகுந்த பள்ளம்)',
      area_acres: 1.0,
      gps_coordinates: {
        center: [baseLat - 0.0007, baseLon + 0.0005],
        bounds: [
          [baseLat - 0.0001, baseLon + 0.0001],
          [baseLat - 0.0001, baseLon + 0.0010],
          [baseLat - 0.0012, baseLon + 0.0010],
          [baseLat - 0.0012, baseLon + 0.0001]
        ]
      },
      elevation_m: 403,
      soil_texture: 'Alluvial Silty Loam',
      soil_health_score: 74,
      fertility_status: 'Optimal Moisture & High Potassium',
      soil_data: {
        nitrogen: 56.0,
        phosphorus: 38.0,
        potassium: 78.0,
        ph: 6.8,
        organic_carbon: 0.72,
        ec: 0.45,
        soil_moisture_pct: 34
      },
      monoculture_history: ['Paddy', 'Tomato', 'Blackgram'],
      allocated_crop: {
        name: 'Onion / High-Value Vegetables',
        tamil_name: 'சின்ன வெங்காயம்',
        family: 'Alliaceae (Cash Crop)',
        seed_rate_kg_acre: 4.5,
        growth_days: 90,
        projected_profit_acre: 58500,
        zone_total_profit: 58500,
        biological_objective: 'Capitalizes on natural lowland nutrient runoff, excellent soil moisture, and high market mandi rates.'
      },
      prescribed_feeding: {
        fym_tonnes: 4.0,
        neem_cake_kg: 100,
        dap_kg: 25,
        mop_kg: 15,
        rhizobium_kg: 0,
        micronutrient: 'Borax @ 2 kg/acre foliar'
      }
    },
    {
      zone_id: 'ZONE-D',
      zone_name: 'Zone D — West Block (Drip Perimeter Buffer)',
      tamil_name: 'மண்டலம் D — மேற்கு எல்லை (பாசன பகுதி)',
      area_acres: 0.8,
      gps_coordinates: {
        center: [baseLat - 0.0005, baseLon - 0.0007],
        bounds: [
          [baseLat + 0.0001, baseLon - 0.0012],
          [baseLat + 0.0001, baseLon - 0.0003],
          [baseLat - 0.0010, baseLon - 0.0003],
          [baseLat - 0.0010, baseLon - 0.0012]
        ]
      },
      elevation_m: 408,
      soil_texture: 'Red Loam',
      soil_health_score: 62,
      fertility_status: 'Low Phosphorus & Nitrogen',
      soil_data: {
        nitrogen: 40.0,
        phosphorus: 22.0,
        potassium: 54.0,
        ph: 6.5,
        organic_carbon: 0.50,
        ec: 0.40,
        soil_moisture_pct: 22
      },
      monoculture_history: ['Tomato', 'Tomato', 'Tomato'],
      allocated_crop: {
        name: 'Blackgram (Urad)',
        tamil_name: 'உளுந்து',
        family: 'Legume (Relay Pulse)',
        seed_rate_kg_acre: 8.0,
        growth_days: 70,
        projected_profit_acre: 31200,
        zone_total_profit: 24960,
        biological_objective: 'Short duration biological nitrogen fixing buffer along the western drip line.'
      },
      prescribed_feeding: {
        fym_tonnes: 3.2,
        neem_cake_kg: 80,
        dap_kg: 20,
        mop_kg: 12,
        rhizobium_kg: 1.6,
        micronutrient: 'Zinc Sulphate @ 8 kg/acre'
      }
    }
  ];
}

// GET /api/gps-zones
router.get('/', (req, res) => {
  const farm_id = parseInt(req.query.farm_id) || 101;
  const lat = parseFloat(req.query.lat) || 11.0168;
  const lon = parseFloat(req.query.lon) || 76.9558;

  const farm = db.farms.find(f => f.farm_id === farm_id) || db.farms[0];
  const zones = getDefaultFarmZones(farm_id, lat, lon);

  const totalAcres = zones.reduce((acc, z) => acc + z.area_acres, 0);
  const avgHealth = Math.round(zones.reduce((acc, z) => acc + z.soil_health_score, 0) / zones.length);
  const totalProjectedProfit = zones.reduce((acc, z) => acc + z.allocated_crop.zone_total_profit, 0);

  res.json({
    status: 'success',
    farm: {
      id: farm.farm_id,
      name: farm.location_name,
      center_gps: [lat, lon],
      total_acres: totalAcres,
      total_zones: zones.length,
      average_soil_score: avgHealth,
      total_projected_profit: totalProjectedProfit
    },
    zones: zones,
    precision_benefits: [
      "Targeted variable-rate fertilization prevents 35% chemical input wastage",
      "Tailors specific legume types to micro-soil heterogeneity across upland and lowland plots",
      "Breaks continuous tomato blight pathogen cycles differentially per field block",
      "Maximizes cumulative farm profit by allocating high-value cash crops to naturally fertile zones"
    ]
  });
});

// POST /api/gps-zones/analyze
router.post('/analyze', (req, res) => {
  const { farm_id = 101, lat = 11.0168, lon = 76.9558, custom_zones } = req.body;
  
  if (custom_zones && Array.isArray(custom_zones) && custom_zones.length) {
    return res.json({
      status: 'success',
      farm_id,
      analyzed_zones: custom_zones.length,
      timestamp: new Date().toISOString(),
      zones: custom_zones
    });
  }

  const zones = getDefaultFarmZones(farm_id, parseFloat(lat), parseFloat(lon));
  res.json({
    status: 'success',
    farm_id,
    zones
  });
});

module.exports = router;
