import urllib.request
import urllib.parse
import json
import sys
import time

BASE_URL = "http://localhost:3000"

def get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "HealthCheck/1.0"})
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            elapsed = int((time.time() - t0) * 1000)
            raw = res.read()
            try:
                data = raw.decode('utf-8')
                return res.status, json.loads(data) if data.startswith('{') or data.startswith('[') else data, elapsed, None
            except UnicodeDecodeError:
                return res.status, raw, elapsed, None
    except Exception as e:
        elapsed = int((time.time() - t0) * 1000)
        return getattr(e, 'code', 500), str(e), elapsed, e

def post(path, payload, headers=None):
    url = f"{BASE_URL}{path}"
    body = json.dumps(payload).encode('utf-8')
    h = {"Content-Type": "application/json", "User-Agent": "HealthCheck/1.0"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=body, headers=h)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            elapsed = int((time.time() - t0) * 1000)
            data = res.read().decode('utf-8')
            return res.status, json.loads(data) if data.startswith('{') or data.startswith('[') else data, elapsed, None
    except Exception as e:
        elapsed = int((time.time() - t0) * 1000)
        return getattr(e, 'code', 500), str(e), elapsed, e

def run_tests():
    DEVICE_KEY = "b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc"
    tests = [
        ("Dashboard (farm_id=101)", lambda: get("/api/dashboard?farm_id=101"), lambda r, d: r == 200 and "farm" in d and "recommended_crop" in d),
        ("Dashboard (custom farm_id=1002)", lambda: get("/api/dashboard?farm_id=1002"), lambda r, d: r == 200 and "farm" in d),
        ("Candidate Crops (Kharif, farm 101)", lambda: get("/api/candidate-crops?farm_id=101&season=Kharif"), lambda r, d: r == 200 and len(d.get("candidates", [])) > 0),
        ("Candidate Crops (Rabi, farm 1002)", lambda: get("/api/candidate-crops?farm_id=1002&season=Rabi"), lambda r, d: r == 200 and len(d.get("candidates", [])) > 0),
        ("Crop Evaluation API", lambda: post("/api/crop-evaluation", {"farm_id": 101, "candidate_crop_ids": [48, 50, 44]}), lambda r, d: r == 200 and "results" in d and len(d["results"]) > 0),
        ("Rotation Optimizer API", lambda: post("/api/optimize-rotation", {"farm_id": 101, "horizon_seasons": 3}), lambda r, d: r == 200 and "plans" in d),
        ("Recommendation API (farm 101)", lambda: get("/api/recommendation?farm_id=101"), lambda r, d: r == 200 and "rotation_plan" in d),
        ("Recommendation API (farm 1002)", lambda: get("/api/recommendation?farm_id=1002"), lambda r, d: r == 200 and "rotation_plan" in d),
        ("Full Farmer Report (farm 101)", lambda: get("/api/report?farm_id=101"), lambda r, d: r == 200 and "soil_health" in d),
        ("Full Farmer Report (farm 1002)", lambda: get("/api/report?farm_id=1002"), lambda r, d: r == 200 and "soil_health" in d),
        ("GPS Zones & Allocation", lambda: get("/api/gps-zones?farm_id=101"), lambda r, d: r == 200 and "zones" in d and len(d.get("zones", [])) >= 4),
        ("Weather Forecast API", lambda: get("/api/weather?farm_id=101"), lambda r, d: r == 200 and ("current" in d or "forecast" in d or "temperature" in d)),
        ("IoT ESP32 Sensor Ingestion", lambda: post("/api/soil-sensor/ingest", {
            "device_id": "ESP32-NODE-01",
            "farm_id": 1002,
            "nitrogen": 45, "phosphorus": 30, "potassium": 58, "ph": 6.5, "organic_carbon": 0.55,
            "soil_moisture": 62, "air_temperature": 27.5, "air_humidity": 70,
            "latitude": 11.0182, "longitude": 76.9575
        }, headers={"X-Device-Key": DEVICE_KEY}), lambda r, d: r == 200 and (d.get("status") == "success" or d.get("ok") == True or "soil_id" in d)),
        ("Farmer PDF Action Plan Export", lambda: get("/downloads/UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan.pdf"), lambda r, d: r == 200 and len(d) > 1000 and (b"%PDF" in d if isinstance(d, bytes) else "%PDF" in str(d))),
        ("Master 60 Crops Agronomy Dataset CSV", lambda: get("/downloads/CropSmart_Master_60_Crops_Agronomy_Mandi.csv"), lambda r, d: r == 200 and "crop_id" in str(d).lower()),
        ("AI Chatbot (English Agronomic query)", lambda: post("/api/chat", {
            "message": "Which crop is best for low nitrogen soil?",
            "farm_id": 101,
            "preferred_lang": "en"
        }), lambda r, d: r == 200 and len(d.get("reply", "")) > 10),
        ("AI Chatbot (Tamil Agri query)", lambda: post("/api/chat", {
            "message": "தக்காளிக்கு பின் என்ன பயிர் நட வேண்டும்?",
            "farm_id": 101,
            "preferred_lang": "ta"
        }), lambda r, d: r == 200 and len(d.get("reply", "")) > 10),
    ]

    sys.stdout.reconfigure(encoding='utf-8')
    print("=" * 70)
    print("UZHAVU KAAPPAAN - Full System Health Check")
    print("=" * 70)

    passed = 0
    failed = 0

    for name, test_fn, validator in tests:
        status, data, elapsed, err = test_fn()
        ok = False
        try:
            ok = validator(status, data)
        except Exception as ve:
            ok = False
        
        status_str = f"[{'PASS' if ok else 'FAIL'}]"
        print(f"{status_str:<6} {name:<45} {status} ({elapsed}ms)")
        if not ok:
            print(f"       ERROR/DETAILS: {data}")
            failed += 1
        else:
            passed += 1

    print("=" * 70)
    print(f"Summary: {passed}/{len(tests)} passed, {failed} failed.")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
