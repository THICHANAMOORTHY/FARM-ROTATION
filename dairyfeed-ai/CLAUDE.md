# CLAUDE.md — DairyFeed AI (SIH 26111)

Smart AI-Enabled Rapid Feed & Silage Quality Testing System for Dairy Farmers.
Ministry of Fisheries, Animal Husbandry & Dairying. Theme: Agriculture, FoodTech & Rural Development.

This file is the standing context for every session. Read it fully before doing anything.

---

## 1. What we are building

A portable device that screens silage on the farm, plus a web app that shows results and advice to farmers.

1. A sensor node (ESP32) measures pH, moisture, temperature, and color (TCS3200).
2. A camera node (ESP32-CAM) photographs the same sample.
3. Both send data to a FastAPI backend.
4. The backend scores the sample, predicts risk, and stores everything in Supabase (Postgres for data, Storage for images).
5. A React dashboard (English + Tamil) shows the result, history, and a simple farmer advisory.
6. If there's no internet, the devices queue data locally and sync later.

Full diagram and component roles: `docs/architecture.md`. Two points that must stay true:
- The **TCS3200 is on the sensor node ESP32**, not on the camera. The ESP32 gives the RGB colour
  data; the ESP32-CAM gives the image. The backend joins them by `sample_id`.
- **ML inputs (first version):** pH + moisture + temperature + RGB + silage image →
  quality score + spoilage/mould risk. While the dataset is being collected, mould risk stays
  `Unknown` until the images are labelled.

**Outputs for every test:**
- Quality: Good / Moderate / Poor
- Spoilage Risk: Low / Medium / High
- Mould Risk: Low / High
- Quality Score: 0–100
- Advisory text in English and Tamil

This is a **screening and decision-support tool**, not a lab test. The UI and advisories must never claim to confirm toxins, mycotoxins, or nutritional composition.

---

## 2. Repository layout

This project lives in the `dairyfeed-ai/` folder of the FARM-ROTATION repo. It is fully separate
from the crop-rotation app around it: do not import from, or change, files outside `dairyfeed-ai/`.

```
dairyfeed-ai/
├── CLAUDE.md
├── README.md
├── supabase/
│   └── schema.sql              # tables, indexes, RLS, storage bucket — run in the Supabase SQL editor
├── firmware/
│   ├── sensor-node/            # PlatformIO, board: esp32dev, framework: arduino
│   │   ├── include/pins.h
│   │   ├── include/config.h
│   │   ├── include/secrets.example.h   # secrets.h is gitignored
│   │   └── src/
│   └── cam-node/               # PlatformIO, board: esp32cam (AI-Thinker)
├── backend/                    # FastAPI, Python 3.11+
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py           # pydantic-settings, reads .env
│   │   ├── db.py               # Supabase repository + in-memory repository for tests
│   │   ├── models/             # Pydantic schemas
│   │   ├── routers/
│   │   ├── services/
│   │   │   ├── scoring.py      # rule-based score (always available)
│   │   │   ├── predictor.py    # loads ML models if present, falls back to rules
│   │   │   ├── image_analysis.py
│   │   │   └── advisory.py
│   │   └── scoring_config.yaml # all thresholds and weights live here
│   ├── tests/
│   └── requirements.txt
├── ml/
│   ├── data/                   # gitignored; exported datasets
│   ├── models/                 # versioned artifacts
│   ├── export_dataset.py
│   ├── train_tabular.py
│   ├── train_image.py
│   └── README.md
├── frontend/                   # React + Vite + Tailwind + Recharts + react-i18next
│   └── src/
│       ├── i18n/en.json
│       ├── i18n/ta.json
│       ├── pages/
│       └── components/
└── docs/
    ├── wiring.md
    ├── calibration.md
    └── api.md
```

---

## 3. Hardware (sensor node)

| Part | Purpose | Notes |
|---|---|---|
| ESP32 DevKit | Main controller | |
| pH module (e.g. PH-4502C) + glass probe | Fermentation indicator | Output can reach 5 V. Use a voltage divider or an ADS1115. |
| ADS1115 (recommended) | Clean 16-bit ADC for pH and moisture | I2C, shares the bus with the OLED |
| Capacitive moisture sensor v1.2 | Relative moisture | Must be calibrated against oven-dry dry matter |
| DS18B20 waterproof probe ×2 | Sample temperature + ambient | One 4.7 kΩ pull-up on the data line |
| TCS3200 | RGB color features | Must sit in a closed box with fixed white LED lighting |
| SSD1306 OLED 128×64 | Local display | I2C |
| Push button | Start test / menu | |
| Battery + regulator | Portable power | |

**Camera node:** ESP32-CAM (AI-Thinker) with microSD. Triggered by the sensor node over UART with the `sample_id`.

### Hard rules for firmware
- **Never use ADC2 pins (GPIO 0, 2, 4, 12–15, 25–27) for analog reads.** They stop working while Wi-Fi is on. Use ADC1 (GPIO 32–39) or the ADS1115.
- All pin numbers go in `pins.h`. Never hardcode them in logic files.
- Wi-Fi credentials, the backend URL, and the device API key go in `secrets.h`, which is gitignored. Provide `secrets.example.h`.
- Store calibration values in NVS (`Preferences`) so they survive reboot.
- When adding or changing wiring, update `docs/wiring.md` in the same change.

### Silage pH method (shown on the OLED as an instruction)
Mix about 25 g silage with about 100 mL distilled water, wait about 10 minutes, then dip the probe in the liquid. Do not push the probe into dry silage. Two-point calibration with pH 4.0 and pH 7.0 buffers.

---

## 4. Data model (Supabase)

The database is Supabase Postgres. The source of truth for the tables is `supabase/schema.sql`.

- Table `silage_samples`: one row per test. The nested JSON below is the **API shape**. In the
  table, the fields are flat columns (`ph`, `moisture_pct`, `rgb_r`, `quality`, `score`,
  `label_quality`, `is_simulated`, ...) so they are easy to filter. Only `breakdown` is `jsonb`.
- Table `silage_devices`: one row per device (last seen, pending sync count).
- Every table name starts with `silage_` so it never clashes with the FARM-ROTATION tables
  in the same Supabase project.
- RLS is on with no policies, so only the backend (service-role key) can read or write.
  The browser never talks to Supabase directly; it goes through the FastAPI backend.

API shape of one sample:

```json
{
  "sample_id": "DF01-20261002T103015-0007",
  "device_id": "DF01",
  "created_at": "ISO datetime (device time if NTP synced, else server time)",
  "time_source": "ntp | server",
  "feed_type": "maize_silage | sorghum_silage | napier_silage | other",
  "farm_id": "optional string",
  "readings": {
    "ph": 4.2,
    "moisture_raw": 2150,
    "moisture_pct": 64.0,
    "sample_temp_c": 28.4,
    "ambient_temp_c": 27.1,
    "rgb": { "r": 112, "g": 98, "b": 41 }
  },
  "image": { "path": "storage path in bucket silage-images | null", "received_at": "datetime | null" },
  "prediction": {
    "quality": "Good | Moderate | Poor",
    "spoilage_risk": "Low | Medium | High",
    "mould_risk": "Low | High | Unknown",
    "score": 86,
    "method": "rules | ml",
    "model_version": "string | null",
    "breakdown": { "ph": 38, "moisture": 27, "temperature": 18, "visual": 3 }
  },
  "advisory": { "level": "ok | warn | danger", "en": "...", "ta": "..." },
  "label": {
    "quality": "Good | Moderate | Poor",
    "mould": "Low | High",
    "spoilage": "Low | Medium | High",
    "labelled_by": "name",
    "reference": "expert visual | lab report | ...",
    "labelled_at": "datetime"
  },
  "flags": { "simulated": false, "demo": false, "synced_from_offline": false }
}
```

Images are stored in the private Supabase Storage bucket `silage-images` as `<device_id>/<sample_id>.jpg`.
Indexes: `sample_id` (unique), `device_id + created_at`, and `label_quality`.

Readings and image can arrive in either order, so the reading columns are nullable: a row may
exist with only an image until the readings arrive.

---

## 5. API

All device endpoints require header `X-Device-Key`. Return JSON with clear error messages.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/silage/test` | Device sends readings → returns prediction + advisory |
| POST | `/api/silage/bulk` | Offline sync: list of readings, idempotent on `sample_id` |
| POST | `/api/image/analyze` | Multipart image + `sample_id` → stores image, updates mould risk |
| GET | `/api/silage/history` | Filter by device, farm, date range, feed type; paginated |
| GET | `/api/silage/{sample_id}` | Full sample detail |
| GET | `/api/silage/{sample_id}/image` | Stream the image |
| GET | `/api/advisory/{sample_id}` | Advisory only |
| POST | `/api/silage/{sample_id}/label` | Expert labelling (dashboard, simple admin token) |
| GET | `/api/stats/summary` | Counts by quality / risk, for dashboard cards |

Readings and images can arrive in either order. The prediction must be recomputed whenever either one arrives.

---

## 6. Scoring and prediction rules

- `scoring.py` implements a **rule-based score** that always works, even with zero training data.
- **Every threshold and weight lives in `scoring_config.yaml`**, never in code. Mark them as provisional and to be tuned during calibration.
- Starting values (provisional, to be tuned with expert input):
  - pH: best around 3.8–4.5; penalize above 4.8 strongly.
  - Moisture: best around 60–70%; penalize below 55% and above 75%.
  - Temperature: penalize when the sample is more than about 3 °C above ambient (sign of aerobic heating).
  - Visual: mould risk from the image lowers the score; if there is no image, mark mould risk as `Unknown` and do not invent a value.
  - Default weights: pH 40, moisture 30, temperature 20, visual 10.
- The rules don't use RGB, but RGB is always collected: it is an input feature for the ML model.
- `predictor.py` uses a trained ML model **only if** a model file exists and its metadata says it passed validation. Otherwise it uses rules. Always record `method` and `model_version`.
- Every response includes the score breakdown so the farmer and the judges can see why.

---

## 7. Data integrity rules (non-negotiable)

- **Never train a model on random or synthetic data.** Synthetic data is allowed only for unit tests and UI development, and must have `flags.simulated = true`.
- Demo data must have `flags.demo = true`.
- `export_dataset.py` must exclude any sample with `simulated` or `demo` set, and any sample without a `label`.
- Training scripts must refuse to train (with a clear message) if any class has fewer than a configurable minimum number of samples (default 15).
- Report per-class precision, recall, and a confusion matrix using stratified k-fold. Save metrics next to the model.

---

## 8. Advisory rules

- Three levels: `ok`, `warn`, `danger`. Generate both English and Tamil.
- Plain language, short sentences, practical actions (check storage seal, check moisture, remove the spoiled top layer, isolate the batch).
- `danger` must always say: do not feed until checked by a veterinarian or animal nutrition expert, or confirmed by a lab.
- Never claim the device detects aflatoxin, mycotoxins, protein, or fiber.
- Keep all advisory text in a template file so a Tamil speaker can review it. Flag Tamil strings for native review in a comment.

---

## 9. Frontend

- React + Vite + Tailwind + Recharts + react-i18next. Mobile-first: farmers will use phones.
- Language toggle EN / தமிழ் in the header, remembered in localStorage.
- Pages:
  - **Dashboard:** latest test card (big status color, score dial, three risk badges, advisory), summary stats.
  - **History:** filterable table + trend charts (pH, moisture, temperature, score over time).
  - **Sample detail:** all readings, image, score breakdown, advisory.
  - **Label (expert):** set labels for a sample, protected by a simple admin token.
  - **Devices:** last seen, last reading, pending sync count if reported.
- Show "Rule-based" vs "AI model vN" on each result.
- Show a standing footer note that this is a screening tool, not a lab test.

---

## 10. Offline functionality

- Sensor node: if POST fails, append the reading as one JSON line to `/queue.jsonl` on LittleFS. Retry with exponential backoff. On reconnect, send in batches to `/api/silage/bulk` and delete only what the server confirms.
- Camera node: if upload fails, save the JPEG to microSD as `<sample_id>.jpg` and retry later.
- The OLED shows the local score using the same rule logic (ported to C++) so the farmer gets a result even offline. Keep the C++ thresholds in sync with `scoring_config.yaml` and note that in both files.

---

## 11. How to work in this repo

- Work **one phase at a time**. At the start of a phase, show a short plan and wait for my approval before writing code.
- After each phase: run tests or a build, tell me exactly what to run and what I should see, and suggest a git commit message.
- Ask before adding a major dependency.
- When something needs physical hardware to verify, say so clearly and give me a step-by-step bench test.
- Keep each module's README updated with setup and run commands.
- Use Python type hints, Pydantic v2, and `pytest`. All database access goes through `db.py`;
  tests use the in-memory repository and never need a real Supabase project. Use ESLint + Prettier on the frontend.
- Prefer simple, readable code over clever code. I'm a final-year ECE student and need to explain all of it to judges.
