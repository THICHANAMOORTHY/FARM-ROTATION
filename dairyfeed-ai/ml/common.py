"""Shared training code: dataset loading, the refusal rule, validation and saving models."""

import csv
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import yaml
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_predict

ML_DIR = Path(__file__).resolve().parent
DATA_DIR = ML_DIR / "data"
MODELS_DIR = ML_DIR / "models"

# The feature code lives in the backend so training and the live backend can never differ.
sys.path.insert(0, str(ML_DIR.parent / "backend"))
from app.services.features import IMAGE_FEATURES, TABULAR_FEATURES, image_features, tabular_features  # noqa: E402

__all__ = ["IMAGE_FEATURES", "TABULAR_FEATURES", "image_features", "tabular_features"]


class NotEnoughData(Exception):
    """Training refused: some class has too few samples (or none)."""


def load_config(path: Path = ML_DIR / "config.yaml") -> dict[str, Any]:
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f)


def read_dataset(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        raise NotEnoughData(f"No dataset at {path}. Run export_dataset.py first.")
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def check_enough_data(labels: list[str], classes: list[str], minimum: int) -> dict[str, int]:
    """The refusal rule. Returns class counts, or raises NotEnoughData saying exactly what's short."""
    counts = Counter(labels)
    short = {c: counts.get(c, 0) for c in classes if counts.get(c, 0) < minimum}
    if short:
        details = ", ".join(f"{c}: {n}" for c, n in short.items())
        raise NotEnoughData(
            f"Not enough labelled samples. Every class needs at least {minimum}. Short: {details}. "
            f"Total usable samples: {len(labels)}."
        )
    return {c: counts[c] for c in classes}


def cross_validate(X: np.ndarray, y: np.ndarray, classes: list[str], config: dict[str, Any]) -> dict[str, Any]:
    """Stratified k-fold: every sample is predicted by a model that never saw it."""
    folds = StratifiedKFold(n_splits=config["cv_folds"], shuffle=True, random_state=config["random_state"])
    predicted = cross_val_predict(new_model(config), X, y, cv=folds)
    report = classification_report(y, predicted, labels=classes, output_dict=True, zero_division=0)
    per_class = {
        c: {
            "precision": round(report[c]["precision"], 3),
            "recall": round(report[c]["recall"], 3),
            "f1": round(report[c]["f1-score"], 3),
            "support": int(report[c]["support"]),
        }
        for c in classes
    }
    return {
        "cv_folds": config["cv_folds"],
        "accuracy": round(report["accuracy"], 3),
        "macro_f1": round(report["macro avg"]["f1-score"], 3),
        "per_class": per_class,
        # rows = true class, columns = predicted class, both in `classes` order
        "confusion_matrix": {"labels": classes, "matrix": confusion_matrix(y, predicted, labels=classes).tolist()},
    }


def passes(metrics: dict[str, Any], config: dict[str, Any]) -> tuple[bool, list[str]]:
    criteria = config["pass_criteria"]
    reasons = []
    for c, m in metrics["per_class"].items():
        if m["recall"] < criteria["min_recall_per_class"]:
            reasons.append(f"recall for {c} is {m['recall']} (needs {criteria['min_recall_per_class']})")
    if metrics["macro_f1"] < criteria["min_macro_f1"]:
        reasons.append(f"macro F1 is {metrics['macro_f1']} (needs {criteria['min_macro_f1']})")
    return not reasons, reasons


def new_model(config: dict[str, Any]) -> RandomForestClassifier:
    rf = config["random_forest"]
    return RandomForestClassifier(
        n_estimators=rf["n_estimators"],
        min_samples_leaf=rf["min_samples_leaf"],
        class_weight=rf["class_weight"],
        random_state=config["random_state"],
    )


def next_version_dir(models_dir: Path, name: str) -> tuple[Path, str]:
    """ml/models/<name>-v1, -v2, ... Never overwrites an older model."""
    existing = [int(p.name.rsplit("-v", 1)[1]) for p in models_dir.glob(f"{name}-v*") if p.name.rsplit("-v", 1)[1].isdigit()]
    version = f"{name}-v{max(existing, default=0) + 1}"
    return models_dir / version, version


def train_and_save(
    name: str,
    X: np.ndarray,
    y: np.ndarray,
    target: str,
    classes: list[str],
    feature_names: list[str],
    class_counts: dict[str, int],
    skipped: int,
    config: dict[str, Any],
    models_dir: Path = MODELS_DIR,
) -> dict[str, Any]:
    """Validate, train on all data, save model + metrics + metadata. Returns the metadata."""
    metrics = cross_validate(X, y, classes, config)
    passed, reasons = passes(metrics, config)

    model = new_model(config).fit(X, y)
    importances = dict(zip(feature_names, (round(float(v), 3) for v in model.feature_importances_)))

    out_dir, version = next_version_dir(models_dir, name)
    out_dir.mkdir(parents=True)
    joblib.dump(model, out_dir / "model.joblib")
    (out_dir / "metrics.json").write_text(json.dumps({**metrics, "feature_importance": importances}, indent=2))
    metadata = {
        "model_version": version,
        "target": target,
        "classes": classes,
        "features": feature_names,
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "samples": int(len(y)),
        "class_counts": class_counts,
        "skipped_samples": skipped,
        "passed_validation": passed,
        "failed_because": reasons,
        "pass_criteria": config["pass_criteria"],
    }
    (out_dir / "metadata.json").write_text(json.dumps(metadata, indent=2))
    return metadata


def print_summary(metadata: dict[str, Any], out_dir: Path) -> None:
    metrics = json.loads((out_dir / "metrics.json").read_text())
    print(f"Saved {metadata['model_version']} to {out_dir}")
    print(f"Samples: {metadata['samples']} {metadata['class_counts']} (skipped {metadata['skipped_samples']})")
    print(f"Cross-validated accuracy {metrics['accuracy']}, macro F1 {metrics['macro_f1']}")
    for c, m in metrics["per_class"].items():
        print(f"  {c:<9} precision {m['precision']:.2f}  recall {m['recall']:.2f}  (n={m['support']})")
    if metadata["passed_validation"]:
        print("PASSED validation: the backend will use this model.")
    else:
        print("FAILED validation: saved for the record, the backend will NOT use it.")
        for reason in metadata["failed_because"]:
            print(f"  - {reason}")
