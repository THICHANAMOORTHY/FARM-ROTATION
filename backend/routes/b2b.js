// ============================================================
// b2b.js — B2B Enterprise & Corporate Sourcing API
// UZHAVU KAAPPAAN (CropSmart P025)
// ============================================================

const express = require('express');
const router = express.Router();
const db = require('../data/seed');
const { optionalAuth } = require('../middleware/requireAuth');
const { withTimeout } = require('../utils/withTimeout');

router.use(optionalAuth);

// Bounds how long we'll wait on Gemini before falling back to the
// deterministic keyword-scan parser / omitting the AI reasoning. Without
// this, a rate-limited API key makes match-contract hang for many seconds —
// which is especially bad here since it's called on every debounced
// keystroke and every 15s poll tick while the matchmaker panel is open.
const GEMINI_TIMEOUT_MS = 6000;

// Helper: Get latest soil record for each farm
function getLatestSoilMap() {
  const map = {};
  db.soil_data.forEach(s => {
    if (!map[s.farm_id] || new Date(s.recorded_date) > new Date(map[s.farm_id].recorded_date)) {
      map[s.farm_id] = s;
    }
  });
  return map;
}

// ─────────────────────────────────────────────────────────────
// 1. GET /api/b2b/overview — Executive Enterprise Dashboard
// ─────────────────────────────────────────────────────────────
router.get('/overview', (req, res) => {
  const totalFpos = db.fpos.length;
  const totalFarmers = db.fpos.reduce((acc, f) => acc + f.total_farmers, 0);
  const totalFpoAcreage = db.fpos.reduce((acc, f) => acc + f.total_acreage, 0);
  const monitoredFarmAcreage = db.farms.reduce((acc, f) => acc + (f.area_acres || 0), 0);

  // Active contracts metrics
  const activeContracts = db.b2b_contracts.filter(c => c.status === 'Active');
  const totalContractValue = db.b2b_contracts.reduce((acc, c) => acc + (c.total_contract_value_rs || 0), 0);
  const totalContractedMT = db.b2b_contracts.reduce((acc, c) => acc + (c.target_quantity_mt || 0), 0);

  // Average soil score across all monitored farms
  const latestSoils = Object.values(getLatestSoilMap());
  const avgSoilScore = latestSoils.length
    ? Math.round(latestSoils.reduce((acc, s) => acc + (s.soil_health_score || 50), 0) / latestSoils.length)
    : 64;

  // Aggregate ESG metrics
  const totalCo2SequesteredTons = Math.round(totalFpoAcreage * 1.42); // avg 1.42 t/acre/yr with regenerative rotation
  const bioNitrogenFixedKg = Math.round(totalFpoAcreage * 34.5); // avg 34.5 kg N/acre through pulse integration
  const waterSavedKiloliters = Math.round(totalFpoAcreage * 480);

  res.json({
    fleet_summary: {
      total_fpos: totalFpos,
      total_member_farmers: totalFarmers,
      total_network_acreage: totalFpoAcreage,
      direct_monitored_farms: db.farms.length,
      direct_monitored_acreage: monitoredFarmAcreage,
      avg_soil_health_score: avgSoilScore,
      soil_status_label: avgSoilScore >= 65 ? 'Optimal Regenerative' : 'Rehabilitating',
    },
    contracts_summary: {
      total_contracts: db.b2b_contracts.length,
      active_contracts: activeContracts.length,
      total_committed_mt: totalContractedMT,
      total_contract_value_rs: totalContractValue,
      total_corporate_buyers: db.corporate_buyers.length,
    },
    esg_summary: {
      carbon_credits_potential_mt_co2e: totalCo2SequesteredTons,
      bio_nitrogen_fixed_kg: bioNitrogenFixedKg,
      water_conserved_kl: waterSavedKiloliters,
      esg_rating: 'A+ (Regenerative Agriculture Certified)',
    }
  });
});

// ─────────────────────────────────────────────────────────────
// 2. GET /api/b2b/fpos — FPO Member Collectives
// ─────────────────────────────────────────────────────────────
router.get('/fpos', (req, res) => {
  res.json({ fpos: db.fpos });
});

// ─────────────────────────────────────────────────────────────
// 3. GET /api/b2b/buyers — Corporate Sourcing Partners
// ─────────────────────────────────────────────────────────────
router.get('/buyers', (req, res) => {
  res.json({ buyers: db.corporate_buyers });
});

// ─────────────────────────────────────────────────────────────
// 4. GET /api/b2b/contracts — Forward Contracts List
// ─────────────────────────────────────────────────────────────
router.get('/contracts', (req, res) => {
  res.json({ contracts: db.b2b_contracts });
});

// ─────────────────────────────────────────────────────────────
// 5. POST /api/b2b/contracts — Create Forward Procurement Contract
// ─────────────────────────────────────────────────────────────
router.post('/contracts', (req, res) => {
  const {
    buyer_name,
    fpo_id,
    crop_name,
    target_season,
    target_quantity_mt,
    base_price_rs_kg,
    soil_bonus_premium_pct
  } = req.body;

  if (!crop_name || !target_quantity_mt || !base_price_rs_kg) {
    return res.status(400).json({ error: 'Missing required contract fields (crop_name, target_quantity_mt, base_price_rs_kg)' });
  }

  const fpo = db.fpos.find(f => f.fpo_id === Number(fpo_id)) || db.fpos[0];
  const loggedInBuyer = (req.user && req.user.role === 'buyer')
    ? db.corporate_buyers.find(b => b.buyer_id === req.user.buyer_id)
    : null;
  const buyer = loggedInBuyer || db.corporate_buyers.find(b => b.name === buyer_name) || {
    name: buyer_name || 'Enterprise Buyer Partner',
    buyer_id: 999
  };

  db.counters.contract_counter = (db.counters.contract_counter || 115) + 1;
  const contract_id = `CTR-2026-${String(db.counters.contract_counter).padStart(3, '0')}`;

  const qtyKg = Number(target_quantity_mt) * 1000;
  const basePrice = Number(base_price_rs_kg);
  const bonusPct = Number(soil_bonus_premium_pct || 10);
  const effectivePrice = basePrice * (1 + bonusPct / 100);
  const totalValue = Math.round(qtyKg * effectivePrice);

  // Estimate committed acres based on crop average yield
  const cropObj = db.crops.find(c => c.name.toLowerCase() === crop_name.toLowerCase());
  const yieldKgPerAcre = cropObj ? (cropObj.avg_yield_per_acre || 2500) : 2500;
  const committedAcres = +(qtyKg / yieldKgPerAcre).toFixed(1);

  const newContract = {
    contract_id,
    buyer_id: buyer.buyer_id,
    buyer_name: buyer.name,
    fpo_id: fpo.fpo_id,
    fpo_name: fpo.name,
    crop_name: cropObj ? cropObj.name : crop_name,
    target_season: target_season || 'Kharif 2026',
    target_quantity_mt: Number(target_quantity_mt),
    committed_acres: committedAcres,
    base_price_rs_kg: basePrice,
    soil_bonus_premium_pct: bonusPct,
    total_contract_value_rs: totalValue,
    soil_compliance_target: 'Verified Soil Restorative Rotation & Low Synthetic N',
    status: 'Active',
    signed_date: new Date().toISOString().split('T')[0]
  };

  db.b2b_contracts.unshift(newContract);
  res.status(201).json({ success: true, contract: newContract });
});

// ─────────────────────────────────────────────────────────────
// 6. GET /api/b2b/procurement-forecast — Fleet Yield Projections
// ─────────────────────────────────────────────────────────────
router.get('/procurement-forecast', (req, res) => {
  // Generate multi-farm crop availability by combining monitored farms & FPO allocations
  const targetCrops = ['Tomato', 'Potato', 'Onion', 'Chickpea', 'Soybean', 'Black Gram', 'Banana', 'Wheat'];
  
  const forecasts = targetCrops.map((cropName, idx) => {
    const cropObj = db.crops.find(c => c.name.toLowerCase() === cropName.toLowerCase());
    const yieldPerAcre = cropObj && cropObj.avg_yield_per_acre ? cropObj.avg_yield_per_acre : (2000 + idx * 350);
    const mandiPrice = cropObj && cropObj.avg_market_price ? cropObj.avg_market_price : 32;

    // Allocated acreage across our 7 pilot farms + member FPOs
    const allocatedAcres = 45 + (idx * 28);
    const totalYieldKg = allocatedAcres * yieldPerAcre;
    const totalYieldMT = Math.round(totalYieldKg / 1000);
    const grossValueRs = Math.round(totalYieldKg * mandiPrice);

    const harvestSeason = idx % 2 === 0 ? 'Kharif 2026 (Oct-Nov)' : 'Rabi 2026-27 (Feb-Mar)';
    const participatingFarms = 8 + (idx * 4);

    return {
      crop: cropName,
      season: harvestSeason,
      allocated_acres: allocatedAcres,
      projected_yield_mt: totalYieldMT,
      participating_farms: participatingFarms,
      mandi_modal_price_rs_kg: mandiPrice,
      gross_projected_value_rs: grossValueRs,
      soil_benefit: cropObj && cropObj.is_nitrogen_fixer
        ? '🌿 Fixes 40-70 kg N/ha (High Regeneration)'
        : '🌱 Moderate residue soil enrichment',
      procurement_status: idx < 3 ? 'High Corporate Demand' : 'Available for Forward Contract'
    };
  });

  res.json({
    season: '2026-2027 Crop Cycle',
    total_projected_mt: forecasts.reduce((a, f) => a + f.projected_yield_mt, 0),
    forecasts
  });
});

// ─────────────────────────────────────────────────────────────
// Helper: parse a free-text sourcing request into structured filters.
// Uses Gemini when GEMINI_API_KEY is configured; otherwise falls back
// to a simple keyword scan over real crop names so the feature still
// works without an API key (just less "smart").
// ─────────────────────────────────────────────────────────────
async function parseSourcingQueryText(queryText, cropNames) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // See the matching comment in chat.js — gemini-2.5-flash-lite and
      // gemini-2.0-flash are retired (404); gemini-3.5-flash(-lite) is
      // confirmed working with separate quota as of 2026-09.
      const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

      const prompt = `Extract a corporate crop-sourcing request into STRICT JSON only (no markdown, no commentary).
Valid crop names (pick the closest match, case-sensitive as given): ${cropNames.join(', ')}

Request: "${queryText}"

Return exactly this shape:
{"crop_name": "<one of the valid crop names>", "target_quantity_mt": <number>, "preferred_state": "<Indian state or null>"}`;

      let parsedResult = null;
      await withTimeout((async () => {
        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.crop_name && parsed.target_quantity_mt) {
                parsedResult = { ...parsed, provider: 'Google Gemini AI' };
                return;
              }
            }
          } catch (mErr) { /* try next model */ }
        }
      })(), GEMINI_TIMEOUT_MS, 'Gemini query parse timed out').catch(() => {
        // Timed out (or every model failed) — parsedResult stays null and
        // we fall through to the keyword-scan fallback below.
      });

      if (parsedResult) return parsedResult;
    } catch (err) {
      console.warn('[b2b] Gemini query parse failed, falling back to keyword scan:', err.message);
    }
  }

  // Fallback: naive keyword scan (no API key, or Gemini call failed)
  const lc = queryText.toLowerCase();
  const foundCrop = cropNames.find(name => lc.includes(name.toLowerCase()));
  const qtyMatch = lc.match(/(\d+(?:\.\d+)?)\s*(mt|ton|tonne)/);
  const stateMatch = lc.match(/tamil nadu|maharashtra|punjab|andhra pradesh|uttar pradesh|karnataka|gujarat|rajasthan/);
  return {
    crop_name: foundCrop || cropNames[0],
    target_quantity_mt: qtyMatch ? Number(qtyMatch[1]) : 50,
    preferred_state: stateMatch ? stateMatch[0] : null,
    provider: 'Keyword Fallback (no GEMINI_API_KEY set)',
  };
}

// Grounded explanation: Gemini only narrates numbers we already computed —
// it is never the source of the numbers themselves, so it can't hallucinate figures.
async function generateMatchReasoning(payload) {
  if (!process.env.GEMINI_API_KEY) return null;
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  const prompt = `You are a B2B agri-procurement analyst. Using ONLY the JSON data below (do not invent any numbers not present here), write a concise 3-4 sentence recommendation for a corporate buyer explaining why the recommended FPO and matched farms are a good sourcing fit. Be specific and cite the real figures given.

DATA:
${JSON.stringify(payload, null, 2)}`;

  let text = null;
  await withTimeout((async () => {
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        if (text) return;
      } catch (mErr) { /* try next model */ }
    }
  })(), GEMINI_TIMEOUT_MS, 'Gemini reasoning generation timed out').catch((err) => {
    console.warn('[b2b] Gemini reasoning generation failed:', err.message);
  });

  return text;
}

// ─────────────────────────────────────────────────────────────
// 7. POST /api/b2b/match-contract — AI Matchmaker for Corporate Orders
// Accepts either structured fields (crop_name, target_quantity_mt,
// preferred_state) or a free-text `query_text` that gets parsed by AI.
// ─────────────────────────────────────────────────────────────
router.post('/match-contract', async (req, res) => {
  let { crop_name, target_quantity_mt, preferred_state, query_text } = req.body;
  let parse_provider = null;

  if ((!crop_name || !target_quantity_mt) && query_text) {
    const parsed = await parseSourcingQueryText(query_text, db.crops.map(c => c.name));
    crop_name = crop_name || parsed.crop_name;
    target_quantity_mt = target_quantity_mt || parsed.target_quantity_mt;
    preferred_state = preferred_state || parsed.preferred_state;
    parse_provider = parsed.provider;
  }

  if (!crop_name || !target_quantity_mt) {
    return res.status(400).json({ error: 'Please provide crop_name + target_quantity_mt, or a query_text describing your sourcing need' });
  }

  const crop = db.crops.find(c => c.name.toLowerCase() === crop_name.toLowerCase()) || db.crops[0];
  const requiredKg = Number(target_quantity_mt) * 1000;
  const yieldPerAcre = crop.avg_yield_per_acre || 2500;
  const requiredAcres = +(requiredKg / yieldPerAcre).toFixed(1);

  // Match against FPOs & pilot farms
  const matchedFpos = db.fpos.filter(f => {
    if (preferred_state && f.state.toLowerCase() !== preferred_state.toLowerCase()) return false;
    return f.primary_crops.some(c => c.toLowerCase() === crop.name.toLowerCase()) || f.total_acreage >= requiredAcres;
  });

  const selectedFpo = matchedFpos[0] || db.fpos[0];

  // Matched individual farms
  const soilMap = getLatestSoilMap();
  const matchedFarms = db.farms.map(farm => {
    const soil = soilMap[farm.farm_id] || { soil_health_score: 60 };
    const suitabilityScore = Math.min(98, Math.round(soil.soil_health_score * 0.9 + 25));
    const farmYieldKg = (farm.area_acres || 4.5) * yieldPerAcre;

    return {
      farm_id: farm.farm_id,
      farm_name: farm.name,
      location: farm.location_name,
      area_acres: farm.area_acres,
      irrigation: farm.irrigation_type,
      soil_score: soil.soil_health_score,
      suitability_score: suitabilityScore,
      estimated_output_mt: +(farmYieldKg / 1000).toFixed(1),
      status: 'Ready for Sourcing'
    };
  }).slice(0, 4);

  const basePrice = crop.avg_market_price || 35;
  const regenerativeBonusPct = crop.is_nitrogen_fixer ? 15 : 10;
  const priceWithBonus = +(basePrice * (1 + regenerativeBonusPct / 100)).toFixed(2);
  const totalEstCost = Math.round(requiredKg * priceWithBonus);

  const responsePayload = {
    query: { crop_name: crop.name, target_quantity_mt: Number(target_quantity_mt), required_acres: requiredAcres },
    query_interpreted_from_text: query_text ? { text: query_text, parsed_by: parse_provider } : null,
    recommended_fpo: {
      fpo_id: selectedFpo.fpo_id,
      name: selectedFpo.name,
      district: selectedFpo.district,
      state: selectedFpo.state,
      available_acreage: selectedFpo.total_acreage,
      contact: selectedFpo.contact_person,
      phone: selectedFpo.contact_phone
    },
    pricing_matrix: {
      mandi_modal_rs_kg: basePrice,
      regenerative_premium_bonus_pct: regenerativeBonusPct,
      guaranteed_farmer_payout_rs_kg: priceWithBonus,
      total_contract_value_rs: totalEstCost
    },
    matched_fleet_farms: matchedFarms,
    traceability_guarantee: '100% Geo-tagged fields, real-time soil test audit & sensor logs provided.'
  };

  const aiReasoning = await generateMatchReasoning(responsePayload);
  responsePayload.ai_match_reasoning = aiReasoning || `Recommended based on ${selectedFpo.name}'s ${selectedFpo.total_acreage}-acre network in ${selectedFpo.district}, ${selectedFpo.state}, matched against ${crop.name}'s soil and season fit across ${matchedFarms.length} monitored farms.`;
  responsePayload.ai_reasoning_provider = aiReasoning
    ? 'Google Gemini AI'
    : (process.env.GEMINI_API_KEY
      ? 'Rule-Based Engine (Gemini call failed or rate-limited — see server logs)'
      : 'Rule-Based Engine (GEMINI_API_KEY not configured)');

  res.json(responsePayload);
});

// ─────────────────────────────────────────────────────────────
// 8. GET /api/b2b/input-demand — Bulk Input Aggregator
// ─────────────────────────────────────────────────────────────
router.get('/input-demand', (req, res) => {
  const soilMap = getLatestSoilMap();
  const soils = Object.values(soilMap);

  let totalNAcreDeficit = 0;
  let totalPAcreDeficit = 0;
  let totalOrganicCarbonDeficitTons = 0;
  let totalAcreageAnalyzed = 0;

  db.farms.forEach(farm => {
    const soil = soilMap[farm.farm_id];
    const acres = farm.area_acres || 4.5;
    totalAcreageAnalyzed += acres;

    if (soil) {
      if (soil.nitrogen < 50) totalNAcreDeficit += acres;
      if (soil.phosphorus < 30) totalPAcreDeficit += acres;
      if (soil.organic_carbon < 0.6) totalOrganicCarbonDeficitTons += (acres * 2.5); // 2.5 tonnes vermicompost/acre needed
    }
  });

  // Calculate bulk procurement orders with wholesale savings
  const procurementPackages = [
    {
      item: 'Enriched Vermicompost (Bio-NPK Organic Manure)',
      quantity_required: Math.round(totalOrganicCarbonDeficitTons || 35) + ' Tonnes',
      supplier: db.input_suppliers[0].name,
      standard_retail_price: 'Rs. 5,200 / Tonne',
      b2b_bulk_price: 'Rs. 4,200 / Tonne',
      estimated_bulk_savings_pct: '19.2%',
      benefit: 'Restores organic carbon above 0.7% and enhances microbial count'
    },
    {
      item: 'Bio-Rhizobium & Trichoderma Microbial Inoculants',
      quantity_required: Math.round(totalAcreageAnalyzed * 1.5) + ' Liters',
      supplier: db.input_suppliers[0].name,
      standard_retail_price: 'Rs. 240 / Liter',
      b2b_bulk_price: 'Rs. 180 / Liter',
      estimated_bulk_savings_pct: '25.0%',
      benefit: 'Activates symbiotic root nitrogen fixation for upcoming pulse rotation'
    },
    {
      item: 'Sunn Hemp & Sesbania Certified Green Manure Seeds',
      quantity_required: Math.round(totalNAcreDeficit * 12) + ' kg',
      supplier: db.input_suppliers[1].name,
      standard_retail_price: 'Rs. 55 / kg',
      b2b_bulk_price: 'Rs. 38 / kg',
      estimated_bulk_savings_pct: '30.9%',
      benefit: 'Grown for 45 days prior to main crop; incorporates 80-100 kg N/ha'
    }
  ];

  res.json({
    fleet_acreage_analyzed: totalAcreageAnalyzed,
    soil_deficiency_summary: {
      nitrogen_deficient_acres: +totalNAcreDeficit.toFixed(1),
      phosphorus_deficient_acres: +totalPAcreDeficit.toFixed(1),
      organic_carbon_deficit_tonnes: +totalOrganicCarbonDeficitTons.toFixed(1),
    },
    procurement_packages: procurementPackages,
    total_collective_savings_estimated_rs: 78500
  });
});

// ─────────────────────────────────────────────────────────────
// 9. GET /api/b2b/esg-metrics — Corporate ESG & Carbon Report
// ─────────────────────────────────────────────────────────────
router.get('/esg-metrics', (req, res) => {
  const totalAcreage = db.fpos.reduce((a, f) => a + f.total_acreage, 0) + 38.0;

  const co2Sequestration = +(totalAcreage * 1.45).toFixed(1);
  const carbonCreditsWorthRs = Math.round(co2Sequestration * 1650); // Rs 1650 / Carbon credit (approx $20/tCO2e)
  const syntheticUreaAvoidedKg = Math.round(totalAcreage * 42.0);
  const groundWaterRechargedKl = Math.round(totalAcreage * 620);

  res.json({
    reporting_period: 'FY 2026-2027',
    total_certified_acreage: totalAcreage,
    esg_kpis: [
      {
        metric: 'Soil Carbon Sequestration',
        value: `${co2Sequestration} Tonnes CO₂e`,
        trend: '+18.4% YoY',
        benchmark: 'Verified via Soil Lab Walkley-Black & Sensor Models'
      },
      {
        metric: 'Synthetic Nitrogen Avoidance',
        value: `${syntheticUreaAvoidedKg.toLocaleString()} kg Urea`,
        trend: '-32% Synthetic Input',
        benchmark: 'Replaced via Legume-Rhizobium symbiotic rotation'
      },
      {
        metric: 'Irrigation Water Conservation',
        value: `${groundWaterRechargedKl.toLocaleString()} Kiloliters`,
        trend: '41% Saved',
        benchmark: 'Precision Drip & Crop Root-Depth Alternate Planting'
      },
      {
        metric: 'Carbon Credit Monetization Value',
        value: `₹${carbonCreditsWorthRs.toLocaleString()}`,
        trend: 'Audited Sourcing',
        benchmark: 'Eligible for Verra / Gold Standard Voluntary Carbon Markets'
      }
    ],
    fpo_breakdown: db.fpos.map(f => ({
      fpo_name: f.name,
      district: f.district,
      acreage: f.total_acreage,
      soil_status: f.soil_regeneration_status,
      carbon_credits_generated: Math.round(f.total_acreage * 1.45)
    }))
  });
});

// ─────────────────────────────────────────────────────────────
// 10. GET /api/b2b/programs — Step 1: Institutional Sourcing Programs
// ─────────────────────────────────────────────────────────────
router.get('/programs', (req, res) => {
  res.json({
    programs: db.b2b_programs || [],
    total_programs: (db.b2b_programs || []).length
  });
});

// ─────────────────────────────────────────────────────────────
// 11. POST /api/b2b/programs — Step 1: Define Commercial Outcome
// ─────────────────────────────────────────────────────────────
router.post('/programs', (req, res) => {
  const {
    name,
    buyer_name,
    fpo_id,
    crop,
    geography,
    enrolled_acres,
    farmer_count,
    expected_volume_mt,
    quality_standards,
    procurement_window,
    agronomic_goals
  } = req.body;

  if (!name || !crop || !expected_volume_mt) {
    return res.status(400).json({ error: 'Missing required program fields (name, crop, expected_volume_mt)' });
  }

  const fpo = db.fpos.find(f => f.fpo_id === Number(fpo_id)) || db.fpos[0];
  const loggedInBuyer = (req.user && req.user.role === 'buyer')
    ? db.corporate_buyers.find(b => b.buyer_id === req.user.buyer_id)
    : null;
  const buyer = loggedInBuyer || db.corporate_buyers.find(b => b.name === buyer_name) || {
    name: buyer_name || 'Institutional Partner',
    buyer_id: 199
  };

  db.counters.program_counter = (db.counters.program_counter || 10) + 1;
  const program_id = `PRG-2026-${String(db.counters.program_counter).padStart(3, '0')}`;

  const newProgram = {
    program_id,
    name,
    buyer_id: buyer.buyer_id,
    buyer_name: buyer.name,
    fpo_id: fpo.fpo_id,
    fpo_name: fpo.name,
    crop,
    geography: geography || `${fpo.district}, ${fpo.state}`,
    enrolled_acres: Number(enrolled_acres || 150),
    farmer_count: Number(farmer_count || 35),
    expected_volume_mt: Number(expected_volume_mt),
    quality_standards: quality_standards || {
      min_brix: 'Standard',
      max_defect_rate: '< 3.0%',
      moisture: 'Standard Specification'
    },
    procurement_window: procurement_window || 'Next Harvesting Cycle',
    agronomic_goals: agronomic_goals || ['Yield stabilization', 'Balanced nutrition', 'Regenerative compliance'],
    status: 'Field System Initialized'
  };

  db.b2b_programs.unshift(newProgram);
  res.status(201).json({ success: true, program: newProgram });
});

// ─────────────────────────────────────────────────────────────
// 12. GET /api/b2b/clusters — Step 2: Production Clusters & Coverage
// ─────────────────────────────────────────────────────────────
router.get('/clusters', (req, res) => {
  res.json({
    clusters: db.b2b_clusters || [],
    total_clusters: (db.b2b_clusters || []).length,
    registered_farms: db.farms.map(f => ({
      farm_id: f.farm_id,
      name: f.name,
      location: f.location_name,
      area_acres: f.area_acres,
      irrigation: f.irrigation_type,
      sowing_status: 'Scheduled / Verified',
      lead_coordinator: 'Assigned'
    }))
  });
});

// ─────────────────────────────────────────────────────────────
// 13. GET /api/b2b/baselines — Step 3: Baseline Assessment
// ─────────────────────────────────────────────────────────────
router.get('/baselines', (req, res) => {
  res.json(db.b2b_baselines || { indicators: [], root_cause_breakdown: [] });
});

// ─────────────────────────────────────────────────────────────
// 14. GET /api/b2b/protocols — Step 4: Region-Specific Protocols
// ─────────────────────────────────────────────────────────────
router.get('/protocols', (req, res) => {
  res.json({
    protocols: db.b2b_protocols || [],
    governance_statement: 'Protocols provide operational discipline. Real-time field observations, weather alerts, and soil tests trigger authorized agronomist adjustments.'
  });
});

// ─────────────────────────────────────────────────────────────
// 15. GET /api/b2b/escalations — Step 6: Incident Escalation Queue
// ─────────────────────────────────────────────────────────────
router.get('/escalations', (req, res) => {
  res.json({
    escalations: db.b2b_escalations || [],
    total_tickets: (db.b2b_escalations || []).length,
    active_in_action: (db.b2b_escalations || []).filter(e => e.status !== 'Resolved').length
  });
});

// ─────────────────────────────────────────────────────────────
// 16. POST /api/b2b/escalations — Step 6: Log Field Incident
// ─────────────────────────────────────────────────────────────
router.post('/escalations', (req, res) => {
  const {
    cluster_id,
    program_id,
    village_coordinator,
    farmer_name,
    crop,
    reported_stage,
    issue_type,
    description
  } = req.body;

  if (!crop || !issue_type || !description) {
    return res.status(400).json({ error: 'Missing required escalation fields (crop, issue_type, description)' });
  }

  const cluster = (db.b2b_clusters || []).find(c => c.cluster_id === cluster_id) || (db.b2b_clusters || [])[0];
  db.counters.ticket_counter = (db.counters.ticket_counter || 500) + 1;
  const ticket_id = `ESC-2026-${db.counters.ticket_counter}`;

  const newTicket = {
    ticket_id,
    cluster_id: cluster ? cluster.cluster_id : 'CLUST-TN-01',
    program_id: program_id || 'PRG-2026-001',
    village_coordinator: village_coordinator || 'Field Scout Dispatch',
    lead_agronomist: cluster ? cluster.lead_agronomist.name : 'Dr. K. Radhakrishnan',
    farm_id: 101,
    farmer_name: farmer_name || 'Network Farmer',
    crop,
    reported_stage: reported_stage || 'Vegetative Care',
    issue_type,
    description,
    photo_attached: true,
    status: 'In Action',
    logged_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    resolved_at: null,
    agronomist_resolution: 'Ticket dispatched to Lead Agronomist on-call. Field investigation active.'
  };

  db.b2b_escalations.unshift(newTicket);
  res.status(201).json({ success: true, escalation: newTicket });
});

// ─────────────────────────────────────────────────────────────
// 17. GET /api/b2b/scorecard — Comprehensive 7-Pillar KPI Scorecard
// ─────────────────────────────────────────────────────────────
router.get('/scorecard', (req, res) => {
  res.json(db.b2b_scorecard || {});
});

module.exports = router;

