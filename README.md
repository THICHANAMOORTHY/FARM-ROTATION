# 🌱 UZHAVU KAAPPAAN (உழவு காப்பான்) — Smart Crop Rotation & Soil Restorer (P025)

[![GitHub Repository](https://img.shields.io/badge/GitHub-THICHANAMOORTHY%2FFARM--ROTATION-181717?style=flat-square&logo=github)](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Kaggle Records](https://img.shields.io/badge/Datasets-782%2C374%20Empirical%20Records-blue.svg?style=flat-square&logo=kaggle)](https://www.kaggle.com/)
[![Supported Crops](https://img.shields.io/badge/Supported%20Crops-60%20Master%20Varieties-success.svg?style=flat-square)](https://github.com/THICHANAMOORTHY/FARM-ROTATION)

> **Web Application**: **UZHAVU KAAPPAAN (உழவு காப்பான்)**  
> **Repository**: [https://github.com/THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION)  
> **Problem Statement**: P025 — Smart Crop Rotation & Soil Restorer  
> **Hackathon**: HACK-2K26

**UZHAVU KAAPPAAN (உழவு காப்பான்)** is an end-to-end intelligent agronomy platform that diagnoses soil health, evaluates candidate crops across 7 quantitative dimensions using real multi-source Kaggle and Indian agricultural datasets (**782,374 empirical records across 60 crops**), optimizes multi-season crop rotation trajectories, simulates biological soil recovery, provides real-time hyperlocal weather intelligence, and powers an AI-driven Kisan agronomist advisory chatbot with full Tamil voice capabilities.

---

## 🌟 Key Features

### 1. 🧪 Dynamic Soil Health Diagnosis
- Real-time scoring of **NPK (Nitrogen, Phosphorus, Potassium)**, **pH**, and **Organic Carbon (OC)** against ideal agronomic benchmarks.
- Automated deficit calculation and classification (`Deficient`, `Adequate`, `Surplus`).
- Organic and chemical fertilizer dosage calculator (Urea, DAP, MOP, Farmyard Manure/Vermicompost) tailored to field acreage.

### 2. 🔄 Monoculture & Continuous Cultivation Penalty Detection
- Analyzes historical farm harvest records to detect repetitive single-crop patterns.
- Applies quantitative penalty factors to prevent pathogen/pest accumulation, root-knot nematode spread, and severe nutrient depletion (e.g. Solanaceae blight risk).

### 3. 📊 Quad-Source Empirical Dataset (782,374 Records | 60 Crops)
Unified from 4 comprehensive agricultural datasets:
1. `arjunyadav99/indian-agricultural-mandi-prices-20232025` (737,392 records)
2. `anshtanwar/current-daily-price-of-various-commodities-india` (23,093 records)
3. `madhuraatmarambhagat/crop-recommendation-dataset` (2,200 records)
4. `akshatgupta7/crop-yield-in-indian-states-dataset` (19,689 records)

Covers **60 diverse crops** across Cereals, Pulses & Legumes, Vegetables, Cash Crops, Fruits, Spices, Oilseeds, and Plantation Crops.

### 4. 🧮 7-Dimensional Crop Scoring Engine
Evaluates every candidate crop with statistical rigor:
- **Soil Suitability**: Normalized Z-score proximity to optimal N, P, K, and pH curves.
- **Season Suitability**: Strict matching with Kharif, Rabi, and Zaid cultivation cycles.
- **Crop Family Diversity**: Rotational balance across Legumes, Solanaceae, Poaceae/Cereals, Cucurbits, Malvaceae, etc.
- **Water & Irrigation Alignment**: Compares farm irrigation capacity against crop water requirements (Low, Moderate, High).
- **Projected Profitability**: Realistic profit/acre estimations derived from live Mandi prices, average yields, and production costs.
- **Disease & Pest Risk Index**: Biological risk modeling based on previous crop family residual pathogens.
- **Microclimate & Weather Fit**: Alignment with rainfall, temperature, and humidity profiles.

### 5. 🗺️ Multi-Season Rotation Optimizer
Generates three distinct 3-season actionable rotation plans:
- **Plan A (Status Quo)**: Business-as-usual trajectory with risk highlighting.
- **Plan B (Recommended Restorative)**: Balances soil restoration (biological nitrogen-fixing pulses) and maximum farm profitability.
- **Plan C (Diversified Resilient)**: Maximizes ecological diversity and market risk hedging.

### 6. 📈 Soil Recovery & Nutrient Simulator
- Models season-by-season soil health evolution under each crop plan.
- Simulates biological nitrogen fixation (+20 to +40 kg/ha from legumes), organic carbon build-up, and nutrient drawdowns.

### 7. ⛅ Hyperlocal Weather Intelligence & Agri-Advisories
- Integrated with live **Open-Meteo & OpenWeather APIs** for farm-specific coordinates.
- **7-day agricultural forecasts**: Precipitation probability, wind speeds, solar radiation, humidity, and temperature.
- **Actionable agronomic advisories**: Spraying condition alerts (wind drift/rain risk), frost warnings, and irrigation scheduling.

### 8. 🤖 Kisan AI Agronomist Chatbot
- Interactive conversational AI powered by Google Gemini (with an offline agronomy rule-engine fallback).
- Answers farmer queries in real-time regarding soil test interpretation, pest management, fertilizer scheduling, and crop selection.
- Context-aware: Automatically accesses active farm soil state, history, and AI recommendations.

### 9. 🌐 Multilingual Accessibility (6 Languages)
- Full localized interface supporting **English**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Marathi (मराठी)**, and **Kannada (ಕನ್ನಡ)**.

### 10. 📄 Automated Farmer Action Plan & Export
- One-click PDF generation of the complete **Farmer Soil Health Action Plan & 3-Season Restoration Roadmap**.
- Direct CSV and JSON dataset downloads for research and integration.

---

## 🏗️ Architecture

```
[ Frontend: Vanilla JS + Glassmorphism UI + Chart.js + i18n ]
                         │
                    REST API Calls
                         ▼
[ Backend: Node.js Express Server ] ──┬── [ Open-Meteo / OpenWeather API ]
                                       ├── [ Google Gemini AI API ]
                                       ├── [ Supabase Cloud PostgreSQL / In-Memory Seed ]
                                       └── [ Quad-Source Agronomy Engine (60 Crops) ]
```

### Entity Relationship Model

```
farmers ──< farms ──< soil_data
                  ├──< crop_history
                  ├──< weather_data
                  ├──< crop_evaluations >── crops (60 Master Crops)
                  ├──< rotation_plans ──< rotation_plan_seasons >── crops
                  ├──< soil_simulation_log
                  └──< recommendations
```

### Supported Crops (60 Master Crops)
`Apple · Arecanut · Arhar/Tur · Bajra · Banana · Barley · Blackgram (Urad) · Cabbage · Cardamom · Carrot · Cashewnut · Castor Seed · Cauliflower · Chickpea · Chilli · Coconut · Coffee · Coriander · Cotton · Cowpea (Lobia) · Cumin · Drumstick · Dry Chillies · Garlic · Ginger · Grapes · Green Gram (Moong) · Groundnut · Guava · Horsegram · Jowar · Jute · Kidneybeans (Rajma) · Lentil (Masoor) · Linseed · Maize · Mango · Mothbeans · Mustard · Niger Seed · Nutmeg · Onion · Orange · Papaya · Pepper (Black) · Pigeonpeas · Pomegranate · Potato · Ragi (Finger Millet) · Rice · Rubber · Safflower · Sesame · Soybean · Sugarcane · Sunflower · Tapioca · Tea · Tomato · Turmeric · Watermelon · Wheat`

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python 3.8+ (for data pipelines & testing)
- Git & npm

### 1. Clone the Repository
```bash
git clone https://github.com/THICHANAMOORTHY/FARM-ROTATION.git
cd FARM-ROTATION
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` (optional keys):
```env
PORT=3000
# (Optional) Supabase Cloud PostgreSQL connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-role-key

# (Optional) Google Gemini API for AI Agronomist Chatbot
GEMINI_API_KEY=your_gemini_api_key

# (Optional) OpenWeatherMap API for live weather
OPENWEATHER_API_KEY=your_openweather_api_key
```
*(Note: If cloud API keys are omitted, CropSmart automatically runs with high-fidelity local datasets, offline agronomy intelligence, and Open-Meteo free tier).*

### 4. (Optional) Sync with Supabase Cloud Database
1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run the schema found in [`supabase/schema.sql`](supabase/schema.sql).
3. Populate database with 60 crops and seed farms:
   ```bash
   cd backend
   npm run db:sync
   ```

### 5. Start the Application Server
```bash
cd backend
node server.js
```
- Open **`http://localhost:3000`** in your browser to access the complete application.

### 6. Run Automated End-to-End API Test Suite
```bash
python test_all_apis.py
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and database connection status |
| `GET` | `/api/crops` | 60 master crops with empirical agronomic statistics & prices |
| `GET` | `/api/farms` | List registered farm profiles and land characteristics |
| `GET` | `/api/seasons` | Agricultural season definitions (Kharif, Rabi, Zaid) |
| `POST` | `/api/soil-analysis` | Computes soil health score (0-100), deficits & fertilizer dosages |
| `POST` | `/api/crop-history` | Analyzes monoculture patterns and applies rotation penalties |
| `GET` | `/api/candidate-crops` | Filters compatible crops by season, soil, water, and crop family |
| `POST` | `/api/crop-evaluation` | Computes 7-dimensional scores, rankings, and projected profits |
| `POST` | `/api/optimize-rotation` | Generates 3 multi-season rotation plans (A, B, C) |
| `POST` | `/api/soil-simulation` | Computes season-by-season nutrient recovery trajectories |
| `GET` | `/api/recommendation` | Returns top recommended crop, optimal rotation sequence & rationale |
| `GET` | `/api/dashboard` | Aggregated farm state, soil radar data, alerts & KPIs |
| `GET` | `/api/weather` | Live weather observations, 7-day forecast & agricultural advisories |
| `POST` | `/api/chat` | Kisan AI conversational agronomy advisor endpoint |
| `GET` | `/api/report` | Structured comprehensive farm summary report |
| `GET` | `/download/farmer-plan-pdf` | Downloadable Farmer Action Plan PDF |
| `GET` | `/download/crops-csv` | Downloadable Master 60 Crops Agronomy & Mandi CSV |
| `GET` | `/download/crops-json` | Downloadable Master 60 Crops Agronomy & Mandi JSON |

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── data/
│   │   ├── kaggle_crops.js        # Merged dataset model (782,374 rows, 60 crops)
│   │   └── seed.js                # Master agronomy database & seed records
│   ├── db/
│   │   └── supabase.js            # Supabase Cloud client with seamless fallback
│   ├── routes/
│   │   ├── candidateCrops.js      # Candidate generation & family filtering
│   │   ├── chat.js                # Kisan AI chatbot route (Gemini + Local Engine)
│   │   ├── cropEvaluation.js      # 7-Dimensional crop evaluation engine
│   │   ├── cropHistory.js         # Monoculture penalty & history analyzer
│   │   ├── dashboard.js           # Farm overview aggregator
│   │   ├── optimizeRotation.js    # Multi-season rotation planning optimizer
│   │   ├── recommendation.js      # Final agronomic recommendations
│   │   ├── report.js              # Agronomic report generator
│   │   ├── soilAnalysis.js        # Soil deficit & fertilizer calculator
│   │   ├── soilSimulation.js      # Nutrient recovery simulation model
│   │   └── weather.js             # Live weather & farming advisories
│   ├── scripts/
│   │   └── sync_supabase.js       # Syncs 60 crops and seed data to Supabase
│   ├── server.js                  # Express application entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── css/
│   │   └── style.css              # Dark glassmorphism UI & responsive styles
│   ├── js/
│   │   ├── app.js                 # SPA navigation & state manager
│   │   ├── chatbot.js             # Kisan AI assistant widget
│   │   ├── cropHistory.js         # Crop history & monoculture UI
│   │   ├── dashboard.js           # Overview, KPI cards, radar charts
│   │   ├── evaluation.js          # 7-D crop evaluation breakdown
│   │   ├── i18n.js                # Multilingual translations (6 Indian languages)
│   │   ├── recommendation.js      # Top recommendations & rationale UI
│   │   ├── reportPdf.js           # Client-side PDF export generator
│   │   ├── rotation.js            # Multi-season plan comparisons
│   │   ├── simulation.js          # Interactive soil recovery timeline
│   │   ├── soilAnalysis.js        # Soil test input & NPK gauges
│   │   └── weather.js             # Weather forecast & spray advisories
│   └── index.html                 # Main single-page application shell
├── downloads/                     # Exportable PDF, CSV, and JSON assets
├── supabase/
│   └── schema.sql                 # PostgreSQL tables, indexes & RLS schema
├── process_crop_dataset.py        # Python data processing pipeline
├── process_indian_crop_yield.py   # Crop yield integration script
├── generate_farmer_pdf.py         # Standalone PDF generation utility
├── test_all_apis.py               # Automated REST API test suite
├── P025_database_and_backend_design.md
└── README.md
```

---

## 👥 Authors & Repository

- **Repository**: [https://github.com/THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
- **Problem Statement**: P025 — Smart Crop Rotation & Soil Restorer (HACK-2K26)
- Built with ❤️ for sustainable agriculture and farmer empowerment across India.
