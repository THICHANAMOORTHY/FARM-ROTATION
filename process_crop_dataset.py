"""
process_crop_dataset.py  (v3 — triple-source merge)
=====================================================
Merges THREE Kaggle crop datasets:
  1. madhuraatmarambhagat/crop-recommendation-dataset  (2200 rows, 22 crops)
  2. aksahaha/crop-recommendation                       (2200 rows, 22 crops)
  3. javakhan/crops-npk-data-set                        (20000 rows, 6 crops + soil_type + variety)

Total rows: ~24,400 across 25 unique crops.
Writes: backend/data/kaggle_crops.js

Usage:
    python process_crop_dataset.py
"""

import kagglehub, os, json, csv, statistics, sys
from collections import defaultdict
from datetime import datetime

# ─────────────────────────────────────────────────────────────
# 1. DATASET DEFINITIONS
# ─────────────────────────────────────────────────────────────
DATASETS = [
    {
        "slug":    "madhuraatmarambhagat/crop-recommendation-dataset",
        "col_map": {"n":"nitrogen","p":"phosphorus","k":"potassium",
                    "temperature":"temperature","humidity":"humidity",
                    "ph":"ph","rainfall":"rainfall","label":"label"},
    },
    {
        "slug":    "aksahaha/crop-recommendation",
        "col_map": {"nitrogen":"nitrogen","phosphorus":"phosphorus",
                    "potassium":"potassium","temperature":"temperature",
                    "humidity":"humidity","ph":"ph","rainfall":"rainfall",
                    "label":"label"},
    },
    {
        "slug":    "javakhan/crops-npk-data-set",
        # col_map: CSV_column_lowercase -> canonical_name
        "col_map": {"nitrogen":"nitrogen","phosphorus":"phosphorus",
                    "potassium":"potassium","temperature":"temperature",
                    "humidity":"humidity","ph_value":"ph","rainfall":"rainfall",
                    "crop":"label","soil_type":"soil_type","variety":"variety"},
    },
]

print("=" * 65)
print("  CropSmart P025 — Triple-Source Dataset Merger v3")
print("=" * 65)

# ─────────────────────────────────────────────────────────────
# 2. DOWNLOAD + PARSE ALL SOURCES
# ─────────────────────────────────────────────────────────────
crop_data = defaultdict(lambda: {
    "N": [], "P": [], "K": [],
    "temperature": [], "humidity": [],
    "ph": [], "rainfall": [],
    "soil_types": defaultdict(int),
    "varieties":  set(),
    "sources":    set(),
})

total_rows = 0

for ds in DATASETS:
    print(f"\n  Downloading: {ds['slug']}")
    try:
        path = kagglehub.dataset_download(ds["slug"])
    except Exception as e:
        print(f"  ERROR: {e} — skipping")
        continue

    csv_file = next(
        (os.path.join(path, f) for f in os.listdir(path) if f.lower().endswith(".csv")),
        None
    )
    if not csv_file:
        print(f"  No CSV found in {path}")
        continue

    # Build reverse map: canonical_name -> csv_col_lowercase
    col_map = ds["col_map"]  # csv_col_lower -> canonical
    rev_map = {v: k for k, v in col_map.items()}  # canonical -> csv_col_lower
    src_tag = ds["slug"].split("/")[0]

    rows_this = 0
    with open(csv_file, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)

        for row in reader:
            norm = {k.strip().lower(): v.strip() for k, v in row.items() if k}

            def get(canonical, _norm=norm, _rev=rev_map):
                """Resolve canonical field name → value via rev_map or direct lookup."""
                # 1. Try mapped CSV column name
                csv_col = _rev.get(canonical)
                if csv_col and _norm.get(csv_col):
                    return _norm[csv_col]
                # 2. Try canonical name directly
                if _norm.get(canonical):
                    return _norm[canonical]
                return None

            label_raw = get("label") or ""
            label = label_raw.strip().title()
            if not label:
                continue

            def flt(canonical):
                v = get(canonical)
                if v:
                    try:    return float(v)
                    except: pass
                return None

            n  = flt("nitrogen")
            p  = flt("phosphorus")
            k  = flt("potassium")
            t  = flt("temperature")
            h  = flt("humidity")
            ph = flt("ph")
            r  = flt("rainfall")

            for field, val in [("N",n),("P",p),("K",k),
                                ("temperature",t),("humidity",h),
                                ("ph",ph),("rainfall",r)]:
                if val is not None and 0 < val < 10000:
                    crop_data[label][field].append(val)

            # Extra fields from dataset 3
            st = norm.get("soil_type","").strip()
            vr = norm.get("variety","").strip()
            if st: crop_data[label]["soil_types"][st] += 1
            if vr: crop_data[label]["varieties"].add(vr)
            crop_data[label]["sources"].add(src_tag)
            rows_this += 1

    total_rows += rows_this
    print(f"  Parsed {rows_this:,} rows from {os.path.basename(csv_file)}")

print(f"\n  Grand total rows : {total_rows:,}")
print(f"  Unique crops     : {len(crop_data)}")
print(f"  Crops: {sorted(crop_data.keys())}")

# ─────────────────────────────────────────────────────────────
# 3. LOOKUP TABLES
# ─────────────────────────────────────────────────────────────
FAMILY_MAP = {
    "Rice":"Cereal","Maize":"Cereal","Wheat":"Cereal","Sugarcane":"Commercial",
    "Chickpea":"Legume","Kidneybeans":"Legume","Pigeonpeas":"Legume",
    "Mothbeans":"Legume","Mungbean":"Legume","Blackgram":"Legume","Lentil":"Legume",
    "Pomegranate":"Fruit","Banana":"Fruit","Mango":"Fruit","Grapes":"Fruit",
    "Watermelon":"Fruit","Muskmelon":"Fruit","Apple":"Fruit","Orange":"Fruit",
    "Papaya":"Fruit","Coconut":"Fruit","Potato":"Vegetable","Tomato":"Solanaceae",
    "Cotton":"Commercial","Jute":"Commercial","Coffee":"Commercial",
}
SEASON_MAP = {
    "Rice":       ["Kharif"],
    "Maize":      ["Kharif","Rabi"],
    "Wheat":      ["Rabi"],
    "Sugarcane":  ["Kharif","Rabi"],
    "Potato":     ["Rabi"],
    "Tomato":     ["Kharif","Rabi"],
    "Chickpea":   ["Rabi"],
    "Kidneybeans":["Kharif"],
    "Pigeonpeas": ["Kharif"],
    "Mothbeans":  ["Kharif","Zaid"],
    "Mungbean":   ["Kharif","Zaid"],
    "Blackgram":  ["Kharif","Rabi"],
    "Lentil":     ["Rabi"],
    "Pomegranate":["Kharif","Rabi"],
    "Banana":     ["Kharif","Rabi"],
    "Mango":      ["Kharif"],
    "Grapes":     ["Rabi"],
    "Watermelon": ["Zaid"],
    "Muskmelon":  ["Zaid"],
    "Apple":      ["Rabi"],
    "Orange":     ["Rabi"],
    "Papaya":     ["Kharif"],
    "Coconut":    ["Kharif","Rabi"],
    "Cotton":     ["Kharif"],
    "Jute":       ["Kharif"],
    "Coffee":     ["Kharif"],
}
NFIX_MAP = {
    "Chickpea":True,"Kidneybeans":True,"Pigeonpeas":True,
    "Mothbeans":True,"Mungbean":True,"Blackgram":True,"Lentil":True,
}
RISK_MAP = {
    "Rice":40,"Maize":35,"Wheat":30,"Sugarcane":40,"Potato":45,"Tomato":55,
    "Cotton":55,"Jute":30,"Coffee":45,"Banana":50,"Papaya":40,"Mango":25,
    "Grapes":60,"Chickpea":20,"Lentil":18,"Mungbean":22,"Blackgram":22,
    "Kidneybeans":25,"Pigeonpeas":25,"Mothbeans":20,"Apple":35,
    "Orange":30,"Coconut":20,"Pomegranate":22,"Watermelon":28,"Muskmelon":28,
}
GROWTH_DAYS = {
    "Rice":130,"Maize":95,"Wheat":120,"Sugarcane":365,"Potato":90,"Tomato":110,
    "Chickpea":90,"Kidneybeans":85,"Pigeonpeas":150,"Mothbeans":75,
    "Mungbean":65,"Blackgram":70,"Lentil":110,"Apple":365,"Banana":270,
    "Mango":365,"Grapes":180,"Watermelon":80,"Muskmelon":75,"Orange":365,
    "Papaya":240,"Coconut":365,"Pomegranate":180,"Cotton":180,"Jute":120,"Coffee":365,
}
MARKET = {
    "Rice":40,"Maize":22,"Wheat":25,"Sugarcane":3,"Potato":15,"Tomato":20,
    "Chickpea":70,"Kidneybeans":80,"Pigeonpeas":75,"Mothbeans":60,
    "Mungbean":85,"Blackgram":90,"Lentil":65,"Pomegranate":120,"Banana":25,
    "Mango":60,"Grapes":80,"Watermelon":10,"Muskmelon":12,"Apple":100,
    "Orange":55,"Papaya":20,"Coconut":15,"Cotton":65,"Jute":40,"Coffee":200,
}
YIELD_PER_ACRE = {
    "Rice":2800,"Maize":2500,"Wheat":1800,"Sugarcane":40000,"Potato":8000,"Tomato":9000,
    "Chickpea":600,"Kidneybeans":700,"Pigeonpeas":650,"Mothbeans":400,
    "Mungbean":550,"Blackgram":550,"Lentil":500,"Pomegranate":3000,
    "Banana":8000,"Mango":4000,"Grapes":4000,"Watermelon":8000,
    "Muskmelon":6000,"Apple":5000,"Orange":4500,"Papaya":7000,"Coconut":6000,
    "Cotton":800,"Jute":1500,"Coffee":400,
}
COST_PER_ACRE = {
    "Rice":25000,"Maize":20000,"Wheat":18000,"Sugarcane":35000,"Potato":22000,"Tomato":38000,
    "Chickpea":10000,"Kidneybeans":12000,"Pigeonpeas":11000,"Mothbeans":8000,
    "Mungbean":10000,"Blackgram":9500,"Lentil":9000,"Pomegranate":35000,
    "Banana":40000,"Mango":20000,"Grapes":45000,"Watermelon":15000,
    "Muskmelon":14000,"Apple":50000,"Orange":22000,"Papaya":18000,
    "Coconut":20000,"Cotton":22000,"Jute":15000,"Coffee":30000,
}

def water_from_rainfall(avg_rain):
    if avg_rain >= 160: return "High"
    elif avg_rain >= 75: return "Medium"
    return "Low"

def safe_stat(lst):
    if not lst: return None
    clean = [v for v in lst if v == v]  # remove NaN
    if not clean: return None
    return {
        "mean":   round(statistics.mean(clean), 3),
        "median": round(statistics.median(clean), 3),
        "stdev":  round(statistics.stdev(clean), 3) if len(clean) > 1 else 0,
        "min":    round(min(clean), 3),
        "max":    round(max(clean), 3),
        "n":      len(clean),
    }

# ─────────────────────────────────────────────────────────────
# 4. BUILD CROP RECORDS
# ─────────────────────────────────────────────────────────────
crops_js = []

print("\n" + "-" * 72)
print(f"{'Crop':<14} {'N':>7} {'P':>7} {'K':>7} {'pH':>6} {'Rain':>7} {'Temp':>6} {'H2O':<8} {'Rows':>6}")
print("-" * 72)

for i, name in enumerate(sorted(crop_data.keys()), start=1):
    vals = crop_data[name]

    n_s  = safe_stat(vals["N"])
    p_s  = safe_stat(vals["P"])
    k_s  = safe_stat(vals["K"])
    ph_s = safe_stat(vals["ph"])
    t_s  = safe_stat(vals["temperature"])
    h_s  = safe_stat(vals["humidity"])
    r_s  = safe_stat(vals["rainfall"])

    n_med  = n_s["median"]  if n_s  else 50
    p_med  = p_s["median"]  if p_s  else 40
    k_med  = k_s["median"]  if k_s  else 40
    ph_avg = ph_s["mean"]   if ph_s else 6.5
    t_avg  = t_s["mean"]    if t_s  else 25.0
    h_avg  = h_s["mean"]    if h_s  else 70.0
    r_avg  = r_s["mean"]    if r_s  else 100.0

    ph_min = round(max(4.0, ph_avg - 0.75), 1)
    ph_max = round(min(9.5, ph_avg + 0.75), 1)
    water  = water_from_rainfall(r_avg)

    top_soils = sorted(vals["soil_types"].items(), key=lambda x: -x[1])[:3]
    preferred_soils = [s for s, _ in top_soils]

    num_rows = len(vals["N"])
    print(f"{name:<14} {n_med:>7.1f} {p_med:>7.1f} {k_med:>7.1f} {ph_avg:>6.2f} {r_avg:>7.1f} {t_avg:>6.1f} {water:<8} {num_rows:>6}")

    rec = {
        "crop_id":              i,
        "name":                 name,
        "crop_family":          FAMILY_MAP.get(name, "Other"),
        "growth_duration_days": GROWTH_DAYS.get(name, 90),
        "water_requirement":    water,
        "ideal_ph_min":         ph_min,
        "ideal_ph_max":         ph_max,
        "n_demand":             n_med,
        "p_demand":             p_med,
        "k_demand":             k_med,
        "is_nitrogen_fixer":    NFIX_MAP.get(name, False),
        "avg_yield_per_acre":   YIELD_PER_ACRE.get(name, 1000),
        "avg_market_price":     MARKET.get(name, 40),
        "avg_cultivation_cost": COST_PER_ACRE.get(name, 15000),
        "disease_risk_index":   RISK_MAP.get(name, 30),
        "suitable_seasons":     SEASON_MAP.get(name, ["Kharif"]),
        "avg_temperature_c":    round(t_avg, 1),
        "avg_humidity_pct":     round(h_avg, 1),
        "avg_rainfall_mm":      round(r_avg, 1),
        "preferred_soil_types": preferred_soils,
        "stats": {
            "N":           n_s,
            "P":           p_s,
            "K":           k_s,
            "ph":          ph_s,
            "temperature": t_s,
            "humidity":    h_s,
            "rainfall":    r_s,
        },
        "data_sources": list(vals["sources"]),
        "total_rows":   num_rows,
    }
    crops_js.append(rec)

# ─────────────────────────────────────────────────────────────
# 5. WRITE JS MODULE
# ─────────────────────────────────────────────────────────────
out_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "backend", "data", "kaggle_crops.js"
)

content = "\n".join([
    "// ============================================================",
    "// kaggle_crops.js — Auto-generated from 3 merged Kaggle datasets",
    "// Sources:",
    "//   1. madhuraatmarambhagat/crop-recommendation-dataset  (2200 rows)",
    "//   2. aksahaha/crop-recommendation                       (2200 rows)",
    "//   3. javakhan/crops-npk-data-set                        (20000 rows)",
    f"// Total rows: {total_rows:,}  |  Unique crops: {len(crops_js)}",
    f"// Generated : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    "// Regenerate : python process_crop_dataset.py",
    "// ============================================================",
    "",
    "const kaggleCrops = " + json.dumps(crops_js, indent=2) + ";",
    "",
    "module.exports = { kaggleCrops };",
    "",
])

with open(out_path, "w", encoding="utf-8") as f:
    f.write(content)

print("\n" + "=" * 65)
print(f"  Written : {out_path}")
print(f"  Crops   : {len(crops_js)}")
print(f"  Rows    : {total_rows:,}")
print("=" * 65)
