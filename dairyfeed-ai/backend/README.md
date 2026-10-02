# Backend — FastAPI

Receives readings and photos from the devices, scores each sample, writes an advisory,
and stores everything in Supabase.

**Status:** structure only. Code arrives in Phase 1.

## Planned layout

| Path | Role |
|---|---|
| `app/main.py` | Creates the FastAPI app and includes the routers |
| `app/config.py` | Reads settings from `.env` |
| `app/db.py` | Supabase repository, plus an in-memory one for tests |
| `app/models/` | Pydantic request and response schemas |
| `app/routers/` | API endpoints (see `../docs/api.md`) |
| `app/services/scoring.py` | Rule-based score, always available |
| `app/services/predictor.py` | Uses a trained ML model if one is validated, otherwise the rules |
| `app/services/image_analysis.py` | Mould risk from the photo |
| `app/services/advisory.py` | English and Tamil advice from templates |
| `app/scoring_config.yaml` | Every threshold and weight |
| `tests/` | pytest tests, with no Supabase needed |

## Setup (from Phase 1)

```bash
cd dairyfeed-ai/backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # then fill in the values
uvicorn app.main:app --reload
pytest
```
