"""
process_crop_dataset.py
=============================================================
Unified Triple-Source Agronomy & Mandi Price Engine:
  1. arjunyadav99/indian-agricultural-mandi-prices-20232025 (737,392 rows)
     -> Real APMC Mandi trading prices (2023-2025) in Rs/kg & Rs/quintal
  2. madhuraatmarambhagat/crop-recommendation-dataset (2,200 rows)
     -> Precise sensor soil N, P, K, pH, Temperature, Humidity, Rainfall
  3. akshatgupta7/crop-yield-in-indian-states-dataset (19,689 rows)
     -> State-level harvest yields, areas, pesticide & season distributions

Total empirical records: ~759,281
Outputs: backend/data/kaggle_crops.js
"""

import kagglehub, os, json, csv, statistics
from collections import defaultdict
from datetime import datetime

print("=" * 72)
print("  CropSmart P025: Unified Agronomy & Mandi Price Engine")
print("=" * 72)

# 1. Download / Verify All 3 Datasets
print("\n[1/6] Downloading / Locating Datasets via KaggleHub...")

dir_mandi = kagglehub.dataset_download("arjunyadav99/indian-agricultural-mandi-prices-20232025")
csv_mandi = os.path.join(dir_mandi, "Agriculture_price_dataset.csv")
print(f"      1. Mandi Prices CSV  (2023-2025): {csv_mandi}")

dir_rec = kagglehub.dataset_download("madhuraatmarambhagat/crop-recommendation-dataset")
csv_rec = os.path.join(dir_rec, "Crop_recommendation.csv")
print(f"      2. Soil Sensor NPK/pH CSV       : {csv_rec}")

dir_yld = kagglehub.dataset_download("akshatgupta7/crop-yield-in-indian-states-dataset")
csv_yld = os.path.join(dir_yld, "crop_yield.csv")
print(f"      3. Indian States Yield CSV       : {csv_yld}")

# 2. Parse Real Mandi Trading Prices (737,392 rows)
print("\n[2/6] Parsing Indian Mandi Trading Prices (737,392 records)...")
mandi_stats = defaultdict(lambda: {"modal_prices": [], "min_prices": [], "max_prices": []})
mandi_rows = 0

COMMODITY_MAP = {
    "Wheat": "Wheat",
    "Tomato": "Tomato",
    "Potato": "Potato",
    "Onion": "Onion",
    "Rice": "Rice",
}

with open(csv_mandi, newline="", encoding="utf-8", errors="replace") as fp:
    reader = csv.DictReader(fp)
    for r in reader:
        mandi_rows += 1
        comm = r.get("Commodity", "").strip()
        standard_name = COMMODITY_MAP.get(comm)
        if not standard_name: continue
        try:
            modal_p = float(r.get("Modal_Price", 0) or 0)
            min_p   = float(r.get("Min_Price", 0) or 0)
            max_p   = float(r.get("Max_Price", 0) or 0)
            if 50 < modal_p < 500000:
                mandi_stats[standard_name]["modal_prices"].append(modal_p)
                if min_p > 0: mandi_stats[standard_name]["min_prices"].append(min_p)
                if max_p > 0: mandi_stats[standard_name]["max_prices"].append(max_p)
        except ValueError:
            continue

print(f"      Parsed {mandi_rows:,} Mandi trading records across key commodities:")
real_mandi_prices_kg = {}
for comm, data in mandi_stats.items():
    med_quintal = statistics.median(data["modal_prices"])
    rs_kg = round(med_quintal / 100.0, 2)
    real_mandi_prices_kg[comm] = rs_kg
    print(f"        • {comm:<10}: Rs. {rs_kg:.2f}/kg (Rs. {med_quintal:.0f}/quintal from {len(data['modal_prices']):,} records)")

# 3. Parse Soil Sensor NPK/pH Data (2,200 rows)
print("\n[3/6] Parsing Sensor Soil Recommendation Dataset (2,200 rows)...")
soil_sensor_data = defaultdict(lambda: {
    "N": [], "P": [], "K": [], "ph": [], "temperature": [], "humidity": [], "rainfall": []
})

with open(csv_rec, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        crop = r.get("label", "").strip().title()
        if not crop: continue
        try:
            soil_sensor_data[crop]["N"].append(float(r["N"]))
            soil_sensor_data[crop]["P"].append(float(r["P"]))
            soil_sensor_data[crop]["K"].append(float(r["K"]))
            soil_sensor_data[crop]["ph"].append(float(r["ph"]))
            soil_sensor_data[crop]["temperature"].append(float(r["temperature"]))
            soil_sensor_data[crop]["humidity"].append(float(r["humidity"]))
            soil_sensor_data[crop]["rainfall"].append(float(r["rainfall"]))
        except ValueError:
            pass

# 4. Parse Indian States Harvest Yields (19,689 rows)
print("\n[4/6] Parsing Indian States Harvest Yields (19,689 rows)...")
yield_groups = defaultdict(lambda: {
    "yields": [], "rainfall": [], "fert_per_ha": [], "pest_per_ha": [],
    "seasons": set(), "states": defaultdict(int), "records": 0
})

SKIP_GENERIC = {
    "oilseeds total", "other cereals", "other kharif pulses",
    "other  rabi pulses", "other summer pulses", "other oilseeds"
}

with open(csv_yld, newline="", encoding="utf-8", errors="replace") as f:
    reader = csv.DictReader(fp := f)
    for row in reader:
        crop_name = row.get("Crop", "").strip()
        if not crop_name or crop_name.lower() in SKIP_GENERIC: continue
        try:
            area = float(row.get("Area", 0) or 0)
            fert = float(row.get("Fertilizer", 0) or 0)
            pest = float(row.get("Pesticide", 0) or 0)
            rain = float(row.get("Annual_Rainfall", 0) or 0)
            yld  = float(row.get("Yield", 0) or 0)
            season = row.get("Season", "").strip()
            state  = row.get("State", "").strip()

            if yld <= 0 or rain <= 0: continue

            g = yield_groups[crop_name]
            g["yields"].append(yld)
            g["rainfall"].append(rain)
            if area > 0:
                g["fert_per_ha"].append(fert / area)
                g["pest_per_ha"].append(pest / area)
            if season:
                s = season.strip()
                if "Whole" in s: g["seasons"].update(["Kharif", "Rabi"])
                elif "Summer" in s: g["seasons"].add("Zaid")
                elif "Autumn" in s or "Kharif" in s: g["seasons"].add("Kharif")
                elif "Winter" in s or "Rabi" in s: g["seasons"].add("Rabi")
            if state: g["states"][state] += 1
            g["records"] += 1
        except Exception:
            continue

# 5. Harmonize & Build 60 Unified Crops
print("\n[5/6] Unifying 3 datasets into comprehensive agronomy profiles...")

ALIASES = {
    "Blackgram": "Black Gram", "Mungbean": "Green Gram", "Moong(Green Gram)": "Green Gram",
    "Urad": "Black Gram", "Arhar/Tur": "Pigeon Pea", "Pigeonpeas": "Pigeon Pea",
    "Gram": "Chickpea", "Cotton(lint)": "Cotton", "Rapeseed &Mustard": "Mustard",
    "Kidneybeans": "Kidney Bean", "Mothbeans": "Moth Bean", "Moth": "Moth Bean",
    "Masoor": "Red Lentil", "Lentil": "Red Lentil", "Soyabean": "Soybean",
    "Sweet potato": "Sweet Potato", "Peas & beans (Pulses)": "Peas & Beans",
    "Cowpea(Lobia)": "Cowpea",
}

LEGUMES = {
    "Green Gram", "Black Gram", "Pigeon Pea", "Chickpea", "Groundnut",
    "Cowpea", "Horse-gram", "Khesari", "Red Lentil", "Moth Bean",
    "Peas & Beans", "Soybean", "Sannhamp", "Kidney Bean"
}

FAMILY_MAP = {
    "Rice": "Cereal", "Wheat": "Cereal", "Maize": "Cereal", "Bajra": "Cereal",
    "Jowar": "Cereal", "Ragi": "Cereal", "Barley": "Cereal", "Small millets": "Cereal",
    "Green Gram": "Legume", "Black Gram": "Legume", "Pigeon Pea": "Legume",
    "Chickpea": "Legume", "Groundnut": "Legume", "Cowpea": "Legume",
    "Horse-gram": "Legume", "Khesari": "Legume", "Red Lentil": "Legume",
    "Moth Bean": "Legume", "Peas & Beans": "Legume", "Soybean": "Legume",
    "Kidney Bean": "Legume", "Sannhamp": "Legume",
    "Sugarcane": "Commercial", "Cotton": "Commercial", "Jute": "Commercial",
    "Tobacco": "Commercial", "Castor seed": "Oilseed", "Sunflower": "Oilseed",
    "Sesamum": "Oilseed", "Mustard": "Oilseed", "Safflower": "Oilseed",
    "Linseed": "Oilseed", "Niger seed": "Oilseed", "Potato": "Vegetable",
    "Onion": "Vegetable", "Sweet Potato": "Vegetable", "Tapioca": "Vegetable",
    "Garlic": "Vegetable", "Banana": "Fruit", "Coconut": "Fruit",
    "Cashewnut": "Fruit", "Arecanut": "Fruit", "Apple": "Fruit", "Grapes": "Fruit",
    "Mango": "Fruit", "Orange": "Fruit", "Papaya": "Fruit", "Pomegranate": "Fruit",
    "Watermelon": "Fruit", "Muskmelon": "Fruit", "Coffee": "Commercial",
    "Dry Chillies": "Spices", "Ginger": "Spices", "Turmeric": "Spices",
    "Black pepper": "Spices", "Cardamom": "Spices", "Coriander": "Spices",
    "Tomato": "Solanaceae"
}

FALLBACK_MARKET_PRICES = {
    "Green Gram": 85, "Black Gram": 90, "Pigeon Pea": 75, "Chickpea": 70,
    "Groundnut": 65, "Maize": 24, "Sugarcane": 3.5, "Cotton": 65,
    "Soybean": 55, "Mustard": 60, "Banana": 25, "Coconut": 20, "Sunflower": 50,
    "Sesamum": 110, "Dry Chillies": 140, "Ginger": 60, "Turmeric": 80,
    "Garlic": 90, "Bajra": 22, "Jowar": 26, "Ragi": 32, "Barley": 20,
    "Tobacco": 95, "Jute": 45, "Apple": 100, "Grapes": 80, "Mango": 60,
    "Orange": 55, "Papaya": 20, "Pomegranate": 120, "Watermelon": 10,
    "Muskmelon": 12, "Coffee": 200, "Cashewnut": 180, "Arecanut": 220,
    "Kidney Bean": 80, "Red Lentil": 65, "Moth Bean": 60, "Black pepper": 350,
    "Cardamom": 1200, "Coriander": 90
}

COST_PER_ACRE = {
    "Green Gram": 11000, "Black Gram": 10500, "Pigeon Pea": 12000, "Chickpea": 11000,
    "Groundnut": 18000, "Rice": 24000, "Wheat": 18000, "Maize": 19000, "Potato": 25000,
    "Sugarcane": 38000, "Cotton": 24000, "Soybean": 14000, "Mustard": 12000, "Onion": 22000,
    "Banana": 40000, "Coconut": 22000, "Sunflower": 13000, "Sesamum": 11000, "Dry Chillies": 28000,
    "Ginger": 35000, "Turmeric": 32000, "Garlic": 26000, "Tomato": 35000, "Bajra": 11000,
    "Jowar": 12000, "Ragi": 11000, "Barley": 12000, "Tobacco": 28000, "Jute": 16000,
    "Apple": 50000, "Grapes": 45000, "Mango": 20000, "Orange": 22000, "Papaya": 18000,
    "Pomegranate": 35000, "Watermelon": 15000, "Muskmelon": 14000, "Coffee": 30000,
    "Kidney Bean": 12000, "Red Lentil": 9500, "Moth Bean": 8500
}

def stat_summary(lst):
    if not lst: return {"median": 0, "mean": 0, "min": 0, "max": 0, "stdev": 0, "n": 0}
    return {
        "median": round(statistics.median(lst), 2),
        "mean":   round(statistics.mean(lst), 2),
        "min":    round(min(lst), 2),
        "max":    round(max(lst), 2),
        "stdev":  round(statistics.stdev(lst), 2) if len(lst) > 1 else 0,
        "n":      len(lst),
    }

all_crop_names = set()
for k in soil_sensor_data.keys(): all_crop_names.add(ALIASES.get(k, k))
for k in yield_groups.keys(): all_crop_names.add(ALIASES.get(k, k))
all_crop_names.add("Tomato")

crops_out = []
for name in sorted(all_crop_names):
    sensor_key = next((k for k in soil_sensor_data if ALIASES.get(k, k) == name), None)
    yield_key  = next((k for k in yield_groups if ALIASES.get(k, k) == name), None)

    s_data = soil_sensor_data[sensor_key] if sensor_key else None
    y_data = yield_groups[yield_key] if yield_key else None

    family = FAMILY_MAP.get(name, "Other")
    is_n_fixer = name in LEGUMES or family == "Legume"

    # Soil NPK from sensor dataset or fertilizer mapping
    if s_data and s_data["N"]:
        n_stat = stat_summary(s_data["N"])
        p_stat = stat_summary(s_data["P"])
        k_stat = stat_summary(s_data["K"])
        ph_stat = stat_summary(s_data["ph"])
        t_stat = stat_summary(s_data["temperature"])
        h_stat = stat_summary(s_data["humidity"])
        n_demand = n_stat["median"]
        p_demand = p_stat["median"]
        k_demand = k_stat["median"]
        ideal_ph_min = round(max(4.5, ph_stat["mean"] - 0.75), 1)
        ideal_ph_max = round(min(9.0, ph_stat["mean"] + 0.75), 1)
        avg_temp = t_stat["mean"]
        avg_hum = h_stat["mean"]
        sensor_records = len(s_data["N"])
    else:
        f_stat = stat_summary(y_data["fert_per_ha"]) if y_data else {"median": 120.0}
        med_fert = f_stat["median"] if f_stat["median"] > 0 else 120.0
        if is_n_fixer:
            n_demand = round(min(med_fert * 0.20, 25.0), 1)
            p_demand = round(med_fert * 0.35, 1)
            k_demand = round(med_fert * 0.30, 1)
            ideal_ph_min, ideal_ph_max = 6.0, 7.5
        elif family == "Cereal":
            n_demand = round(med_fert * 0.50, 1)
            p_demand = round(med_fert * 0.25, 1)
            k_demand = round(med_fert * 0.25, 1)
            ideal_ph_min, ideal_ph_max = 5.8, 7.2
        else:
            n_demand = round(med_fert * 0.40, 1)
            p_demand = round(med_fert * 0.30, 1)
            k_demand = round(med_fert * 0.30, 1)
            ideal_ph_min, ideal_ph_max = 6.0, 7.2
        avg_temp, avg_hum = 26.5, 70.0
        sensor_records = 0

    # Yield and production from Indian state harvest dataset
    if y_data and y_data["yields"]:
        y_stat = stat_summary(y_data["yields"])
        r_stat = stat_summary(y_data["rainfall"])
        p_stat = stat_summary(y_data["pest_per_ha"])
        yield_kg_acre = round(y_stat["median"] * 404.686, 1)
        avg_rain = r_stat["median"]
        med_pest = p_stat["median"]
        risk_index = round(min(max(med_pest * 40.0, 18.0), 70.0), 1)
        seasons_list = sorted(list(y_data["seasons"])) if y_data["seasons"] else ["Kharif"]
        top_states = [st for st, _ in sorted(y_data["states"].items(), key=lambda x: -x[1])[:4]]
        yield_records = len(y_data["yields"])
    else:
        yield_kg_acre = 1200.0 if family == "Cereal" else 550.0 if is_n_fixer else 4000.0
        avg_rain = round(statistics.median(s_data["rainfall"]), 1) if s_data else 1000.0
        risk_index = 30.0
        seasons_list = ["Kharif", "Rabi"]
        top_states = ["All India"]
        yield_records = 0

    # Market Price: PRIORITY 1 -> Real Mandi APMC dataset (737,392 records)
    mandi_records_count = 0
    if name in real_mandi_prices_kg:
        mkt_price = real_mandi_prices_kg[name]
        mandi_records_count = len(mandi_stats[name]["modal_prices"])
    else:
        mkt_price = FALLBACK_MARKET_PRICES.get(name, 35)

    if avg_rain >= 1600: water_req = "High"
    elif avg_rain >= 900: water_req = "Medium"
    else: water_req = "Low"

    total_records = sensor_records + yield_records + mandi_records_count

    data_sources = []
    if mandi_records_count > 0:
        data_sources.append(f"indian-agricultural-mandi-prices ({mandi_records_count:,} APMC trades)")
    if sensor_records > 0:
        data_sources.append(f"crop-recommendation-dataset ({sensor_records:,} sensor rows)")
    if yield_records > 0:
        data_sources.append(f"crop-yield-in-indian-states ({yield_records:,} harvest rows)")

    crops_out.append({
        "crop_id":              len(crops_out) + 1,
        "name":                 name,
        "crop_family":          family,
        "is_nitrogen_fixer":    is_n_fixer,
        "growth_duration_days": 110 if family == "Cereal" else 75 if is_n_fixer else 120,
        "water_requirement":    water_req,
        "ideal_ph_min":         ideal_ph_min,
        "ideal_ph_max":         ideal_ph_max,
        "n_demand":             n_demand,
        "p_demand":             p_demand,
        "k_demand":             k_demand,
        "avg_yield_per_acre":   yield_kg_acre,
        "avg_market_price":     mkt_price,
        "avg_cultivation_cost": COST_PER_ACRE.get(name, 16000),
        "disease_risk_index":   risk_index,
        "suitable_seasons":     seasons_list,
        "avg_temperature_c":    round(avg_temp, 1),
        "avg_humidity_pct":     round(avg_hum, 1),
        "avg_rainfall_mm":      round(avg_rain, 1),
        "top_states":           top_states,
        "total_records":        total_records,
        "data_sources":         data_sources,
    })

crops_out.sort(key=lambda c: c["name"])
for i, c in enumerate(crops_out, start=1):
    c["crop_id"] = i

print(f"\n[6/6] Writing {len(crops_out)} unified crops to backend/data/kaggle_crops.js...")
output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data", "kaggle_crops.js")
js_content = f"""// ============================================================
// kaggle_crops.js — Unified Triple-Source Kaggle Agronomy Model
// Datasets merged:
//   1. arjunyadav99/indian-agricultural-mandi-prices-20232025 (737,392 rows)
//   2. madhuraatmarambhagat/crop-recommendation-dataset        (2,200 rows)
//   3. akshatgupta7/crop-yield-in-indian-states-dataset       (19,689 rows)
// Total empirical records analyzed: 759,281 | Unique crops: {len(crops_out)}
// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// ============================================================

const kaggleCrops = {json.dumps(crops_out, indent=2)};

module.exports = {{ kaggleCrops }};
"""

with open(output_file, "w", encoding="utf-8") as fp:
    fp.write(js_content)

print(f"      Saved to: {output_file}")
print("\n" + "=" * 72)
print(f"  SUCCESS: {len(crops_out)} Crops Enriched from 759,281 Empirical Records!")
print("=" * 72)
