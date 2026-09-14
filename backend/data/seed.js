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

// ── B2B Enterprise Seed Data ────────────────────────────────
const fpos = [
  {
    fpo_id: 1,
    name: 'Kovai Kongu Organic Producers FPO',
    reg_number: 'FPO-TN-2022-8921',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    total_farmers: 420,
    total_acreage: 1850,
    primary_crops: ['Tomato', 'Black Gram', 'Banana', 'Turmeric'],
    soil_regeneration_status: 'Active Regenerative',
    contact_person: 'S. Shanmugam',
    contact_phone: '+91 94432 10876'
  },
  {
    fpo_id: 2,
    name: 'Sahyadri Agro Horti Collective',
    reg_number: 'FPO-MH-2021-3419',
    district: 'Nashik',
    state: 'Maharashtra',
    total_farmers: 680,
    total_acreage: 2900,
    primary_crops: ['Onion', 'Grapes', 'Pomegranate', 'Soybean'],
    soil_regeneration_status: 'Certified Sustainable',
    contact_person: 'Vilas Shinde',
    contact_phone: '+91 98220 44512'
  },
  {
    fpo_id: 3,
    name: 'Malwa Agri-Vanguard Producer Co.',
    reg_number: 'FPO-MP-2023-1104',
    district: 'Indore',
    state: 'Madhya Pradesh',
    total_farmers: 310,
    total_acreage: 1420,
    primary_crops: ['Soybean', 'Wheat', 'Chickpea', 'Garlic'],
    soil_regeneration_status: 'Transitioning',
    contact_person: 'Rajesh Patidar',
    contact_phone: '+91 97551 88320'
  }
];

const corporate_buyers = [
  {
    buyer_id: 101,
    name: 'GreenBasket Fresh Supermarkets Ltd.',
    category: 'Retail & Grocery Chain',
    headquarters: 'Bengaluru, Karnataka',
    procurement_lead: 'Ananya Deshmukh',
    annual_procurement_mt: 18500,
    preferred_standards: ['Residue-Free', 'Soil-Health-Certified', 'Traceable Rotation']
  },
  {
    buyer_id: 102,
    name: 'Deccan Agro Foods & Purees',
    category: 'Food Processing & Canning',
    headquarters: 'Pune, Maharashtra',
    procurement_lead: 'Karthik Raman',
    annual_procurement_mt: 34000,
    preferred_standards: ['High Brix', 'Regenerative Nitrogen Fixed']
  },
  {
    buyer_id: 103,
    name: 'Bharat Organic Spices & Pulses Export Co.',
    category: 'International Exporter',
    headquarters: 'Kochi, Kerala',
    procurement_lead: 'Mathew Thomas',
    annual_procurement_mt: 12000,
    preferred_standards: ['APEDA Certified', 'Carbon Neutral Sourced']
  }
];

let b2b_contracts = [
  {
    contract_id: 'CTR-2026-081',
    buyer_id: 101,
    buyer_name: 'GreenBasket Fresh Supermarkets Ltd.',
    fpo_id: 1,
    fpo_name: 'Kovai Kongu Organic Producers FPO',
    crop_name: 'Tomato',
    target_season: 'Kharif 2026',
    target_quantity_mt: 120,
    committed_acres: 18.5,
    base_price_rs_kg: 36.50,
    soil_bonus_premium_pct: 12.0, // 12% bonus for regenerative rotation & organic carbon > 0.6%
    total_contract_value_rs: 4905600,
    soil_compliance_target: 'Min Health Score 65 & Legume In-Rotation',
    status: 'Active',
    signed_date: '2026-06-15'
  },
  {
    contract_id: 'CTR-2026-094',
    buyer_id: 102,
    buyer_name: 'Deccan Agro Foods & Purees',
    fpo_id: 2,
    fpo_name: 'Sahyadri Agro Horti Collective',
    crop_name: 'Onion',
    target_season: 'Rabi 2026',
    target_quantity_mt: 250,
    committed_acres: 32.0,
    base_price_rs_kg: 24.00,
    soil_bonus_premium_pct: 8.5,
    total_contract_value_rs: 6510000,
    soil_compliance_target: 'Multi-season Trichoderma & Carbon Enrich',
    status: 'Active',
    signed_date: '2026-07-20'
  },
  {
    contract_id: 'CTR-2026-112',
    buyer_id: 103,
    buyer_name: 'Bharat Organic Spices & Pulses Export Co.',
    fpo_id: 3,
    fpo_name: 'Malwa Agri-Vanguard Producer Co.',
    crop_name: 'Chickpea',
    target_season: 'Rabi 2026',
    target_quantity_mt: 80,
    committed_acres: 24.0,
    base_price_rs_kg: 56.00,
    soil_bonus_premium_pct: 15.0,
    total_contract_value_rs: 5152000,
    soil_compliance_target: 'Bio-N Fixation Verified (Rhizobium inoculated)',
    status: 'Under Negotiation',
    signed_date: '2026-08-30'
  }
];

const input_suppliers = [
  {
    supplier_id: 1,
    name: 'Tamil Nadu Bio-Inputs & Vermicompost Federation',
    location: 'Coimbatore, Tamil Nadu',
    categories: ['Vermicompost', 'Bio-fertilizers', 'Microbial cultures'],
    rating: 4.8
  },
  {
    supplier_id: 2,
    name: 'National Seeds Corporation (NSC) Green Manure Wing',
    location: 'Secunderabad, Telangana',
    categories: ['Sunn Hemp Seeds', 'Sesbania Seeds', 'Certified Legume Seeds'],
    rating: 4.7
  },
  {
    supplier_id: 3,
    name: 'Kribhco Agri Bio-Solutions Ltd.',
    location: 'Noida, Uttar Pradesh',
    categories: ['Bio-NPK Consortia', 'Zinc Solubilizing Bacteria', 'Trichoderma'],
    rating: 4.9
  }
];

const b2b_programs = [
  {
    program_id: 'PRG-2026-001',
    name: 'Sustainable Processing Tomato Program',
    buyer_id: 102,
    buyer_name: 'Deccan Agro Foods & Purees',
    fpo_id: 1,
    fpo_name: 'Kovai Kongu Organic Producers FPO',
    crop: 'Tomato',
    geography: 'Coimbatore & Tiruppur Districts, Tamil Nadu',
    enrolled_acres: 180,
    farmer_count: 42,
    expected_volume_mt: 450,
    quality_standards: {
      min_brix: '4.8°',
      max_defect_rate: '2.5%',
      max_moisture: '88%',
      chemical_residue: 'Zero Synthetic Residue (MRL Compliant)'
    },
    procurement_window: 'Oct 15 – Nov 30, 2026',
    agronomic_goals: [
      'Yield stability (+25% over regional average)',
      '35% reduction in synthetic nitrogen via pulse green manuring',
      '40% drip water efficiency with tensiometer scheduling',
      'Lower crop loss (< 4% field sorting rejection)'
    ],
    status: 'In Field Execution'
  },
  {
    program_id: 'PRG-2026-002',
    name: 'Export-Grade Non-GMO Soybean & Chickpea Rotation',
    buyer_id: 103,
    buyer_name: 'Bharat Organic Spices & Pulses Export Co.',
    fpo_id: 3,
    fpo_name: 'Malwa Agri-Vanguard Producer Co.',
    crop: 'Soybean & Chickpea',
    geography: 'Indore & Ujjain Plateau, Madhya Pradesh',
    enrolled_acres: 320,
    farmer_count: 68,
    expected_volume_mt: 440,
    quality_standards: {
      seed_moisture: '< 10%',
      admixture_max: '1.0%',
      non_gmo_purity: '99.9% Verified',
      apeda_certification: 'Category 1 Export Grade'
    },
    procurement_window: 'Nov 01 – Dec 20, 2026',
    agronomic_goals: [
      'Biological Nitrogen Fixation via Rhizobium seed inoculation',
      'Soil organic carbon uplift from 0.45% to 0.75%',
      'Zero glyphosate chemical desiccation before harvest'
    ],
    status: 'Active Protocol Adherence'
  },
  {
    program_id: 'PRG-2026-003',
    name: 'Grade-A Residue-Free Horti Onion Initiative',
    buyer_id: 101,
    buyer_name: 'GreenBasket Fresh Supermarkets Ltd.',
    fpo_id: 2,
    fpo_name: 'Sahyadri Agro Horti Collective',
    crop: 'Onion',
    geography: 'Nashik & Niphad Valley, Maharashtra',
    enrolled_acres: 240,
    farmer_count: 55,
    expected_volume_mt: 600,
    quality_standards: {
      bulb_diameter: '45mm - 60mm Uniform',
      skin_layers: '3-4 Intact Cured Wrappers',
      sprouting_rate: '< 0.5% after 21 days storage'
    },
    procurement_window: 'Dec 10 – Jan 25, 2027',
    agronomic_goals: [
      'Multi-strain Trichoderma harzianum basal application',
      'Balanced potash foliar sprays at bulb development',
      'Uniform pre-harvest curing protocol'
    ],
    status: 'Sowing & Vegetative Care'
  }
];

const b2b_clusters = [
  {
    cluster_id: 'CLUST-TN-01',
    name: 'Pollachi-Coimbatore Irrigated Horticultural Belt',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    fpo_id: 1,
    fpo_name: 'Kovai Kongu Organic Producers FPO',
    enrolled_farmers: 420,
    verified_acreage: 1850,
    soil_type: 'Red Sandy Loam to Clayey Loam',
    lead_agronomist: {
      name: 'Dr. K. Radhakrishnan',
      title: 'Senior Horticultural Agronomist',
      qualification: 'PhD Agronomy (TNAU)',
      phone: '+91 94432 11098'
    },
    village_coordinators_count: 9,
    coverage_ratio: '1 Agronomist : 140 Farmers (1 VC : 46 Farmers)',
    collection_points: [
      { name: 'Pollachi Agri Logistics Terminal', capacity_mt: 80, cold_chain: true },
      { name: 'Kinathukadavu Aggregation Hub', capacity_mt: 40, cold_chain: false }
    ],
    logistics: {
      road_access: 'All-weather dual carriageway (NH-83 access)',
      avg_distance_km: 6.4,
      avg_response_hours: 3.2
    },
    spoken_languages: ['Tamil', 'English'],
    cropping_patterns: 'Tomato ➔ Black Gram ➔ Maize Rotation'
  },
  {
    cluster_id: 'CLUST-MH-02',
    name: 'Nashik-Niphad Horti & Allium Production Zone',
    state: 'Maharashtra',
    district: 'Nashik',
    fpo_id: 2,
    fpo_name: 'Sahyadri Agro Horti Collective',
    enrolled_farmers: 510,
    verified_acreage: 2900,
    soil_type: 'Medium Black Basaltic Soil',
    lead_agronomist: {
      name: 'Er. Snehal Patil',
      title: 'Horticultural Systems Specialist',
      qualification: 'M.Sc Agronomy (MPKV Rahuri)',
      phone: '+91 98231 77410'
    },
    village_coordinators_count: 14,
    coverage_ratio: '1 Agronomist : 128 Farmers (1 VC : 36 Farmers)',
    collection_points: [
      { name: 'Pimpalgaon Baswant Integrated Packhouse', capacity_mt: 150, cold_chain: true },
      { name: 'Dindori Primary Collection Yard', capacity_mt: 60, cold_chain: false }
    ],
    logistics: {
      road_access: 'National Highway NH-848 & State Paved Access',
      avg_distance_km: 8.2,
      avg_response_hours: 4.0
    },
    spoken_languages: ['Marathi', 'Hindi'],
    cropping_patterns: 'Onion ➔ Soybean ➔ Leafy Vegetables'
  },
  {
    cluster_id: 'CLUST-MP-03',
    name: 'Malwa Black Soil Pulse & Grain Cluster',
    state: 'Madhya Pradesh',
    district: 'Indore',
    fpo_id: 3,
    fpo_name: 'Malwa Agri-Vanguard Producer Co.',
    enrolled_farmers: 310,
    verified_acreage: 1420,
    soil_type: 'Deep Vertisols (Black Cotton Soil)',
    lead_agronomist: {
      name: 'Dr. Vikramaditya Chouhan',
      title: 'Principal Agronomist (Legume & Grain)',
      qualification: 'ICAR-IISR Certified Agronomist',
      phone: '+91 97551 22980'
    },
    village_coordinators_count: 8,
    coverage_ratio: '1 Agronomist : 155 Farmers (1 VC : 38 Farmers)',
    collection_points: [
      { name: 'Sanwer Agri-Produce Silo & Yard', capacity_mt: 200, cold_chain: false },
      { name: 'Depalpur Farmer Center', capacity_mt: 90, cold_chain: false }
    ],
    logistics: {
      road_access: 'State Arterial Highway SH-27',
      avg_distance_km: 11.5,
      avg_response_hours: 4.5
    },
    spoken_languages: ['Hindi', 'Malwi'],
    cropping_patterns: 'Soybean ➔ Chickpea ➔ Wheat'
  }
];

const b2b_baselines = {
  indicators: [
    {
      metric: 'Input Cost per Acre',
      baseline_val: '₹15,400',
      target_val: '₹11,200',
      current_val: '₹11,480',
      improvement_pct: '-25.5%',
      benchmark_source: 'Pre-program audited billing records'
    },
    {
      metric: 'Soil Organic Carbon',
      baseline_val: '0.46%',
      target_val: '0.75%',
      current_val: '0.68%',
      improvement_pct: '+47.8%',
      benchmark_source: 'Baseline soil laboratory spectrophotometry'
    },
    {
      metric: 'Pest & Disease Loss Rate',
      baseline_val: '19.2%',
      target_val: '< 6.0%',
      current_val: '5.8%',
      improvement_pct: '-69.8%',
      benchmark_source: 'Historical crop scout incident reports'
    },
    {
      metric: 'Market Yield per Acre',
      baseline_val: '2.15 MT',
      target_val: '2.85 MT',
      current_val: '2.82 MT',
      improvement_pct: '+31.2%',
      benchmark_source: 'Regional Agricultural University district stats'
    },
    {
      metric: 'Post-Harvest Rejection Rate',
      baseline_val: '14.8%',
      target_val: '< 3.5%',
      current_val: '2.6%',
      improvement_pct: '-82.4%',
      benchmark_source: 'Mandi gate arrival inspection reports'
    },
    {
      metric: 'Farmer Protocol Knowledge Score',
      baseline_val: '38 / 100',
      target_val: '85 / 100',
      current_val: '82 / 100',
      improvement_pct: '+115.8%',
      benchmark_source: 'Baseline randomized farmer survey (240 sample)'
    }
  ],
  root_cause_breakdown: [
    {
      category: 'Agronomy Deficits (60% of Gaps)',
      description: 'Lack of biological seed inoculation, improper fertilizer timing, over-reliance on chemical prophylactic sprays.',
      action_taken: 'Deployed region-specific 5-stage protocols & village coordinator coaching.'
    },
    {
      category: 'Agri-Input Availability (25% of Gaps)',
      description: 'Farmers purchasing adulterated or spurious inputs late in the season at high retail markup.',
      action_taken: 'Consolidated farm-by-farm demand & pre-season bulk delivery at FPO level.'
    },
    {
      category: 'Infrastructure & Market Access (15% of Gaps)',
      description: 'Field-level sorting absent; moisture testing only conducted upon delivery rejection at factory.',
      action_taken: 'Moved quality testing upstream to farm gate & installed calibrated moisture meters.'
    }
  ]
};

const b2b_protocols = [
  {
    protocol_id: 'PROTO-TOM-2026',
    crop: 'Tomato',
    region: 'South Deccan Irrigated Zone (Tamil Nadu / Karnataka)',
    target_buyer_grade: 'Processing Puree Grade (Brix > 4.8°)',
    stages: [
      {
        stage_num: 1,
        stage_name: 'Land Preparation & Basal Nutrition',
        days_window: 'Day -15 to Day 0',
        operations: [
          'Incorporate 2.5 tonnes aged vermicompost per acre',
          'Apply 2 kg Trichoderma viride + 2 kg Pseudomonas fluorescens per acre in organic manure',
          'Prepare broad bed & furrows with 16mm inline drip lines (spacing 40cm)'
        ],
        critical_check: 'Soil pH must test between 6.2 and 7.2 prior to transplanting.'
      },
      {
        stage_num: 2,
        stage_name: 'Seedling Transplant & Establishment',
        days_window: 'Day 1 to Day 20',
        operations: [
          'Root dip 25-day seedlings in Azospirillum & PSB microbial slurry for 20 mins',
          'Transplant in paired rows (60cm x 45cm spacing) during late afternoon',
          'Light establishment drip irrigation (2 hours/day)'
        ],
        critical_check: 'Establishment survival rate must exceed 96% by Day 7.'
      },
      {
        stage_num: 3,
        stage_name: 'Vegetative Growth & Tensiometer Irrigation',
        days_window: 'Day 21 to Day 50',
        operations: [
          'Install 10 yellow sticky traps & 4 helicoverpa pheromone traps per acre',
          'Foliar spray with Neem oil (10,000 ppm) @ 2.5 ml/L on Day 28',
          'Drip fertigation: Bio-potash and secondary micro-nutrients (Zinc + Boron)'
        ],
        critical_check: 'Scout weekly for Leaf Miner and Whitefly; alert coordinator if > 3 leaves/plant affected.'
      },
      {
        stage_num: 4,
        stage_name: 'Flowering, Fruit Set & Pest Management',
        days_window: 'Day 51 to Day 85',
        operations: [
          'Apply bio-stimulant sea-weed extract @ 2 ml/L at initiation of 1st floral flush',
          'Release Trichogramma chilonis egg parasitoids @ 50,000/acre at fruit borer ETL (5% infestation)',
          'Strict prohibition of synthetic organophosphates to maintain buyer MRL clearance'
        ],
        critical_check: 'Lead Agronomist sign-off required for any chemical intervention.'
      },
      {
        stage_num: 5,
        stage_name: 'Harvest Maturity & Upstream Quality Grading',
        days_window: 'Day 86 to Day 115',
        operations: [
          'Withhold drip irrigation 3 days prior to harvest to concentrate Brix sugars',
          'Harvest at turning / pink stage early morning to avoid field heat',
          'Field gate sorting into plastic crates; QR lot tagging with farmer ID & moisture test'
        ],
        critical_check: 'Handheld refractometer Brix test: Minimum 4.8° required for premium pricing.'
      }
    ],
    escalation_governance: {
      protocol_deviation_authority: 'Lead Agronomist Dr. K. Radhakrishnan',
      trigger_conditions: [
        'Rainfall > 35 mm within 24h (Fungicide wash-off risk)',
        'Whitefly vector count > 8 per leaf (Tomato Leaf Curl Virus threat)',
        'Temperature exceeding 38°C for 3 consecutive days (Flower drop mitigation)'
      ],
      response_sla_hours: 4
    }
  },
  {
    protocol_id: 'PROTO-SOY-2026',
    crop: 'Soybean & Pulses',
    region: 'Central Malwa Vertisol Plateau (Madhya Pradesh)',
    target_buyer_grade: 'Export Non-GMO Grade 1 (Moisture < 10%)',
    stages: [
      {
        stage_num: 1,
        stage_name: 'Pre-Sowing Seed Inoculation',
        days_window: 'Day -5 to Day 0',
        operations: [
          'Coat certified JS-9560 / NRC-37 seed with Bradyrhizobium japonicum @ 5g/kg seed',
          'Co-inoculate with Phosphate Solubilizing Bacteria (PSB) @ 5g/kg in jaggery slurry',
          'Dry in shade for 4 hours before sowing; never expose to direct sunlight'
        ],
        critical_check: '100% of seed bags must show verified bio-tag verification.'
      },
      {
        stage_num: 2,
        stage_name: 'Broadbed Furrow Sowing & Moisture Conservation',
        days_window: 'Day 1 to Day 25',
        operations: [
          'Sowing using BBF seed drill at 45cm row spacing with monsoon onset (> 75mm rain received)',
          'Maintain 8-10 plants per linear meter to optimize canopy humidity and suppress weeds'
        ],
        critical_check: 'Nodule count inspection on Day 21: Minimum 15 pink active nodules per taproot.'
      },
      {
        stage_num: 3,
        stage_name: 'Integrated Pod Borer & Weed Management',
        days_window: 'Day 26 to Day 65',
        operations: [
          'Install bird perches @ 20 per acre for natural caterpillar predation',
          'Spray Bacillus thuringiensis (Bt) @ 1.5 kg/ha at first appearance of semilooper larvae',
          'Intercrop single row of pigeonpea every 4 rows for pest barrier and additional bio-N'
        ],
        critical_check: 'Zero synthetic herbicide application after Day 30.'
      },
      {
        stage_num: 4,
        stage_name: 'Harvesting & Silo Moisture Settlement',
        days_window: 'Day 85 to Day 105',
        operations: [
          'Harvest when 90% of pods turn golden brown and seeds detach with rattling sound',
          'Thresher drum speed adjusted to 400-500 rpm to prevent seed coat cracking',
          'Sun dry on tarpaulin sheets to achieve < 10% moisture before bagging in hermetic liners'
        ],
        critical_check: 'Moisture meter reading recorded at FPO aggregation center.'
      }
    ],
    escalation_governance: {
      protocol_deviation_authority: 'Dr. Vikramaditya Chouhan (ICAR-IISR Senior Agronomist)',
      trigger_conditions: [
        'Prolonged dry spell > 18 days during pod filling (Protective sprinkler schedule)',
        'Girdle beetle infestation exceeding 10% plants in cluster',
        'Early pod shattering risk due to sudden thermal spike'
      ],
      response_sla_hours: 4
    }
  }
];

let b2b_escalations = [
  {
    ticket_id: 'ESC-2026-401',
    cluster_id: 'CLUST-TN-01',
    program_id: 'PRG-2026-001',
    village_coordinator: 'M. Senthil',
    lead_agronomist: 'Dr. K. Radhakrishnan',
    farm_id: 101,
    farmer_name: 'Ramesh Kumar',
    crop: 'Tomato',
    reported_stage: 'Vegetative (Day 34)',
    issue_type: 'Pest Outbreak Alert',
    description: 'Noticed silvering and upward cupping on young terminal leaves across 2.5 acres. Suspected early thrips / whitefly vector pressure.',
    photo_attached: true,
    status: 'Resolved',
    logged_at: '2026-09-12 09:15',
    resolved_at: '2026-09-12 12:40',
    agronomist_resolution: 'Examined high-res leaf underside photos. Confirmed mild Thrips tabaci presence below economic threshold. Authorized biological release of Chrysoperla carnea predators + foliar spray of Lecanicillium lecanii bio-fungicide @ 5g/L. Rescheduled chemical override.'
  },
  {
    ticket_id: 'ESC-2026-402',
    cluster_id: 'CLUST-MH-02',
    program_id: 'PRG-2026-003',
    village_coordinator: 'V. Shinde',
    lead_agronomist: 'Er. Snehal Patil',
    farm_id: 102,
    farmer_name: 'Balasaheb Jadhav',
    crop: 'Onion',
    reported_stage: 'Bulb Initiation (Day 48)',
    issue_type: 'Weather Anomaly & Root Rot Risk',
    description: 'Unseasonal heavy cloudburst (42mm rain in 3 hours) caused localized water stagnation in low-lying plots. Risk of basal rot / damping-off.',
    photo_attached: true,
    status: 'In Action',
    logged_at: '2026-09-14 07:30',
    resolved_at: null,
    agronomist_resolution: 'Field team mobilized with sub-surface drainage trenches. Protocol override issued: Drenching with Trichoderma asperellum @ 10g/L + bio-copper solution once soil drains.'
  }
];

const b2b_scorecard = {
  reporting_season: 'Kharif-Rabi 2026-2027',
  reach: {
    total_farmers_enrolled: 1240,
    total_villages_covered: 48,
    total_acreage_verified: 6170,
    target_achievement_pct: '102.8%'
  },
  adoption: {
    advice_received_pct: 100.0,
    advice_understood_pct: 86.9,
    advice_applied_pct: 74.0,
    industry_benchmark_pct: 45.0,
    variance_vs_benchmark: '+29.0%'
  },
  field_execution: {
    visits_scheduled: 3840,
    visits_completed: 3702,
    completion_rate_pct: '96.4%',
    escalation_tickets_logged: 48,
    escalation_resolved_within_sla: 47,
    sla_compliance_pct: '97.9%',
    lead_demo_plots_active: 36
  },
  production: {
    avg_yield_uplift_pct: '+31.2%',
    harvest_loss_reduction_pct: '-68.8%',
    yield_forecast_accuracy_pct: '93.8%',
    total_output_projected_mt: 2480
  },
  quality: {
    buyer_grade_compliance_pct: '97.4%',
    rejection_rate_current_pct: '2.6%',
    rejection_rate_baseline_pct: '14.8%',
    traceability_audit_score: '98/100'
  },
  procurement: {
    target_volume_mt: 2150,
    committed_volume_mt: 2025,
    fulfillment_rate_pct: '94.2%',
    on_time_delivery_rating: '98.5%'
  },
  financial: {
    avg_input_cost_savings_per_acre: '₹4,200',
    farmer_net_margin_expansion: '+38.5%',
    cost_per_farmer_serviced: '₹340 / season',
    roi_multiple_for_buyer: '4.8x (via lower reject waste & assured supply)'
  }
};

const counters = { soil_id: 5002, eval_id: 1, plan_id: 7001, plan_season_id: 1, sim_id: 1, rec_id: 1, history_id: 4, contract_counter: 115, ticket_counter: 403, program_counter: 4, user_id: 1, farmer_id: Math.max(...farmers.map(f => f.farmer_id)), farm_id: Math.max(...farms.map(f => f.farm_id)) };

// ============================================================
// users — Account registry (Farmer + B2B Buyer roles)
// Passwords are bcrypt hashes; never store or log plaintext.
// ============================================================
const users = [];

// ============================================================
// live_sensor_status — Latest ESP32 heartbeat per farm_id, keyed
// by farm_id. Used to show "connected / stale / never connected"
// in the Soil Analysis Live Sensor UI without scanning soil_data.
// ============================================================
const live_sensor_status = {};

module.exports = {
  seasons, crops, farmers, farms,
  soil_data, crop_history, weather_data,
  crop_evaluations, rotation_plans, rotation_plan_seasons,
  soil_simulation_log, recommendations,
  fpos, corporate_buyers, b2b_contracts, input_suppliers,
  b2b_programs, b2b_clusters, b2b_baselines, b2b_protocols, b2b_escalations, b2b_scorecard,
  users,
  live_sensor_status,
  counters,
  uuidv4,
};