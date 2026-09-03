# P025 — Smart Crop Rotation & Soil Restorer
## Complete Database Schema + Backend Data Structures

This document gives you a full relational schema (PostgreSQL syntax, easily portable to MySQL) plus the JSON data contracts for every backend API in the workflow.

---

## 1. Entity Overview

```
farmers ──< farms ──< soil_data
                  ├──< crop_history
                  ├──< weather_data
                  ├──< crop_evaluations >── crops
                  ├──< rotation_plans ──< rotation_plan_seasons >── crops
                  ├──< soil_simulation_log
                  └──< recommendations
crops ──< crop_nutrient_requirements
seasons ──< weather_data / crop_evaluations
```

---

## 2. Core Tables

### 2.1 `farmers`
```sql
CREATE TABLE farmers (
    farmer_id       SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(150),
    preferred_lang  VARCHAR(20) DEFAULT 'en',
    created_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.2 `farms`
```sql
CREATE TABLE farms (
    farm_id         SERIAL PRIMARY KEY,
    farmer_id       INT REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    location_name   VARCHAR(150),          -- e.g. "Coimbatore"
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    area_acres      DECIMAL(6,2) NOT NULL,
    irrigation_type VARCHAR(30) CHECK (irrigation_type IN
                        ('Rainfed','Low','Moderate','High','Drip','Canal')),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.3 `soil_data`
```sql
CREATE TABLE soil_data (
    soil_id             SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    recorded_date       DATE DEFAULT CURRENT_DATE,
    nitrogen            DECIMAL(6,2),   -- kg/ha
    phosphorus          DECIMAL(6,2),
    potassium           DECIMAL(6,2),
    ph                  DECIMAL(3,1),
    organic_carbon      DECIMAL(4,2),   -- %
    soil_health_score   DECIMAL(5,2),   -- 0-100, computed
    deficiencies        JSONB,          -- ["Low Nitrogen","Low Organic Carbon"]
    source              VARCHAR(30) DEFAULT 'manual' -- manual / lab_report / sensor
);
```

### 2.4 `crops` (master reference table)
```sql
CREATE TABLE crops (
    crop_id             SERIAL PRIMARY KEY,
    name                VARCHAR(80) UNIQUE NOT NULL,
    crop_family         VARCHAR(50),        -- Legume, Solanaceae, Cereal...
    growth_duration_days INT,
    water_requirement   VARCHAR(20) CHECK (water_requirement IN ('Low','Medium','High')),
    ideal_ph_min        DECIMAL(3,1),
    ideal_ph_max        DECIMAL(3,1),
    n_demand            DECIMAL(5,2),       -- kg/ha typical uptake
    p_demand            DECIMAL(5,2),
    k_demand            DECIMAL(5,2),
    is_nitrogen_fixer   BOOLEAN DEFAULT FALSE,
    avg_yield_per_acre  DECIMAL(8,2),       -- kg or quintal
    avg_market_price    DECIMAL(8,2),       -- ₹ per kg/quintal
    avg_cultivation_cost DECIMAL(10,2),     -- ₹ per acre
    disease_risk_index  DECIMAL(4,2),       -- 0-100
    suitable_seasons    JSONB               -- ["Kharif","Rabi"]
);
```

### 2.5 `seasons`
```sql
CREATE TABLE seasons (
    season_id     SERIAL PRIMARY KEY,
    name          VARCHAR(20) UNIQUE,   -- Kharif, Rabi, Zaid
    start_month   INT,
    end_month     INT
);
```

### 2.6 `weather_data`
```sql
CREATE TABLE weather_data (
    weather_id      SERIAL PRIMARY KEY,
    farm_id         INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    season_id       INT REFERENCES seasons(season_id),
    year            INT,
    rainfall_mm     DECIMAL(7,2),
    avg_temp_c      DECIMAL(5,2),
    humidity_pct    DECIMAL(5,2),
    water_availability_index DECIMAL(5,2)  -- 0-100, derived
);
```

### 2.7 `crop_history`
```sql
CREATE TABLE crop_history (
    history_id      SERIAL PRIMARY KEY,
    farm_id         INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    crop_id         INT REFERENCES crops(crop_id),
    season_id       INT REFERENCES seasons(season_id),
    year            INT,
    sequence_order  INT,             -- 1 = oldest ... n = most recent
    yield_actual    DECIMAL(10,2),
    cost_actual     DECIMAL(10,2),
    revenue_actual  DECIMAL(10,2),
    profit_actual   DECIMAL(10,2)
);
```

### 2.8 `crop_evaluations` (scoring engine output, per candidate crop per run)
```sql
CREATE TABLE crop_evaluations (
    evaluation_id       SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    crop_id             INT REFERENCES crops(crop_id),
    run_id              UUID NOT NULL,        -- groups all crops evaluated in one analysis run
    soil_suitability    DECIMAL(5,2),
    season_suitability  DECIMAL(5,2),
    rotation_score      DECIMAL(5,2),
    water_score         DECIMAL(5,2),
    profit_score        DECIMAL(5,2),
    risk_score          DECIMAL(5,2),
    predicted_yield     DECIMAL(10,2),
    predicted_revenue   DECIMAL(10,2),
    predicted_cost      DECIMAL(10,2),
    predicted_profit    DECIMAL(10,2),
    final_score         DECIMAL(5,2),
    rank                INT,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

### 2.9 `rotation_plans`
```sql
CREATE TABLE rotation_plans (
    plan_id             SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    run_id              UUID NOT NULL,
    plan_label          VARCHAR(10),          -- 'A','B','C'
    total_projected_profit DECIMAL(12,2),
    final_soil_health   DECIMAL(5,2),
    is_recommended      BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW()
);
```

### 2.10 `rotation_plan_seasons`
```sql
CREATE TABLE rotation_plan_seasons (
    plan_season_id      SERIAL PRIMARY KEY,
    plan_id             INT REFERENCES rotation_plans(plan_id) ON DELETE CASCADE,
    season_order        INT,           -- 1, 2, 3
    crop_id             INT REFERENCES crops(crop_id),
    expected_profit     DECIMAL(10,2),
    soil_health_before  DECIMAL(5,2),
    soil_health_after   DECIMAL(5,2)
);
```

### 2.11 `soil_simulation_log`
```sql
CREATE TABLE soil_simulation_log (
    sim_id          SERIAL PRIMARY KEY,
    plan_id         INT REFERENCES rotation_plans(plan_id) ON DELETE CASCADE,
    season_order    INT,
    predicted_n     VARCHAR(15),   -- Low / Medium / Improved / High
    predicted_p     VARCHAR(15),
    predicted_k     VARCHAR(15),
    predicted_oc    VARCHAR(15),
    predicted_soil_health DECIMAL(5,2)
);
```

### 2.12 `recommendations`
```sql
CREATE TABLE recommendations (
    recommendation_id   SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    plan_id             INT REFERENCES rotation_plans(plan_id),
    recommended_crop_id INT REFERENCES crops(crop_id),
    final_score         DECIMAL(5,2),
    reasoning           JSONB,        -- ["Improves nitrogen balance", ...]
    created_at          TIMESTAMP DEFAULT NOW()
);
```

### Indexes worth adding
```sql
CREATE INDEX idx_soil_farm ON soil_data(farm_id, recorded_date DESC);
CREATE INDEX idx_history_farm_seq ON crop_history(farm_id, sequence_order DESC);
CREATE INDEX idx_eval_run ON crop_evaluations(run_id, final_score DESC);
CREATE INDEX idx_plan_farm ON rotation_plans(farm_id, is_recommended);
```

---

## 3. Sample Seed Data

```sql
INSERT INTO seasons (name, start_month, end_month) VALUES
('Kharif', 6, 10), ('Rabi', 11, 3), ('Zaid', 4, 5);

INSERT INTO crops (name, crop_family, growth_duration_days, water_requirement,
    ideal_ph_min, ideal_ph_max, n_demand, p_demand, k_demand, is_nitrogen_fixer,
    avg_yield_per_acre, avg_market_price, avg_cultivation_cost, disease_risk_index, suitable_seasons)
VALUES
('Tomato','Solanaceae',110,'High',6.0,7.0,120,60,100,FALSE,9000,6,38000,55,'["Kharif","Rabi"]'),
('Green Gram','Legume',65,'Low',6.2,7.2,20,40,30,TRUE,600,85,10000,20,'["Kharif","Zaid"]'),
('Groundnut','Legume',110,'Medium',6.0,7.0,25,50,40,TRUE,1200,60,18000,30,'["Kharif","Rabi"]'),
('Maize','Cereal',95,'Medium',5.8,7.0,150,70,80,FALSE,2500,22,20000,35,'["Kharif","Rabi"]'),
('Black Gram','Legume',70,'Low',6.5,7.5,20,40,30,TRUE,550,90,9500,22,'["Kharif","Rabi"]'),
('Rice','Cereal',130,'High',5.5,6.5,140,60,60,FALSE,2800,20,25000,40,'["Kharif"]');
```

---

## 4. Backend API Data Contracts

Each endpoint from the technical workflow (`/soil-analysis`, `/crop-history`, `/candidate-crops`, `/crop-evaluation`, `/optimize-rotation`, `/soil-simulation`, `/recommendation`) with request/response JSON shapes.

### 4.1 `POST /soil-analysis`
**Request**
```json
{
  "farm_id": 101,
  "nitrogen": 42,
  "phosphorus": 28,
  "potassium": 55,
  "ph": 6.5,
  "organic_carbon": 0.52
}
```
**Response**
```json
{
  "soil_id": 5001,
  "soil_health_score": 58,
  "deficiencies": ["Low Nitrogen", "Low Organic Carbon"],
  "adequate": ["Potassium", "pH"]
}
```

### 4.2 `POST /crop-history`
**Request**
```json
{
  "farm_id": 101,
  "history": [
    {"crop": "Tomato", "season": "Kharif", "year": 2023, "yield": 8500, "cost": 36000, "revenue": 51000},
    {"crop": "Tomato", "season": "Rabi",   "year": 2024, "yield": 8800, "cost": 37000, "revenue": 49000},
    {"crop": "Tomato", "season": "Kharif", "year": 2025, "yield": 8200, "cost": 38000, "revenue": 47000}
  ]
}
```
**Response**
```json
{
  "rotation_issue": "Continuous cultivation",
  "nutrient_pressure": "High",
  "penalized_crop": "Tomato",
  "suitable_crop_families": ["Legume", "Cereal"]
}
```

### 4.3 `GET /candidate-crops?farm_id=101&season=Kharif`
**Response**
```json
{
  "run_id": "b1e2c9a0-...",
  "candidates": ["Green Gram", "Groundnut", "Maize", "Black Gram"],
  "excluded": [
    {"crop": "Rice", "reason": "Water availability mismatch"},
    {"crop": "Tomato", "reason": "Continuous cultivation penalty"}
  ]
}
```

### 4.4 `POST /crop-evaluation`
**Request**
```json
{
  "farm_id": 101,
  "run_id": "b1e2c9a0-...",
  "candidate_crop_ids": [2, 3, 4, 5]
}
```
**Response**
```json
{
  "run_id": "b1e2c9a0-...",
  "results": [
    {
      "crop": "Green Gram",
      "soil_suitability": 88,
      "rotation_score": 95,
      "profit_score": 78,
      "season_suitability": 92,
      "water_score": 90,
      "risk_score": 85,
      "predicted_yield": 600,
      "predicted_revenue": 48000,
      "predicted_cost": 19000,
      "predicted_profit": 29000,
      "final_score": 88.5,
      "rank": 1
    },
    {
      "crop": "Groundnut",
      "soil_suitability": 82,
      "rotation_score": 83,
      "profit_score": 84,
      "season_suitability": 90,
      "water_score": 76,
      "risk_score": 80,
      "predicted_profit": 27500,
      "final_score": 82.5,
      "rank": 2
    }
  ]
}
```

### 4.5 `POST /optimize-rotation`
**Request**
```json
{
  "farm_id": 101,
  "run_id": "b1e2c9a0-...",
  "horizon_seasons": 3
}
```
**Response**
```json
{
  "plans": [
    {
      "plan_label": "A",
      "sequence": ["Tomato", "Tomato", "Tomato"],
      "seasonal_profit": [32000, 28000, 25000],
      "total_profit": 85000,
      "final_soil_health": 41
    },
    {
      "plan_label": "B",
      "sequence": ["Tomato", "Green Gram", "Groundnut"],
      "seasonal_profit": [29000, 35000, 38000],
      "total_profit": 102000,
      "final_soil_health": 81,
      "is_recommended": true
    },
    {
      "plan_label": "C",
      "sequence": ["Tomato", "Groundnut", "Maize"],
      "seasonal_profit": [30000, 31000, 33000],
      "total_profit": 94000,
      "final_soil_health": 68
    }
  ]
}
```

### 4.6 `POST /soil-simulation`
**Request**
```json
{ "plan_id": 7001 }
```
**Response**
```json
{
  "plan_id": 7001,
  "timeline": [
    {"season": 0, "soil_health": 58, "n": "Low", "p": "Medium", "k": "High", "oc": "Low"},
    {"season": 1, "soil_health": 70, "n": "Improved", "p": "Medium", "k": "High", "oc": "Improved"},
    {"season": 2, "soil_health": 76, "n": "Improved", "p": "Improved", "k": "Medium", "oc": "Improved"},
    {"season": 3, "soil_health": 81, "n": "Good", "p": "Improved", "k": "Medium", "oc": "Good"}
  ]
}
```

### 4.7 `GET /recommendation?farm_id=101`
**Response**
```json
{
  "recommended_crop": "Green Gram",
  "score": 88.5,
  "expected_profit_per_acre": 29000,
  "rotation_plan": ["Tomato", "Green Gram", "Groundnut", "Tomato"],
  "soil_recovery": [58, 70, 76, 81],
  "projected_3_season_profit": 102000,
  "reasoning": [
    "Improves nitrogen balance",
    "Breaks repeated tomato cultivation",
    "Reduces expected input pressure",
    "Maintains strong profitability"
  ]
}
```

### 4.8 Dashboard aggregate — `GET /dashboard?farm_id=101`
```json
{
  "farm_health": 58,
  "soil_alerts": ["Low N", "Low Organic Carbon"],
  "recommended_crop": {"name": "Green Gram", "score": 88.5},
  "expected_profit_per_acre": 29000,
  "rotation_plan": ["Tomato", "Green Gram", "Groundnut", "Tomato"],
  "soil_recovery_curve": [58, 70, 76, 81],
  "water_requirement": "Low",
  "why_this_plan": [
    "Improves nitrogen balance",
    "Breaks repeated cultivation",
    "Suitable for current season",
    "Lower water requirement",
    "Good expected profitability"
  ]
}
```

---

## 5. Suggested Service Boundaries (matches the technical workflow diagram)

| Service | Reads | Writes |
|---|---|---|
| Soil Service | `soil_data` | `soil_data`, updates `soil_health_score` |
| History Service | `crop_history` | flags in-memory rotation issues |
| Candidate Service | `crops`, `weather_data`, `soil_data` | filtered candidate list (cache) |
| Evaluation Service | `crops`, `soil_data`, `crop_history`, `weather_data` | `crop_evaluations` |
| Optimizer Service | `crop_evaluations` | `rotation_plans`, `rotation_plan_seasons` |
| Simulation Service | `rotation_plan_seasons`, `soil_data` | `soil_simulation_log` |
| Recommendation Service | all above | `recommendations` |
| Dashboard/API Gateway | all above (read-only aggregation) | — |

This schema + contract set is enough to implement every box in your workflow diagram end-to-end: input → soil analysis → history analysis → candidate generation → scoring → multi-season optimization → simulation → recommendation → dashboard.
