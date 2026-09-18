# 🌱 UZHAVU KAAPPAAN (உழவு காப்பான்) — Smart Crop Rotation & Soil Restorer (P025)

[![GitHub Repository](https://img.shields.io/badge/GitHub-THICHANAMOORTHY%2FFARM--ROTATION-181717?style=flat-square&logo=github)](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Kaggle Records](https://img.shields.io/badge/Datasets-782%2C374%20Empirical%20Records-blue.svg?style=flat-square&logo=kaggle)](https://www.kaggle.com/)
[![Supported Crops](https://img.shields.io/badge/Supported%20Crops-60%20Master%20Varieties-success.svg?style=flat-square)](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
[![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-orange.svg?style=flat-square)](#-account-system--authentication)
[![IoT](https://img.shields.io/badge/IoT-ESP32%20Live%20Sensors-blueviolet.svg?style=flat-square)](#-esp32-live-soil-sensor-integration)

> **Web Application**: **UZHAVU KAAPPAAN (உழவு காப்பான்)**
> **Repository**: [https://github.com/THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
> **Problem Statement**: P025 — Smart Crop Rotation & Soil Restorer
> **Hackathon**: HACK-2K26

**UZHAVU KAAPPAAN (உழவு காப்பான்)** is an end-to-end intelligent agronomy platform for two audiences at once. For **individual farmers**, it diagnoses soil health (from manual entry or a **live ESP32 IoT sensor**), evaluates candidate crops across 7 quantitative dimensions using real multi-source Kaggle and Indian agricultural datasets (**782,374 empirical records across 60 crops**), optimizes multi-season crop rotation trajectories, simulates biological soil recovery, allocates GPS-based precision micro-zones, provides hyperlocal weather intelligence, and powers a bilingual voice-enabled AI agronomist chatbot. For **corporate buyers and FPOs**, it runs a full **B2B Enterprise & Corporate Sourcing Hub** — forward contracts, an AI-powered procurement matchmaker with real-time matching, ESG/carbon reporting, and a 6-step institutional sourcing workflow — behind its own account system.

---

## 🌟 Key Features

### 1. 🧪 Dynamic Soil Health Diagnosis — Manual or Live IoT
- Real-time scoring of **NPK (Nitrogen, Phosphorus, Potassium)**, **pH**, and **Organic Carbon (OC)** against ideal agronomic benchmarks.
- Automated deficit calculation and classification (`Deficient`, `Adequate`, `Surplus`), color-coded per nutrient in the UI.
- Organic and chemical fertilizer dosage calculator (Urea, DAP, MOP, Farmyard Manure/Vermicompost) tailored to field acreage.
- **Manual Entry / Live Sensor (ESP32) toggle** — switch the same page between hand-entered readings and a live-streaming physical soil sensor (see [ESP32 Live Soil Sensor Integration](#-esp32-live-soil-sensor-integration)).

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

### 7. 🛰️ GPS Farm Zone Allocation & Spatial Soil Analysis
- Detects live GPS coordinates or accepts manual entry to geofence a farm into precision micro-zones.
- Per-zone spatial soil condition heatmap, variable-rate nutrition recommendations, and projected input-cost reduction.
- Exportable zone reports for field teams.

### 8. ⛅ Hyperlocal Weather Intelligence & Agri-Advisories
- Integrated with live **Open-Meteo & OpenWeather APIs** for farm-specific coordinates, plus a location search endpoint to switch farms by city/district.
- **7-day agricultural forecasts**: Precipitation probability, wind speeds, solar radiation, humidity, and temperature.
- **Actionable agronomic advisories**: Spraying condition alerts (wind drift/rain risk), frost warnings, and irrigation scheduling.

### 9. 🤖 Kisan AI Agronomist Chatbot — with Live Voice
- Interactive conversational AI powered by Google Gemini (with an offline agronomy rule-engine fallback if no API key or the model is rate-limited).
- Bidirectional **Tamil voice chat**: speech recognition (mic input) and text-to-speech playback with an audio waveform visualizer.
- Context-aware: automatically accesses the active farm's soil state, crop history, and AI recommendations.

### 10. 🌐 Multilingual Accessibility (English & Tamil)
- Full localized interface with a one-click **English / தமிழ் (Tamil)** toggle in the sidebar — covers navigation, forms, alerts, and the AI chatbot's replies (including live Tamil voice, see feature #9).
- The translation dictionary in [`frontend/js/i18n.js`](frontend/js/i18n.js) is structured to add more languages by extending the same key set — Hindi, Telugu, Marathi, and Kannada are on the roadmap but not implemented yet.

### 11. 📄 Automated Farmer Action Plan & Export
- One-click PDF generation of the complete **Farmer Soil Health Action Plan & 3-Season Restoration Roadmap**.
- Direct CSV and JSON dataset downloads for research and integration.

### 12. 🔐 Account System — Farmer & B2B Buyer Roles
- Real sign-up/login for two account types, with production-style security: **bcrypt** password hashing, **JWT** access tokens (short-lived) + rotating **httpOnly refresh cookies**, and rate limiting on auth endpoints.
- Signing up as a Farmer auto-provisions a starter farm tied to the account; signing up as a Buyer auto-fills their organization into every B2B contract/program they create afterward.
- Email verification is implemented end-to-end (token, expiry, resend) but currently in **dev mode**: since no SMTP/SendGrid key is wired up, the verification link is returned directly in the API response instead of emailed — see [Account System](#-account-system--authentication) for how to wire a real provider.

### 13. 🏢 B2B Enterprise & Corporate Sourcing Hub
A second application mode for corporate buyers and Farmer Producer Organizations (FPOs), reachable via the sidebar's Farmer Mode / B2B Enterprise switch:
- **Executive dashboard**: fleet-wide acreage, FPO/farmer counts, active contracts, and ESG summary in one view.
- **AI Procurement Matchmaker**: describe a sourcing need in plain language ("I need 200 MT of organic tomatoes from Tamil Nadu…") and get a matched FPO, matched farms, and a Gemini-written explanation grounded in the real computed numbers — updates live as you type, detailed in feature #14 below.
- **Forward procurement contracts**: create, list, and export signed-contract PDFs with regenerative-agriculture price bonuses.
- **Bulk input aggregator**: fleet-wide soil deficiency rollup driving wholesale bio-input procurement packages.
- **ESG & carbon registry**: carbon sequestration, synthetic-nitrogen avoidance, and water conservation KPIs with exportable certificates.
- **6-step institutional sourcing workflow**: Programs → Clusters → Baselines → Protocols → Escalations → Scorecard, for buyers running a full seasonal sourcing program rather than a one-off contract.

### 14. ⚡ AI-Based & Real-Time Matching
The B2B Contract Matchmaker is both AI-powered and live:
- **AI-based**: free-text sourcing requests are parsed by Gemini into structured filters (crop, quantity, preferred state); if Gemini is unavailable or rate-limited, a deterministic keyword-scan fallback keeps it working. The match explanation is generated *after* the real numbers are computed and fed back to Gemini as grounding data, so it narrates real figures rather than inventing them.
- **Real-time**: matching updates live as you type (debounced ~900ms) — no button click needed — and the result panel silently re-checks every 15 seconds while open, flashing a "🔄 Live-updated" badge if the underlying match actually changes.

### 15. 🔌 ESP32 Live Soil Sensor Integration
- A device-authenticated ingestion endpoint (`X-Device-Key` header, independent of the user JWT system) accepts real-time sensor readings from a physical ESP32, supporting two device types on the same endpoint: a full 7-in-1 RS485 soil sensor (NPK/pH/organic-carbon) and a simpler DHT11 + analog soil-moisture/TDS probe (air temperature, air humidity, soil moisture, TDS — no nutrient capability). Whichever fields a given device doesn't report are carried over from the farm's last known reading, so an env-only device never blanks out an existing soil test.
- The Soil Analysis page's **Live Sensor mode** polls every 4 seconds, shows connection state (🟢 live, 🟡 signal lost, or 🔴 never connected), and displays air temperature / air humidity / soil moisture / TDS as supplementary tiles alongside the NPK/pH sliders.
- Two reference Arduino sketches — [`esp32/soil_sensor_client.ino`](esp32/soil_sensor_client.ino) (7-in-1 RS485) and [`esp32/dht11_soil_moisture_client.ino`](esp32/dht11_soil_moisture_client.ino) (DHT11 + soil moisture, also serves its own local debug webpage) — plus a Node.js simulator ([`backend/scripts/simulate_esp32.js`](backend/scripts/simulate_esp32.js), with an `--env` flag for the DHT11 variant) let you test the entire pipeline before any hardware is flashed.

### 16. 🎨 Modern Responsive "Midnight Harvest" Design System
- Dark theme (near-black base, emerald/indigo/violet/gold accents) with layered card depth, per-nutrient color coding on the Soil Analysis page, and glassmorphism throughout.
- Fully responsive: sidebar collapses to a mobile drawer, a bottom tab bar and top bar appear under 768px, and every grid reflows to a single column on narrow screens.

---

## 🏗️ Architecture

```
[ Frontend: Vanilla JS SPA + Glassmorphism UI + Chart.js + i18n ]
                              │
                    REST API Calls (JWT Bearer + httpOnly refresh cookie)
                              ▼
[ Backend: Node.js Express Server ]
        │
        ├── /api/soil-analysis, /api/crop-history, /api/crop-evaluation,      ──┐
        │   /api/optimize-rotation, /api/soil-simulation, /api/recommendation,  │  Farmer-facing
        │   /api/dashboard, /api/gps-zones, /api/report                        │  agronomy engine
        │                                                                    ──┘
        ├── /api/soil-sensor  ──── X-Device-Key auth ──── [ ESP32 + 7-in-1 RS485 sensor ]
        ├── /api/auth         ──── JWT + bcrypt ────────  Farmer & Buyer accounts
        ├── /api/b2b          ──── AI Matchmaker ───────  [ Google Gemini AI API ]
        ├── /api/chat         ─────────────────────────►  [ Google Gemini AI API ]
        ├── /api/weather      ─────────────────────────►  [ Open-Meteo / OpenWeather API ]
        │
        └── [ Supabase Cloud PostgreSQL ] ── or ── [ In-Memory Seed Fallback ]
```

Every external dependency (Supabase, Gemini, OpenWeather) is optional — the app detects missing configuration at boot and transparently falls back to in-memory data / rule-based logic / keyword matching, so it runs fully offline for a demo.

### Entity Relationship Model

```
users (farmer | buyer) ──< farmers ──< farms ──< soil_data ◄── ESP32 ingestion
                                            ├──< crop_history
                                            ├──< weather_data
                                            ├──< crop_evaluations >── crops (60 Master Crops)
                                            ├──< rotation_plans ──< rotation_plan_seasons >── crops
                                            ├──< soil_simulation_log
                                            └──< recommendations

users (buyer) ──< corporate_buyers ──< b2b_contracts >── fpos ──< farms
                                    ├──< b2b_programs ──< b2b_clusters ──< b2b_escalations
                                    └──< input_suppliers
```

### Supported Crops (60 Master Crops)
`Apple · Arecanut · Arhar/Tur · Bajra · Banana · Barley · Blackgram (Urad) · Cabbage · Cardamom · Carrot · Cashewnut · Castor Seed · Cauliflower · Chickpea · Chilli · Coconut · Coffee · Coriander · Cotton · Cowpea (Lobia) · Cumin · Drumstick · Dry Chillies · Garlic · Ginger · Grapes · Green Gram (Moong) · Groundnut · Guava · Horsegram · Jowar · Jute · Kidneybeans (Rajma) · Lentil (Masoor) · Linseed · Maize · Mango · Mothbeans · Mustard · Niger Seed · Nutmeg · Onion · Orange · Papaya · Pepper (Black) · Pigeonpeas · Pomegranate · Potato · Ragi (Finger Millet) · Rice · Rubber · Safflower · Sesame · Soybean · Sugarcane · Sunflower · Tapioca · Tea · Tomato · Turmeric · Watermelon · Wheat`

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vanilla JS (no framework), Chart.js, custom i18n | SPA routing, dashboards, charts, English/Tamil UI |
| Backend | Node.js, Express | REST API server |
| Database | Supabase (PostgreSQL) | Primary persistence — falls back to an in-memory store automatically when unset |
| Auth | `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `express-rate-limit` | Password hashing, JWT access/refresh tokens, rate-limited auth endpoints |
| AI | `@google/generative-ai` (Gemini) | Kisan chatbot replies, B2B free-text parsing, grounded match reasoning |
| Weather | Open-Meteo, OpenWeather | Live conditions, 7-day forecast, location search |
| IoT | ESP32 (Arduino/C++), `ModbusMaster`, `ArduinoJson` | Live soil sensor firmware talking to `/api/soil-sensor/ingest` |
| Deployment | Netlify Functions (`serverless-http`) | Serverless deployment of the Express app + static frontend |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended — native `fetch` is used by the ESP32 simulator)
- Python 3.8+ (for data pipelines & the Python test suites)
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
Copy the example file:
```bash
cp .env.example .env
```
Every value in `backend/.env.example` is documented inline and **optional** — see [Environment Variables](#-environment-variables) below for exactly what each one unlocks. At minimum, set the two JWT secrets if you want to use account creation/login:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Run that twice and paste the results into `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

### 4. (Optional) Sync with Supabase Cloud Database
1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL Editor**, run the schema found in [`supabase/schema.sql`](supabase/schema.sql) — this includes the core agronomy tables *and* the `users` table for account persistence.
3. Populate the database with 60 crops and seed farms:
   ```bash
   cd backend
   npm run db:sync
   ```
If you skip this step entirely, the app runs identically on in-memory data — accounts and soil readings just won't survive a server restart.

### 5. Start the Application Server
```bash
cd backend
npm start
```
Open **`http://localhost:3000`** in your browser to access the complete application. Run it from the `backend/` directory (or via `npm start` from the repo root, which does this for you) — the server resolves `.env` relative to its own file location either way.

### 6. (Optional) Simulate a Live ESP32 Soil Sensor
No hardware required to see the Live Sensor feature working:
```bash
cd backend
npm run sim:esp32          # defaults to farm_id 101
npm run sim:esp32 -- 105   # or target a specific farm
```
Then open the app → **Soil Analysis** → toggle **🔌 Live Sensor (ESP32)**.

### 7. Run Automated End-to-End API Test Suites
```bash
python test_all_apis.py      # core agronomy engine
python test_b2b_apis.py      # B2B Enterprise Hub
```

---

## 🔐 Account System & Authentication

Two roles, one login modal (reachable from the sidebar's "Sign Up / Log In" button, or the B2B Hub header):

| | Farmer | B2B Buyer |
|---|---|---|
| Sign-up fields | Name, email, phone, password | Organization name, contact person, email, phone, password |
| On sign-up | Gets a starter farm auto-created and linked | Their org auto-fills into every contract/program they create |
| Where it shows up | Dashboard, Soil Analysis, Crop History, Evaluation, Rotation, Recommendation, Weather all personalize to `state.farm_id` | B2B Hub header shows "✓ Signed in as `<org name>`" instead of a buyer picker |

**Session mechanics**: a short-lived JWT access token lives in memory on the client and is sent as `Authorization: Bearer …`; a long-lived refresh token lives in an `httpOnly` cookie the client never touches directly. On page load, the client attempts one silent refresh so a logged-in user doesn't have to re-enter credentials after closing the tab. On any `401`, the client retries once after a silent refresh before giving up.

**Email verification (dev mode)**: registering or requesting a resend returns `verification_link` directly in the JSON response and logs it to the server console, instead of emailing it — there's no SMTP/SendGrid integration wired up yet. To make this production-ready, replace the `console.log` in [`backend/routes/auth.js`](backend/routes/auth.js) with a real email send and drop `verification_link` from the response.

**Where accounts live**: `backend/routes/auth.js` tries Supabase first (table: `users`, see `supabase/schema.sql`) and falls back to an in-memory array if Supabase isn't configured or the table doesn't exist yet — same dual-mode pattern used everywhere else in this app. Run the migration (step 4 above) if you want accounts to survive a server restart.

---

## 🔌 ESP32 Live Soil Sensor Integration

### Supported Hardware Configurations

#### Option A: 7-in-1 RS485 Modbus Soil Sensor (N, P, K, pH, Moisture, Temp, EC)
* **Firmware Sketch:** [`esp32/soil_sensor_client.ino`](esp32/soil_sensor_client.ino)
* **Wiring Table:**
  | Sensor / Module Pin | ESP32 Pin | Description / Notes |
  |---|---|---|
  | MAX485 DI | GPIO 17 (TX2) | Serial Transmit |
  | MAX485 RO | GPIO 16 (RX2) | Serial Receive |
  | MAX485 DE + RE | GPIO 4 | Direction control (tied together) |
  | MAX485 VCC & GND | 3.3V / 5V & GND | Module power |
  | Sensor RS485 A & B | MAX485 A & B | Modbus differential pair |
  | Sensor Power (VCC/GND)| External 12V DC | *Do not power 12V sensor directly from ESP32* |

#### Option B: DHT11 Air & Soil Moisture Station
* **Firmware Sketch:** [`esp32/dht11_soil_moisture_client.ino`](esp32/dht11_soil_moisture_client.ino)
* **Wiring Table:**
  | Component | ESP32 Pin | Notes |
  |---|---|---|
  | DHT11 VCC / GND | 3.3V & GND | Power supply |
  | DHT11 DATA | GPIO 4 | Digital data pin with pull-up |
  | Soil Moisture Sensor AO | GPIO 34 | Analog input (ADC1) |
  | Soil Moisture Sensor VCC / GND | 3.3V & GND | Power supply |
  | TDS Sensor AO | GPIO 35 | Analog input (ADC1); measures a water sample (e.g. irrigation water or a soil-water extract), temperature-compensated using the DHT11 reading |
  | TDS Sensor VCC / GND | 3.3V & GND | Power supply |

### Direct HTTP / cURL Ingestion Test
You can test the endpoint directly from PowerShell or terminal:

```bash
curl -X POST http://localhost:3000/api/soil-sensor/ingest \
  -H "Content-Type: application/json" \
  -H "X-Device-Key: b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc" \
  -d '{
    "farm_id": 101,
    "device_id": "esp32-field-01",
    "nitrogen": 65,
    "phosphorus": 35,
    "potassium": 75,
    "ph": 6.8,
    "organic_carbon": 0.75,
    "air_temperature": 28.5,
    "air_humidity": 62,
    "soil_moisture": 48,
    "tds": 340
  }'
```

Both device types can post for the **same farm_id** — the app merges them into one live view (nutrient sliders from whichever device/entry last reported them, env tiles from whichever device last reported those).

> [!NOTE]
> The 7-in-1 RS485 sensor does not measure organic carbon directly — its sketch estimates it from conductivity + moisture as a rough proxy. Swap in a lab-grade OC sensor or manual override if required.

---

## 🔌 API Reference

### Core Agronomy Engine
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and database connection status |
| `GET` | `/api/db-status` | Whether Supabase is configured, with setup instructions if not |
| `GET` | `/api/crops` | 60 master crops with empirical agronomic statistics & prices |
| `GET` | `/api/farms` | List registered farm profiles and land characteristics |
| `GET` | `/api/farmers` | List registered farmer profiles |
| `GET` | `/api/seasons` | Agricultural season definitions (Kharif, Rabi, Zaid) |
| `POST` / `GET` | `/api/soil-analysis` | Computes/retrieves soil health score (0–100), deficits & fertilizer dosages |
| `POST` / `GET` | `/api/crop-history` | Analyzes monoculture patterns and applies rotation penalties |
| `GET` | `/api/candidate-crops` | Filters compatible crops by season, soil, water, and crop family |
| `POST` | `/api/crop-evaluation` | Computes 7-dimensional scores, rankings, and projected profits |
| `POST` | `/api/optimize-rotation` | Generates 3 multi-season rotation plans (A, B, C) |
| `POST` | `/api/soil-simulation` | Computes season-by-season nutrient recovery trajectories |
| `GET` | `/api/recommendation` | Returns top recommended crop, optimal rotation sequence & rationale |
| `GET` | `/api/dashboard` | Aggregated farm state, soil radar data, alerts & KPIs |
| `GET` | `/api/weather` | Live weather observations, 7-day forecast & agricultural advisories |
| `GET` | `/api/weather/search` | Search any city/district to switch the active farm location |
| `GET` / `POST` | `/api/gps-zones` | Retrieve / analyze GPS-based precision micro-zones |
| `POST` | `/api/chat` | Kisan AI conversational agronomy advisor (Gemini + offline fallback) |
| `GET` | `/api/report` | Structured comprehensive farm summary report |
| `GET` | `/download/farmer-plan-pdf` | Downloadable Farmer Action Plan PDF |
| `GET` | `/download/crops-csv` | Downloadable Master 60 Crops Agronomy & Mandi CSV |
| `GET` | `/download/crops-json` | Downloadable Master 60 Crops Agronomy & Mandi JSON |

### Account System
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a Farmer or Buyer account (rate-limited) |
| `POST` | `/api/auth/login` | Log in, receive an access token + refresh cookie (rate-limited) |
| `POST` | `/api/auth/refresh` | Rotate the refresh cookie, issue a new access token |
| `POST` | `/api/auth/logout` | Clear the refresh cookie |
| `GET` | `/api/auth/verify-email?token=…` | Verify an email address |
| `POST` | `/api/auth/resend-verification` | Regenerate and resend (dev mode: return) a verification link |
| `GET` | `/api/auth/me` | Get the current authenticated user's profile |

### ESP32 Live Soil Sensor
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/soil-sensor/ingest` | Device-authenticated (`X-Device-Key`) sensor reading submission — full NPK/pH/OC, env-only (air_temperature/air_humidity/soil_moisture/tds), or both |
| `GET` | `/api/soil-sensor/latest?farm_id=…` | Poll target: latest reading + connected/stale status |

### B2B Enterprise & Corporate Sourcing Hub
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/b2b/overview` | Executive fleet dashboard: acreage, farmers, contracts, ESG summary |
| `GET` | `/api/b2b/fpos` | List FPO member collectives |
| `GET` | `/api/b2b/buyers` | List corporate sourcing partners |
| `GET` / `POST` | `/api/b2b/contracts` | List / issue forward procurement contracts |
| `GET` | `/api/b2b/procurement-forecast` | Fleet-wide harvest yield projections |
| `POST` | `/api/b2b/match-contract` | AI/keyword-based procurement matchmaker (live-as-you-type capable) |
| `GET` | `/api/b2b/input-demand` | Fleet soil-deficiency rollup driving bulk input packages |
| `GET` | `/api/b2b/esg-metrics` | Carbon sequestration, synthetic-N avoidance, water conservation KPIs |
| `GET` / `POST` | `/api/b2b/programs` | List / define institutional sourcing programs (Step 1) |
| `GET` | `/api/b2b/clusters` | Production clusters & coverage (Step 2) |
| `GET` | `/api/b2b/baselines` | Baseline assessment indicators (Step 3) |
| `GET` | `/api/b2b/protocols` | Region-specific agronomic protocols (Step 4) |
| `GET` / `POST` | `/api/b2b/escalations` | List / log field incident tickets (Step 6) |
| `GET` | `/api/b2b/scorecard` | 7-pillar KPI scorecard |

---

## ⚙️ Environment Variables

Every variable is optional; the app tells you at boot what's missing and what fallback it's using. Full descriptions live in [`backend/.env.example`](backend/.env.example).

| Variable | Unlocks | Fallback if unset |
|---|---|---|
| `PORT` | Server port | `3000` |
| `SUPABASE_URL` / `SUPABASE_KEY` | Persistent PostgreSQL storage | In-memory data (resets on restart) |
| `GEMINI_API_KEY` | AI chatbot replies, B2B free-text parsing & match reasoning | Rule-based chatbot; keyword-scan B2B matching |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Account creation & login sessions | An ephemeral secret generated at boot — **all sessions invalidate on every server restart** |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | Token lifetimes | `15m` / `30d` |
| `ESP32_DEVICE_KEY` | Accepting live sensor readings | `/api/soil-sensor/ingest` returns `503` until set |

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── data/
│   │   ├── kaggle_crops.js        # Merged dataset model (782,374 rows, 60 crops)
│   │   └── seed.js                # Master agronomy DB, B2B fleet data, users, live sensor status
│   ├── db/
│   │   └── supabase.js            # Supabase Cloud client with seamless in-memory fallback
│   ├── middleware/
│   │   └── requireAuth.js         # JWT verification (required / optional variants)
│   ├── routes/
│   │   ├── auth.js                # Account creation, login, refresh, email verification
│   │   ├── b2b.js                 # B2B Enterprise Hub — contracts, AI matchmaker, ESG, programs
│   │   ├── candidateCrops.js      # Candidate generation & family filtering
│   │   ├── chat.js                # Kisan AI chatbot route (Gemini + local engine)
│   │   ├── cropEvaluation.js      # 7-Dimensional crop evaluation engine
│   │   ├── cropHistory.js         # Monoculture penalty & history analyzer
│   │   ├── dashboard.js           # Farm overview aggregator
│   │   ├── gpsZones.js            # GPS precision micro-zone allocation & spatial analysis
│   │   ├── optimizeRotation.js    # Multi-season rotation planning optimizer
│   │   ├── recommendation.js      # Final agronomic recommendations
│   │   ├── report.js              # Agronomic report generator
│   │   ├── soilAnalysis.js        # Soil deficit & fertilizer calculator
│   │   ├── soilSensor.js          # ESP32 device-authenticated ingestion + polling endpoint
│   │   ├── soilSimulation.js      # Nutrient recovery simulation model
│   │   └── weather.js             # Live weather, forecasts & location search
│   ├── scripts/
│   │   ├── clear_all_datasets.js  # Wipes Supabase tables for a clean re-seed
│   │   ├── simulate_esp32.js      # Poses as an ESP32, POSTs readings for testing without hardware
│   │   └── sync_to_supabase.js    # Syncs 60 crops and seed data to Supabase
│   ├── utils/
│   │   ├── auth.js                # bcrypt hashing, JWT signing/verification
│   │   └── soilScoring.js         # Shared soil-health scoring (manual entry + ESP32 use the same logic)
│   ├── server.js                  # Express application entry point
│   ├── package.json
│   └── .env.example
├── esp32/
│   ├── dht11_soil_moisture_client.ino   # ESP32 + DHT11 + Analog Soil Moisture probe firmware
│   └── soil_sensor_client.ino           # Reference Arduino firmware for 7-in-1 Modbus RS485 soil sensor
├── frontend/
│   ├── css/
│   │   └── style.css              # "Midnight Harvest" dark theme, responsive, per-nutrient colors
│   ├── js/
│   │   ├── app.js                 # SPA navigation, state manager, auth-aware API client
│   │   ├── auth.js                # Sign Up / Log In modal, session restore, account widget
│   │   ├── b2b.js                 # B2B Hub controller — tabs, AI matchmaker, live-updating results
│   │   ├── chatbot.js             # Kisan AI assistant widget with Tamil voice
│   │   ├── cropHistory.js         # Crop history & monoculture UI
│   │   ├── dashboard.js           # Overview, KPI cards, radar charts
│   │   ├── evaluation.js          # 7-D crop evaluation breakdown
│   │   ├── gpsZones.js            # GPS zone allocation UI
│   │   ├── i18n.js                # Multilingual translations (6 Indian languages)
│   │   ├── recommendation.js      # Top recommendations & rationale UI
│   │   ├── reportPdf.js           # Client-side PDF export generator
│   │   ├── rotation.js            # Multi-season plan comparisons
│   │   ├── simulation.js          # Interactive soil recovery timeline
│   │   ├── soilAnalysis.js        # Soil test input, NPK gauges, Manual/Live sensor toggle
│   │   └── weather.js             # Weather forecast & spray advisories
│   ├── _redirects                 # Netlify SPA fallback routing
│   └── index.html                 # Main single-page application shell
├── downloads/                     # Exportable PDF, CSV, and JSON assets
├── netlify/functions/api.js       # Netlify serverless wrapper around the Express app
├── supabase/
│   └── schema.sql                 # PostgreSQL tables, indexes & RLS schema (incl. `users`)
├── netlify.toml                   # Netlify build & redirect configuration
├── process_crop_dataset.py        # Python data processing pipeline
├── process_indian_crop_yield.py   # Crop yield integration script
├── generate_farmer_pdf.py         # Standalone PDF generation utility
├── test_all_apis.py               # Automated core-engine API test suite
├── test_b2b_apis.py               # Automated B2B Enterprise Hub API test suite
├── P025_database_and_backend_design.md
└── README.md
```

---

## 🚧 Known Limitations & Roadmap

- **Email delivery is dev-mode only** — verification links are returned in the API response, not emailed. Wire a real provider (SendGrid, SES, etc.) in `backend/routes/auth.js` before treating this as production auth.
- **Personalization doesn't reach every view** — the account system correctly ties Dashboard, Soil Analysis, Crop History, Evaluation, Rotation, Recommendation, and Weather to the logged-in farmer's own farm; GPS Zones and Soil Simulation still operate on a shared/demo dataset rather than per-farmer state.
- **ESP32 organic-carbon reading is an estimate**, not a direct measurement — see [ESP32 Live Soil Sensor Integration](#-esp32-live-soil-sensor-integration).
- **Real-time B2B matching re-parses free text on every poll** — if you're using the free-text AI matcher, a "Live-updated" badge can reflect the AI's non-deterministic re-interpretation of your text as much as an actual underlying data change.

---

## 👥 Authors & Repository

- **Repository**: [https://github.com/THICHANAMOORTHY/FARM-ROTATION](https://github.com/THICHANAMOORTHY/FARM-ROTATION)
- **Problem Statement**: P025 — Smart Crop Rotation & Soil Restorer (HACK-2K26)
- Built with ❤️ for sustainable agriculture and farmer empowerment across India.
