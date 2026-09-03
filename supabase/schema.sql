-- ============================================================
-- CropSmart P025: Supabase Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Farmers
CREATE TABLE IF NOT EXISTS farmers (
    farmer_id       SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(150),
    preferred_lang  VARCHAR(20) DEFAULT 'en',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms
CREATE TABLE IF NOT EXISTS farms (
    farm_id         SERIAL PRIMARY KEY,
    farmer_id       INT REFERENCES farmers(farmer_id) ON DELETE CASCADE,
    location_name   VARCHAR(150),
    latitude        DECIMAL(9,6),
    longitude       DECIMAL(9,6),
    area_acres      DECIMAL(6,2) NOT NULL,
    irrigation_type VARCHAR(30) CHECK (irrigation_type IN
                        ('Rainfed','Low','Moderate','High','Drip','Canal')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seasons
CREATE TABLE IF NOT EXISTS seasons (
    season_id     SERIAL PRIMARY KEY,
    name          VARCHAR(20) UNIQUE NOT NULL,   -- Kharif, Rabi, Zaid
    start_month   INT,
    end_month     INT
);

-- 4. Crops Master Reference (enriched with Kaggle dataset attributes)
CREATE TABLE IF NOT EXISTS crops (
    crop_id              SERIAL PRIMARY KEY,
    name                 VARCHAR(80) UNIQUE NOT NULL,
    crop_family          VARCHAR(50),
    growth_duration_days INT,
    water_requirement    VARCHAR(20) CHECK (water_requirement IN ('Low','Medium','High')),
    ideal_ph_min         DECIMAL(3,1),
    ideal_ph_max         DECIMAL(3,1),
    n_demand             DECIMAL(6,2),
    p_demand             DECIMAL(6,2),
    k_demand             DECIMAL(6,2),
    is_nitrogen_fixer    BOOLEAN DEFAULT FALSE,
    avg_yield_per_acre   DECIMAL(10,2),
    avg_market_price     DECIMAL(10,2),
    avg_cultivation_cost DECIMAL(10,2),
    disease_risk_index   DECIMAL(5,2),
    suitable_seasons     JSONB,
    avg_temperature_c    DECIMAL(5,2),
    avg_humidity_pct     DECIMAL(5,2),
    avg_rainfall_mm      DECIMAL(7,2),
    preferred_soil_types JSONB,
    stats                JSONB,
    total_rows           INT,
    created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Soil Data
CREATE TABLE IF NOT EXISTS soil_data (
    soil_id             SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    recorded_date       DATE DEFAULT CURRENT_DATE,
    nitrogen            DECIMAL(6,2),
    phosphorus          DECIMAL(6,2),
    potassium           DECIMAL(6,2),
    ph                  DECIMAL(3,1),
    organic_carbon      DECIMAL(4,2),
    soil_health_score   DECIMAL(5,2),
    deficiencies        JSONB,
    adequate            JSONB,
    source              VARCHAR(30) DEFAULT 'manual',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Weather Data
CREATE TABLE IF NOT EXISTS weather_data (
    weather_id               SERIAL PRIMARY KEY,
    farm_id                  INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    season_id                INT REFERENCES seasons(season_id),
    year                     INT,
    rainfall_mm              DECIMAL(7,2),
    avg_temp_c               DECIMAL(5,2),
    humidity_pct             DECIMAL(5,2),
    water_availability_index DECIMAL(5,2),
    created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Crop History
CREATE TABLE IF NOT EXISTS crop_history (
    history_id      SERIAL PRIMARY KEY,
    farm_id         INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    crop_id         INT REFERENCES crops(crop_id),
    season_id       INT REFERENCES seasons(season_id),
    year            INT,
    sequence_order  INT,
    yield_actual    DECIMAL(10,2),
    cost_actual     DECIMAL(10,2),
    revenue_actual  DECIMAL(10,2),
    profit_actual   DECIMAL(10,2),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Crop Evaluations
CREATE TABLE IF NOT EXISTS crop_evaluations (
    evaluation_id       SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    crop_id             INT REFERENCES crops(crop_id),
    run_id              UUID NOT NULL,
    soil_suitability    DECIMAL(5,2),
    season_suitability  DECIMAL(5,2),
    rotation_score      DECIMAL(5,2),
    water_score         DECIMAL(5,2),
    profit_score        DECIMAL(5,2),
    risk_score          DECIMAL(5,2),
    climate_score       DECIMAL(5,2),
    predicted_yield     DECIMAL(10,2),
    predicted_revenue   DECIMAL(10,2),
    predicted_cost      DECIMAL(10,2),
    predicted_profit    DECIMAL(10,2),
    final_score         DECIMAL(5,2),
    rank                INT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Rotation Plans
CREATE TABLE IF NOT EXISTS rotation_plans (
    plan_id                SERIAL PRIMARY KEY,
    farm_id                INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    run_id                 UUID NOT NULL,
    plan_label             VARCHAR(10),
    total_projected_profit DECIMAL(12,2),
    final_soil_health      DECIMAL(5,2),
    is_recommended         BOOLEAN DEFAULT FALSE,
    sequence               JSONB,
    seasonal_profit        JSONB,
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Rotation Plan Seasons
CREATE TABLE IF NOT EXISTS rotation_plan_seasons (
    plan_season_id      SERIAL PRIMARY KEY,
    plan_id             INT REFERENCES rotation_plans(plan_id) ON DELETE CASCADE,
    season_order        INT,
    crop_id             INT REFERENCES crops(crop_id),
    expected_profit     DECIMAL(10,2),
    soil_health_before  DECIMAL(5,2),
    soil_health_after   DECIMAL(5,2)
);

-- 11. Soil Simulation Log
CREATE TABLE IF NOT EXISTS soil_simulation_log (
    sim_id                SERIAL PRIMARY KEY,
    plan_id               INT REFERENCES rotation_plans(plan_id) ON DELETE CASCADE,
    season_order          INT,
    predicted_n           VARCHAR(20),
    predicted_p           VARCHAR(20),
    predicted_k           VARCHAR(20),
    predicted_oc          VARCHAR(20),
    predicted_soil_health DECIMAL(5,2),
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id   SERIAL PRIMARY KEY,
    farm_id             INT REFERENCES farms(farm_id) ON DELETE CASCADE,
    plan_id             INT REFERENCES rotation_plans(plan_id),
    recommended_crop_id INT REFERENCES crops(crop_id),
    final_score         DECIMAL(5,2),
    reasoning           JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_soil_farm ON soil_data(farm_id, recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_history_farm_seq ON crop_history(farm_id, sequence_order DESC);
CREATE INDEX IF NOT EXISTS idx_eval_run ON crop_evaluations(run_id, final_score DESC);
CREATE INDEX IF NOT EXISTS idx_plan_farm ON rotation_plans(farm_id, is_recommended);
CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(name);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security (RLS) & Development Policies
-- ─────────────────────────────────────────────────────────────
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation_plan_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE soil_simulation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for app access (or tighten per user with Supabase Auth)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('farmers','farms','crops','soil_data','seasons','weather_data',
                             'crop_history','crop_evaluations','rotation_plans',
                             'rotation_plan_seasons','soil_simulation_log','recommendations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
