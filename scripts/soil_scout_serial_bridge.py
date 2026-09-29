"""
============================================================
soil_scout_serial_bridge.py — Soil Scout Sensor Bridge
UZHAVU KAAPPAAN / CropSmart IoT Integration

Reads serial output from the Soil Scout device over USB (COM port)
or runs in test/simulation mode, parsing readings and POSTing them
directly to the local website's live sensor ingest endpoint:
    POST http://localhost:3000/api/soil-sensor/ingest

Serial format parsed:
    ---- Soil Scout Reading ----
    Temperature: 31.10 C
    pH: 0.31
    TDS: 0.00 ppm
    Moisture: 0.00 %
    Light: 100.00 %
    Reading reliable: no (too dry)
    Estimated N: 0.00 kg/ha
    Estimated P: 0.00 kg/ha
    Estimated K: 0.00 kg/ha

Usage:
    # 1. Test / Simulate reading immediately (no physical hardware required):
    python scripts/soil_scout_serial_bridge.py --test

    # 2. Connect to real USB Serial COM port (e.g. COM3 or COM4 on Windows):
    python scripts/soil_scout_serial_bridge.py --port COM3 --baud 9600

    # 3. Specify custom server or farm ID:
    python scripts/soil_scout_serial_bridge.py --port COM3 --host http://localhost:3000 --farm 101
============================================================
"""

import sys
import re
import time
import argparse
import json

# Ensure UTF-8 output on Windows consoles
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    import urllib.request
    import urllib.error
except ImportError:
    pass

# Default shared device key from backend/.env
DEFAULT_DEVICE_KEY = "b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc"
DEFAULT_HOST = "http://localhost:3000"


def post_to_backend(payload, host=DEFAULT_HOST, device_key=DEFAULT_DEVICE_KEY):
    url = f"{host.rstrip('/')}/api/soil-sensor/ingest"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Device-Key": device_key,
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            print("\n" + "="*55)
            print("[Crop Predictor Response]")
            print(f"   Status: Success (Soil ID: {res_json.get('soil_id')})")
            print(f"   Soil Health Score: {res_json.get('soil_health_score', 'N/A')}/100")
            print(f"   Reading Reliable: {res_json.get('is_reliable')}")
            if not res_json.get('is_reliable'):
                print(f"   [NOTICE]: {res_json.get('reliability_note')}")
            print(f"   Top Predicted Crop: {res_json.get('top_predicted_crop', 'N/A')}")
            preds = res_json.get('predicted_crops', [])
            if preds:
                print("   Top Matches:")
                for r in preds[:3]:
                    print(f"      * {r.get('crop')}: Score {r.get('final_score')}/100 | Est. Profit: Rs. {r.get('predicted_profit', 0):,}/acre")
            print("="*55 + "\n")
            return res_json
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Server HTTP Error {e.code}: {e.read().decode('utf-8')}")
    except urllib.error.URLError as e:
        print(f"[ERROR] Could not connect to {url}. Is your backend running (`npm start`)? Error: {e.reason}")
    except Exception as e:
        print(f"[ERROR] Error sending reading: {e}")
    return None


def parse_soil_scout_block(block_text, farm_id=101, device_id="Soil-Scout-01"):
    """
    Parses a single 'Soil Scout Reading' multi-line text block.
    """
    data = {
        "farm_id": farm_id,
        "device_id": device_id,
    }

    temp_m = re.search(r"Temperature:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if temp_m: data["temperature"] = float(temp_m.group(1))

    ph_m = re.search(r"pH:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if ph_m: data["ph"] = float(ph_m.group(1))

    tds_m = re.search(r"TDS:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if tds_m: data["tds"] = float(tds_m.group(1))

    moist_m = re.search(r"Moisture:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if moist_m: data["moisture"] = float(moist_m.group(1))

    light_m = re.search(r"Light:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if light_m: data["light"] = float(light_m.group(1))

    rel_m = re.search(r"Reading reliable:\s*([^\r\n]+)", block_text, re.IGNORECASE)
    if rel_m: data["reliable"] = rel_m.group(1).strip()

    n_m = re.search(r"Estimated N:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if n_m: data["nitrogen"] = float(n_m.group(1))

    p_m = re.search(r"Estimated P:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if p_m: data["phosphorus"] = float(p_m.group(1))

    k_m = re.search(r"Estimated K:\s*([\d\.]+)", block_text, re.IGNORECASE)
    if k_m: data["potassium"] = float(k_m.group(1))

    return data


def run_test_simulation(host, farm_id):
    sample_text = """
---- Soil Scout Reading ----
Temperature: 31.10 C
pH: 0.31
TDS: 0.00 ppm
Moisture: 0.00 %
Light: 100.00 %
Reading reliable: no (too dry)
Estimated N: 0.00 kg/ha
Estimated P: 0.00 kg/ha
Estimated K: 0.00 kg/ha
"""
    print("[TEST] Running Soil Scout Test with your sensor reading:")
    print(sample_text)
    payload = parse_soil_scout_block(sample_text, farm_id=farm_id)
    print("[INFO] Parsed Payload JSON:")
    print(json.dumps(payload, indent=2))
    post_to_backend(payload, host=host)


def run_serial_listener(port, baud, host, farm_id):
    try:
        import serial
    except ImportError:
        print("[ERROR] 'pyserial' library not found. Install it with:")
        print("    pip install pyserial")
        sys.exit(1)

    print(f"[CONNECTING] Connecting to Soil Scout on {port} @ {baud} baud...")
    try:
        ser = serial.Serial(port, baud, timeout=1)
    except Exception as e:
        print(f"[ERROR] Failed to open serial port {port}: {e}")
        print("[TIP] Check Device Manager on Windows to confirm the correct COM port (e.g. COM3, COM4).")
        sys.exit(1)

    print(f"[CONNECTED] Connected to {port}! Listening for '---- Soil Scout Reading ----' blocks...")
    buffer_lines = []
    collecting = False

    while True:
        try:
            raw_line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not raw_line:
                continue

            print(f"[Serial] {raw_line}")

            if "Soil Scout Reading" in raw_line:
                collecting = True
                buffer_lines = [raw_line]
                continue

            if collecting:
                buffer_lines.append(raw_line)
                # When we have collected Estimated K or 8 lines, send payload
                if "Estimated K" in raw_line or len(buffer_lines) >= 10:
                    block_content = "\n".join(buffer_lines)
                    payload = parse_soil_scout_block(block_content, farm_id=farm_id)
                    post_to_backend(payload, host=host)
                    collecting = False
                    buffer_lines = []

        except KeyboardInterrupt:
            print("\n[STOPPING] Stopping serial bridge.")
            break
        except Exception as e:
            print(f"[WARNING] {e}")
            time.sleep(1)


def main():
    parser = argparse.ArgumentParser(description="Soil Scout Serial to Web Bridge")
    parser.add_argument("--port", type=str, default="COM3", help="Serial COM port (e.g. COM3, COM4, /dev/ttyUSB0)")
    parser.add_argument("--baud", type=int, default=115200, help="Serial baud rate (default: 115200 or 9600)")
    parser.add_argument("--host", type=str, default=DEFAULT_HOST, help=f"Backend base URL (default: {DEFAULT_HOST})")
    parser.add_argument("--farm", type=int, default=101, help="Target Farm ID (default: 101)")
    parser.add_argument("--test", action="store_true", help="Simulate sending the exact screenshot reading now")

    args = parser.parse_args()

    if args.test:
        run_test_simulation(args.host, args.farm)
    else:
        run_serial_listener(args.port, args.baud, args.host, args.farm)


if __name__ == "__main__":
    main()
