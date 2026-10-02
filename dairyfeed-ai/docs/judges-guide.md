# DairyFeed AI — guide for judges

**SIH 26111 · Smart AI-Enabled Rapid Feed & Silage Quality Testing System for Dairy Farmers**
Ministry of Fisheries, Animal Husbandry & Dairying · Theme: Agriculture, FoodTech & Rural Development

> **A screening and decision-support tool, not a lab test.** It gives a dairy farmer a quick,
> on-farm estimate of silage quality and risk, with plain advice in English and Tamil. It does
> not claim to detect toxins, mycotoxins, protein or fibre.

---

## 1. The problem

Silage that fermented badly or started to spoil looks much like good silage. A farmer often finds
out only when milk yield drops or animals fall ill. Lab tests are accurate but slow, cost money and
are far from most farms. Farmers need a quick first check at the pit: **is this batch fine, does
it need attention, or should it not be fed until someone qualified checks it?**

## 2. What we built

| Part | What it does | Status |
|---|---|---|
| **Sensor node** (ESP32) | Measures pH, moisture, sample and air temperature, and colour (RGB). Shows the result on an OLED. | Firmware written; waiting for hardware |
| **Camera node** (ESP32-CAM) | Photographs the same sample, linked by a shared sample ID | Waiting for hardware (Phase 5) |
| **Backend** (FastAPI) | Joins readings and photo, scores the sample, predicts risks, writes the advice | Done, 77 tests |
| **Database** (Supabase) | Samples in Postgres, photos in private storage | Done, schema tested |
| **Dashboard** (React) | Results, history, trends, expert labelling, devices; English / தமிழ்; phone-first | Done |
| **ML pipeline** | Trains models only on real, expert-labelled samples, with a validation gate | Done, 11 tests; waiting for real data |
| **Device simulator** | Stands in for the hardware for demos; every sample marked SIMULATED | Done |

Full diagram: [`architecture.md`](architecture.md).

## 3. What every test returns

| Output | Values |
|---|---|
| Quality | Good / Moderate / Poor |
| Quality score | 0–100, **with a breakdown** showing where the points came from |
| Spoilage risk | Low / Medium / High |
| Mould risk | Low / High / **Unknown** |
| Advice | ok / warn / danger, in English and Tamil |
| Method | "Rule-based" or "AI model vN" |

## 4. How the score works (rule-based, always available)

Each reading earns part of its points along a scale. All numbers are in
`backend/app/scoring_config.yaml`, marked **provisional**, to be tuned with expert input.

| Component | Weight | Full points | Penalised |
|---|---|---|---|
| pH | 40 | 3.8–4.5 (well fermented) | Above 4.8 strongly; 0 points at 5.5 |
| Moisture | 30 | 60–70 % | Below 55 % (too dry) or above 75 % (too wet) |
| Temperature | 20 | Sample at most 3 °C warmer than the air | More heating = fewer points (aerobic spoilage sign) |
| Visual | 10 | From the photo's mould risk | **Left out when there is no usable photo** |

- **Score** = points earned ÷ points available × 100. With no photo, the score is out of 90, so
  nothing is invented.
- **Quality**: 75+ Good, 50–74 Moderate, below 50 Poor.
- **Safety caps**: high spoilage risk means at best Moderate; likely mould means Poor, always.
- **Spoilage risk**: High if pH > 5.0 or the sample is more than 6 °C above the air; Medium if
  pH > 4.5 or more than 3 °C above; otherwise Low.

**Advice** follows the result. "Danger" always says: *do not feed until checked by a veterinarian
or animal nutrition expert, or confirmed by a lab.* Tips are practical: check the storage seal,
press dry silage down, drain wet silage, remove the spoiled top layer, keep a mouldy batch apart.

## 5. Where the AI comes in, and why it is gated

We do **not** train on made-up data. The ML pipeline trains only on **real samples labelled by an
expert** on the dashboard's Label page.

1. `export_dataset.py` drops every simulated, demo or unlabelled sample.
2. Training **refuses** unless every class has at least 15 samples. A quality model that has never
   seen "Poor" silage is never built.
3. Each model is checked with **stratified 5-fold cross-validation**. Per-class precision and
   recall and a confusion matrix are saved next to it.
4. The backend uses a model **only if it passed** (every class recall ≥ 0.70, macro F1 ≥ 0.70,
   provisional) **and** was trained on exactly the inputs the backend computes today.

| Model | Inputs | Predicts |
|---|---|---|
| Readings model (random forest) | pH, moisture, temperature rise, air temperature, RGB, feed type | Quality; spoilage risk |
| Photo model (random forest) | Colour statistics of the photo (white, green, dark and yellow-brown areas; hue, saturation, brightness) | Mould risk |

Even with a model, the **score and its breakdown stay rule-based** so every result can be
explained, and the **safety caps still apply**.

**Today there is no model**, because there is no real labelled data yet. That is deliberate: every
result honestly says "Rule-based", and mould risk says **Unknown** rather than guessing.

## 6. Design decisions and why

| Decision | Why |
|---|---|
| Rules first, ML only after validation | Works from day one with zero data; never ships an untested model |
| Mould = "Unknown" without a validated photo model | A hand-made colour rule would be unreliable and could mislead a farmer |
| Score breakdown on every result | Farmers and judges can see *why*, not just a number |
| All thresholds in one config file, marked provisional | Experts can tune them without touching code |
| Simulated and demo data always flagged | Demo data can never be mistaken for real tests or leak into training |
| ADS1115 for pH and moisture | Small pH changes matter (4.2 vs 4.8); the ESP32's own analog input is too noisy, and unusable on ADC2 pins while Wi-Fi is on |
| Voltage divider on the pH output | The pH module can output nearly 5 V; the ADS1115 runs on 3.3 V |
| Readings and photo joined by `sample_id`, in any order | The two boards upload independently; either can arrive first |
| Every upload is safe to retry | A device that loses the server's reply can resend without creating duplicates |
| English + Tamil everywhere | Built for Tamil Nadu dairy farmers |
| Phone-first dashboard; charts load separately | Farmers use phones on slow mobile data |

## 7. Data integrity and safety

- **Never trained on random or synthetic data.** Synthetic data exists only inside the ML tests.
- **Simulated samples** are always flagged; the dashboard shows a "SIMULATED" badge; the export drops them.
- **Device uploads** need a device key; **labelling** needs an admin token. Both are compared in
  constant time.
- **Database**: row-level security is on with no public access; only the backend's service key
  can read or write (checked against a local PostgREST: the public key gets nothing).
- **No claims beyond screening**: a test fails if any English advice template mentions toxins, mycotoxins, protein or fibre.

## 8. How we tested it

| What | How | Result |
|---|---|---|
| Backend | pytest: scoring boundaries, advice, every endpoint, retries, photo-before-readings, model gate, simulator | 77 passing |
| Database | `schema.sql` run twice on Postgres 16; the backend's Supabase code run against a local PostgREST | All checks pass |
| ML pipeline | Export filtering, refusal rule, validation pass/fail, versioning, image model | 11 passing |
| Firmware logic | pH and moisture calibration maths, colour scaling, sample ID format | 5 passing |
| Firmware | Compile check against stand-in headers; JSON accepted by the real backend | Clean (real ESP32 compile pending) |
| Dashboard | ESLint, Prettier, i18n key check, build, screenshots at phone and desktop width, light/dark, Tamil | Clean |
| Chart colours | Colour-blind separation validator, light and dark mode | All checks pass |

## 9. Known limits (honest list)

- **Hardware not yet tested.** The sensor-node firmware is written and checked, but has not been
  compiled for the ESP32 or run on real sensors. Offline queueing (Phase 4) and the camera node
  (Phase 5) wait for the hardware.
- **All thresholds are provisional.** They come from general silage guidance and need tuning with
  experts and real samples.
- **Moisture** from a capacitive sensor is only meaningful after calibration against oven-dried
  samples; two calibration points are a start.
- **No model yet**: needs at least 15 real labelled samples per class, and likely more to pass.
- **Tamil text** was machine-drafted and needs review by a native speaker.
- **HTTPS on the device** encrypts but does not verify the server certificate (fine for a demo).
- **The dashboard's read pages are open** (no login); only uploads and labelling are protected.

## 10. What's next

1. Hardware bench test; then offline queue with on-device score (Phase 4) and camera node (Phase 5).
2. Field trial with a veterinarian or animal nutrition expert labelling real samples.
3. Tune thresholds; train and validate the first models.
4. Native-speaker review of all Tamil text.

---

Live demo steps: [`demo-script.md`](demo-script.md).
