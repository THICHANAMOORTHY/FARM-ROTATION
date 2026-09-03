# 🌱 CropSmart — Smart Crop Rotation & Soil Restorer (P025)

An AI-driven agronomy platform that diagnoses soil deficiencies, evaluates candidate crops across 7 dimensions using real multi-source Kaggle datasets (24,400+ field measurements), optimizes multi-season rotation plans, models soil recovery trajectories, and recommends actionable crop sequences.

---

## 🌟 Key Features

- **Dynamic Soil Health Diagnosis**: Real-time NPK, pH, and Organic Carbon scoring with deficiency detection and adequacy tagging.
- **Continuous Cultivation Penalty Detection**: Automatically identifies monoculture patterns in historical harvest records to prevent pest buildup and nutrient depletion.
- **Triple-Source Kaggle Dataset Integration**: 24,400 rows across 26 unique crops merged from 3 Kaggle datasets:
  1. `madhuraatmarambhagat/crop-recommendation-dataset`
  2. `aksahaha/crop-recommendation`
  3. `javakhan/crops-npk-data-set`
- **7-Dimensional Crop Scoring Engine**:
  - Soil Suitability (statistical Z-score matching against real NPK distributions)
  - Season Suitability (Kharif, Rabi, Zaid)
  - Crop Family Rotation Diversity (Solanaceae, Legume, Cereal, Fruit, Commercial)
  - Water & Irrigation Alignment
  - Projected Profitability per Acre
  - Disease & Pest Risk Index
  - Climate & Weather Fit (Rainfall, Temperature, Humidity)
- **Multi-Season Rotation Optimizer**: Generates Plan A (status quo), Plan B (recommended restorative), and Plan C (alternative diversification) with projected seasonal profits and soil health trajectories.
- **Soil Recovery Simulator**: Season-by-season animation tracking biological nitrogen fixation and nutrient replenishment.
- **Modern Glassmorphism UI**: Dark mode SPA with animated SVG gauges, responsive Chart.js radar and timeline graphs.

---

## 🏗️ Architecture

```
farmers ──< farms ──< soil_data
                  ├──< crop_history
                  ├──< weather_data
                  ├──< crop_evaluations >── crops
                  ├──< rotation_plans ──< rotation_plan_seasons >── crops
                  ├──< soil_simulation_log
                  └──< recommendations
```

### Supported Crops (26 Total)
`Apple · Banana · Blackgram · Chickpea · Coconut · Coffee · Cotton · Grapes · Jute · Kidneybeans · Lentil · Maize · Mango · Mothbeans · Mungbean · Muskmelon · Orange · Papaya · Pigeonpeas · Pomegranate · Potato · Rice · Sugarcane · Tomato · Watermelon · Wheat`

---

## 🚀 Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. (Optional) Connect to Supabase Cloud Database

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Copy your project URL & Anon key into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-or-service-role-key
   ```
4. Sync the 26 Kaggle crops and demo entities to Supabase:
   ```bash
   cd backend
   npm run db:sync
   ```
*(If Supabase credentials are not provided, the server automatically runs with the high-fidelity in-memory seed database).*

### 3. (Optional) Refresh Dataset Pipeline
```bash
python process_crop_dataset.py
```

### 4. Start the Server
```bash
cd backend
node server.js
```
The server runs on **`http://localhost:3000`** and serves both the REST API and the frontend single-page application.

### 4. Run Automated API Tests
```bash
python test_all_apis.py
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/crops` | 26 crops master data with dataset statistics |
| `POST` | `/api/soil-analysis` | Computes soil health score & deficiencies |
| `POST` | `/api/crop-history` | Analyzes monoculture / rotation issues |
| `GET` | `/api/candidate-crops` | Filters crops by season, water, & rotation rules |
| `POST` | `/api/crop-evaluation` | Scores crops across 7 dimensions with rankings |
| `POST` | `/api/optimize-rotation` | Generates 3 multi-season rotation plans |
| `POST` | `/api/soil-simulation` | Models season-by-season nutrient evolution |
| `GET` | `/api/recommendation` | Returns optimal crop, rotation sequence, & reasoning |
| `GET` | `/api/dashboard` | Aggregated farm status, KPIs, charts, & alerts |

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── data/
│   │   ├── kaggle_crops.js        # Merged dataset stats (24,400 rows)
│   │   └── seed.js                # In-memory store & master tables
│   ├── routes/                    # Express route handlers
│   ├── package.json
│   └── server.js                  # Entry point
├── frontend/
│   ├── css/
│   │   └── style.css              # Custom dark glassmorphism design system
│   ├── js/                        # Modular vanilla JS controllers
│   └── index.html                 # Single page application shell
├── process_crop_dataset.py        # Kaggle dataset download & merge script
├── test_all_apis.py               # End-to-end API test suite
├── P025_database_and_backend_design.md
└── README.md
```
