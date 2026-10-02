# Backend — FastAPI

Receives readings and photos from the devices, scores each sample, writes an advisory,
and stores everything in Supabase.

**Status:** Phases 1–2 done: rule-based scoring, advisory, and every endpoint in `../docs/api.md`.

## Layout

| Path | Role |
|---|---|
| `app/main.py` | Creates the FastAPI app and includes the routers |
| `app/config.py` | Reads settings from `.env` |
| `app/db.py` | Supabase repository, plus an in-memory one for tests |
| `app/models/` | Pydantic request and response schemas |
| `app/routers/` | API endpoints (see `../docs/api.md`) |
| `app/services/scoring.py` | Rule-based score, always available |
| `app/services/predictor.py` | Uses the rules for now; a validated ML model from Phase 7 |
| `app/services/image_analysis.py` | Mould risk from the photo: `Unknown` until a validated model exists |
| `app/services/samples.py` | Stores readings and photos, recomputes the prediction |
| `app/security.py` | Checks the `X-Device-Key` and `X-Admin-Token` headers |
| `app/advisory_templates.yaml` | All advisory text, English and Tamil |
| `app/services/advisory.py` | English and Tamil advice from templates |
| `app/scoring_config.yaml` | Every threshold and weight |
| `tests/` | pytest tests, with no Supabase needed |

## Setup

```bash
cd dairyfeed-ai/backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then fill in the values
```

## Run the tests

```bash
pytest
```

The tests use in-memory storage, so they need no Supabase project and no `.env`.

## Run the server

```bash
uvicorn app.main:app --reload
```

- Interactive API docs: http://localhost:8000/docs
- `GET /api/health` returns `{"status": "ok", "database": "supabase"}`. If it says `"memory"`,
  `SUPABASE_URL` or `SUPABASE_SERVICE_KEY` is missing from `.env`, and data is lost on restart.

Send a test sample (use your `DEVICE_API_KEY` from `.env`):

```bash
curl -X POST http://localhost:8000/api/silage/test \
  -H "X-Device-Key: YOUR_DEVICE_API_KEY" -H "Content-Type: application/json" \
  -d '{"sample_id":"DF01-20261002T103015-0007","device_id":"DF01","feed_type":"maize_silage",
       "readings":{"ph":4.9,"moisture_pct":72,"sample_temp_c":31.5,"ambient_temp_c":27.1},
       "flags":{"simulated":true}}'
```

Expected: `quality` Moderate, `spoilage_risk` Medium, `mould_risk` Unknown, `score` 63,
`breakdown` `{"ph": 17, "moisture": 25, "temperature": 14, "visual": null}`, and a `warn` advisory.
With Supabase connected, the row appears in **Table Editor → silage_samples**.

## How the score works

1. Each reading is turned into a fraction from 0 to 1 using the curves in `scoring_config.yaml`
   (for example pH 3.8–4.5 gets 1.0, pH 4.8 gets 0.5, pH 5.5 or more gets 0).
2. Fraction × weight = points (pH 40, moisture 30, temperature 20, visual 10).
3. Score = points earned ÷ points available × 100. With no photo, visual is left out (shown as
   `null`), so the score is out of the remaining 90 points. Nothing is guessed.
4. Quality: 75+ Good, 50–74 Moderate, below 50 Poor. High spoilage risk caps it at Moderate;
   likely mould makes it Poor.
5. Spoilage risk: High if pH > 5.0 or the sample is more than 6 °C above the air;
   Medium if pH > 4.5 or more than 3 °C above; otherwise Low.

All of these numbers are provisional and live only in `scoring_config.yaml`.

## Tamil text

Every Tamil string in `app/advisory_templates.yaml` is marked `# TAMIL REVIEW NEEDED`. A native
speaker should check them before field use.

## Photos and mould risk

Photos are stored in the Supabase Storage bucket `silage-images`, but mould risk stays `Unknown`
for now. There is no trained image model yet, and a hand-made colour rule would not be reliable.
Experts label the stored photos, and Phase 7 trains a model on those labels.
