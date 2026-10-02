# ML pipeline

**Status:** structure only. Code arrives in Phase 7.

Until a trained model passes validation, the backend uses rule-based scoring. That is expected.

## Rules (from CLAUDE.md section 7)

- Train only on real, expert-labelled samples. `export_dataset.py` skips any sample that is
  simulated, demo, or unlabelled.
- Training refuses to run if any class has fewer than 15 samples (configurable).
- Metrics (per-class precision/recall, confusion matrix, stratified k-fold) are saved next to each model.

| Path | Role |
|---|---|
| `export_dataset.py` | Exports labelled samples from Supabase into `data/` |
| `train_tabular.py` | Model on the sensor readings |
| `train_image.py` | Mould model on the photos |
| `data/` | Exported datasets (gitignored) |
| `models/` | Versioned model files and their metrics |
