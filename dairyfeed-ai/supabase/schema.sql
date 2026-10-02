-- ============================================================
-- DairyFeed AI (SIH 26111) — Supabase schema
-- Run this whole file once in Supabase: SQL Editor -> New query -> Run.
-- Safe to run again: every statement is "if not exists" / "on conflict do nothing".
--
-- All tables start with "silage_" so they never clash with the
-- FARM-ROTATION tables that may live in the same Supabase project.
-- ============================================================

-- 1. Devices (sensor nodes). Updated every time a device sends data.
create table if not exists silage_devices (
    device_id        text primary key,               -- e.g. 'DF01'
    name             text,
    last_seen_at     timestamptz,
    pending_sync     integer not null default 0,     -- queued readings the device reports
    created_at       timestamptz not null default now()
);

-- 2. Samples: one row per silage test.
-- The API returns these as nested JSON (see CLAUDE.md section 4); here they are flat columns
-- so they are easy to filter and chart.
create table if not exists silage_samples (
    id                   bigint generated always as identity primary key,
    sample_id            text not null unique,        -- e.g. 'DF01-20261002T103015-0007'
    device_id            text not null,
    created_at           timestamptz not null default now(),
    time_source          text not null default 'server'
                         check (time_source in ('ntp', 'server')),
    feed_type            text not null default 'other'
                         check (feed_type in ('maize_silage', 'sorghum_silage', 'napier_silage', 'other')),
    farm_id              text,

    -- Readings (nullable: the image may arrive before the readings)
    ph                   numeric(4, 2) check (ph between 0 and 14),
    moisture_raw         integer,
    moisture_pct         numeric(5, 2) check (moisture_pct between 0 and 100),
    sample_temp_c        numeric(5, 2),
    ambient_temp_c       numeric(5, 2),
    rgb_r                smallint check (rgb_r between 0 and 255),
    rgb_g                smallint check (rgb_g between 0 and 255),
    rgb_b                smallint check (rgb_b between 0 and 255),

    -- Image (stored in Supabase Storage bucket 'silage-images')
    image_path           text,
    image_received_at    timestamptz,

    -- Prediction (recomputed whenever readings or image arrive)
    quality              text check (quality in ('Good', 'Moderate', 'Poor')),
    spoilage_risk        text check (spoilage_risk in ('Low', 'Medium', 'High')),
    mould_risk           text check (mould_risk in ('Low', 'High', 'Unknown')),
    score                smallint check (score between 0 and 100),
    method               text check (method in ('rules', 'ml')),
    model_version        text,
    breakdown            jsonb,                       -- {"ph": 38, "moisture": 27, ...}

    -- Advisory
    advisory_level       text check (advisory_level in ('ok', 'warn', 'danger')),
    advisory_en          text,
    advisory_ta          text,

    -- Expert label (ground truth for ML training)
    label_quality        text check (label_quality in ('Good', 'Moderate', 'Poor')),
    label_mould          text check (label_mould in ('Low', 'High')),
    label_spoilage       text check (label_spoilage in ('Low', 'Medium', 'High')),
    labelled_by          text,
    label_reference      text,                        -- 'expert visual', 'lab report', ...
    labelled_at          timestamptz,

    -- Data integrity flags (CLAUDE.md section 7)
    is_simulated         boolean not null default false,
    is_demo              boolean not null default false,
    synced_from_offline  boolean not null default false
);

-- 2b. Added in Phase 7. "add column if not exists" also upgrades a database created earlier.
-- Which image model produced mould_risk (null = no model: mould_risk is Unknown).
alter table silage_samples add column if not exists mould_model_version text;

-- 3. Indexes (sample_id is already unique-indexed by the constraint above)
create index if not exists silage_samples_device_time_idx
    on silage_samples (device_id, created_at desc);
create index if not exists silage_samples_label_quality_idx
    on silage_samples (label_quality);

-- 4. Row Level Security: on, with no policies.
-- Only the backend, using the service-role key, can read or write.
-- The anon key (which could leak from a browser) gets nothing.
alter table silage_devices enable row level security;
alter table silage_samples enable row level security;

-- 5. Private storage bucket for sample photos.
insert into storage.buckets (id, name, public)
values ('silage-images', 'silage-images', false)
on conflict (id) do nothing;
