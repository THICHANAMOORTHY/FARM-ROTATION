# ML pipeline

**Status:** Phase 7 done. No model is trained yet, because there is no real labelled data yet.
Until a model passes validation, the backend uses the rules (every result says "Rule-based")
and mould risk stays **Unknown**. That is expected.

## Inputs and outputs

| Model | Inputs | Predicts |
|---|---|---|
| `tabular-quality` | pH, moisture, temperature rise (sample − air), air temperature, RGB, feed type | Quality: Good / Moderate / Poor |
| `tabular-spoilage` | same | Spoilage risk: Low / Medium / High |
| `image-mould` | colour statistics of the photo (white, green, dark, yellow-brown fractions; hue, saturation, brightness) | Mould risk: Low / High |

The inputs are computed by `backend/app/services/features.py`, used by both training and the
live backend, so they can never differ. Both models are random forests: small, quick, and they
report which inputs mattered most (`feature_importance` in `metrics.json`).

The **0–100 score and its breakdown always come from the rules**, so every result can be explained.
The safety caps also always apply: high spoilage risk means at best Moderate, likely mould means Poor.

## Rules (CLAUDE.md section 7)

- **Only real, expert-labelled samples.** `export_dataset.py` drops every simulated, demo or
  unlabelled sample (the database query filters them, and the script checks again).
- **Refuses to train** if any class has fewer than **15** samples (`min_samples_per_class` in
  `config.yaml`), naming the classes that are short. A missing class counts as 0: a quality model
  that has never seen "Poor" is never trained.
- **Stratified 5-fold cross-validation**: per-class precision and recall, macro F1 and a confusion
  matrix are saved in `metrics.json` next to each model.
- **Pass criteria** (`config.yaml`, provisional): every class recall ≥ 0.70 and macro F1 ≥ 0.70.
  A model that fails is still saved, with `passed_validation: false`, and the backend ignores it.

## Run it

Use the backend's environment (the ML scripts need the same packages).

```bash
cd dairyfeed-ai/backend && source .venv/bin/activate && cd ../ml

python export_dataset.py                     # Supabase -> data/dataset.csv + data/images/
python train_tabular.py --target quality     # -> models/tabular-quality-vN/
python train_tabular.py --target spoilage    # -> models/tabular-spoilage-vN/
python train_image.py                        # -> models/image-mould-vN/
pytest tests                                 # pipeline tests (test-only synthetic data)
```

Each training run prints the class counts, cross-validated precision and recall per class, and
whether it **PASSED** or **FAILED** validation. With too little data it prints
`REFUSED to train: ...` and exits with code 2.

**After a model passes, restart the backend**: it loads models once at start-up. Results then
show "AI model tabular-quality-v1" (and so on) instead of "Rule-based".

## Files

| Path | Role |
|---|---|
| `config.yaml` | Minimum samples, folds, pass criteria, classes, forest settings |
| `common.py` | Refusal rule, cross-validation, pass check, saving models |
| `export_dataset.py` | Exports real, labelled samples from Supabase into `data/` |
| `train_tabular.py` | Readings model (quality or spoilage) |
| `train_image.py` | Mould model from photos |
| `data/` | Exported datasets (gitignored, never committed) |
| `models/<name>-vN/` | `model.joblib`, `metrics.json`, `metadata.json`. Versions are never overwritten. |
| `tests/` | Tests. Their synthetic data lives only in temporary folders. |

## How much data is needed

At least 15 per class to train at all: 45 quality labels (15 Good, 15 Moderate, 15 Poor),
45 spoilage labels and 30 mould-labelled photos (15 Low, 15 High). Passing validation will
likely need more. Label every real test on the dashboard's **Label** page as you collect them.
