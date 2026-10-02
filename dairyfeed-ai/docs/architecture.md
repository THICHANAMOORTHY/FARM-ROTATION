# System architecture

```
                          SILAGE SAMPLE
                                │
         ┌──────────────────────┴───────────────────────┐
         ↓                                              ↓
 ┌─────────────────────────── SENSOR NODE ──┐   ┌── CAMERA NODE ──┐
 │  pH sensor   Moisture   DS18B20 ×2       │   │                 │
 │      │       sensor     (sample+ambient) │   │   ESP32-CAM     │
 │      └──────────┼──────────┘             │   │                 │
 │                 ↓                        │   │                 │
 │              ESP32  ────► TCS3200        │   │                 │
 │                 │         colour (RGB)   │   │                 │
 │                 │── UART: sample_id ─────┼──►│  takes photo    │
 └─────────────────┼────────────────────────┘   └────────┬────────┘
                   │ pH, moisture, temp, RGB             │ silage image
                   │ POST /api/silage/test               │ POST /api/image/analyze
                   └──────────────────┬──────────────────┘
                                      ↓
                      FastAPI backend (joined by sample_id)
                                      ↓
                            SCORING / AI-ML MODEL
                    rules now → ML model once trained and validated
                                      │
                       ┌──────────────┴──────────────┐
                       ↓                             ↓
                 Quality score             Spoilage / mould risk
                       └──────────────┬──────────────┘
                                      ↓
                      FARMER ADVISORY (English + தமிழ்)
                                      ↓
                 Supabase (data + photos) → Web / mobile app
```

**Important:** the TCS3200 is wired to the **sensor node ESP32**, not built into the camera.
The ESP32 reads the colour data (RGB); the ESP32-CAM takes the photo for computer vision.
The two datasets are joined in the backend by the shared `sample_id`.

## Component roles

| Component | Node | Measures / does |
|---|---|---|
| pH sensor | Sensor node | Silage acidity, the fermentation indicator |
| Capacitive moisture sensor | Sensor node | Moisture indication (calibrated against oven-dry dry matter) |
| DS18B20 ×2 | Sensor node | Sample temperature and ambient temperature |
| TCS3200 | Sensor node | RGB colour features (inside the closed box with fixed white LED) |
| ESP32 | Sensor node | Collects the sensor readings, shows the result on the OLED, sends to the backend, triggers the camera |
| ESP32-CAM | Camera node | Captures the silage image |
| Backend (FastAPI) | Server | Joins readings and image, scores, predicts risk, writes the advisory |
| AI / ML | Server | Quality and spoilage/mould classification (rules until a model is validated) |
| Supabase | Cloud | Stores samples (Postgres) and photos (Storage) |
| Web app | Phone / browser | Results, advisory, history |

## Model inputs and outputs

**Inputs (first version):** pH + moisture + temperature (sample and ambient) + RGB + silage image.

| Input | Stored as |
|---|---|
| pH | `ph` |
| Moisture | `moisture_pct` (and `moisture_raw`) |
| Temperature | `sample_temp_c`, `ambient_temp_c` (the model uses the rise: sample − ambient) |
| RGB | `rgb_r`, `rgb_g`, `rgb_b` |
| Image | `image_path` in the `silage-images` bucket |

**Outputs:** quality score (0–100) and quality (Good / Moderate / Poor), spoilage risk
(Low / Medium / High), mould risk (Low / High / Unknown), then the farmer advisory.

## How it develops

| Stage | Quality and spoilage | Mould risk |
|---|---|---|
| Now: data collection | Rule-based score from pH, moisture and temperature | **Unknown** for every sample, until the images are labelled |
| Experts label samples | Labels stored with each sample (`/api/silage/{id}/label`) | Experts label mould from the stored photos |
| ML trained (Phase 7) | Tabular model on pH, moisture, temperature and RGB, used only if it passes validation | Image model, used only if it passes validation |

Until a model passes validation, every result says "Rule-based", and mould risk stays Unknown.
RGB is collected from day one so the dataset is ready for training, even though the rules don't use it.
