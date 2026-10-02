# DairyFeed AI — Rapid Feed & Silage Quality Testing (SIH 26111)

A portable device that screens silage on the farm, and a web app that shows the result and
simple advice to dairy farmers in English and Tamil.

> **Screening tool, not a lab test.** DairyFeed AI gives a quick on-farm quality and risk
> estimate. It does not detect toxins, mycotoxins, protein or fibre.

## How it works

```
 ESP32 sensor node ── pH, moisture, temperature, colour ──┐
        │ UART (sample_id)                                 ├──► FastAPI backend ──► Supabase
 ESP32-CAM node ───── photo of the same sample ───────────┘      (score, risk,       (Postgres +
                                                                  advisory)            Storage)
                                                                     │
                                                    React dashboard (EN / தமிழ்) ◄┘
```

Every test returns: **Quality** (Good / Moderate / Poor), **Spoilage risk** (Low / Medium / High),
**Mould risk** (Low / High / Unknown), a **score** from 0 to 100 with its breakdown, and an
advisory in English and Tamil. If there is no internet, the devices queue data and sync later.

## Folders

| Folder | What's in it |
|---|---|
| `supabase/` | `schema.sql`: database tables, indexes, security and image bucket |
| `firmware/sensor-node/` | ESP32 sensor node (PlatformIO) |
| `firmware/cam-node/` | ESP32-CAM camera node (PlatformIO) |
| `backend/` | FastAPI API, scoring, prediction, advisories |
| `ml/` | Dataset export and model training |
| `frontend/` | React dashboard |
| `docs/` | Wiring, calibration, API reference |

Each folder has its own README with setup and run commands.

## Setting up the database (once)

1. Create a project at [supabase.com](https://supabase.com), or reuse the FARM-ROTATION one.
   All tables here start with `silage_`, so they don't clash.
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and click **Run**.
3. Check **Table Editor**: you should see `silage_devices` and `silage_samples`.
   Check **Storage**: you should see a private bucket called `silage-images`.
4. Copy the **Project URL** and the **service_role** key from **Project Settings → API** into
   `backend/.env` (see `backend/.env.example`). Keep the service_role key on the server only.

## Build status

| Phase | Scope | Status |
|---|---|---|
| 0 | Project structure, database schema, config examples | Done |
| 1 | Backend core: scoring, advisory, `/api/silage/test` | Done |
| 2 | Rest of the API | Not started |
| 3 | Sensor node firmware | Not started |
| 4 | Offline queue and on-device scoring | Not started |
| 5 | Camera node firmware | Not started |
| 6 | Frontend dashboard | Not started |
| 7 | ML pipeline | Not started |
| 8 | Docs | Not started |

This folder is separate from the UZHAVU KAAPPAAN crop-rotation app in the rest of the repository.
