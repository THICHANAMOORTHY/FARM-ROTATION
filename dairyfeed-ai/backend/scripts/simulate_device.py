"""Device simulator: acts like the sensor node and camera node, with no hardware.

Sends realistic readings to the backend so the dashboard can be built and demonstrated.
EVERY sample it sends is marked simulated (flags.simulated = true). The ML export skips
simulated samples, so they can never be used to train a model. There is no option to turn
that flag off.

Examples (run from dairyfeed-ai/backend, with the server running):

    python scripts/simulate_device.py                      # 10 samples, mixed quality, DF01
    python scripts/simulate_device.py --count 40 --days 14 --devices DF01 DF02
    python scripts/simulate_device.py --profile poor --count 3
    python scripts/simulate_device.py --offline            # one batch via /api/silage/bulk
    python scripts/simulate_device.py --no-photo           # readings only

The device key is read from --key, or DEVICE_API_KEY in the environment or backend/.env.
"""

import argparse
import os
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import httpx

PHOTO = Path(__file__).with_name("simulated_photo.jpg")  # a grey card that says "SIMULATED"

# Typical ranges for each quality profile (provisional, matching scoring_config.yaml's ideas).
PROFILES: dict[str, dict[str, tuple[float, float]]] = {
    "good": {"ph": (3.8, 4.4), "moisture": (60, 70), "rise": (-1.0, 2.0)},
    "moderate": {"ph": (4.5, 4.9), "moisture": (55, 74), "rise": (2.0, 5.0)},
    "poor": {"ph": (5.0, 6.0), "moisture": (45, 85), "rise": (5.0, 11.0)},
}
FEED_TYPES = ["maize_silage", "sorghum_silage", "napier_silage"]


def make_reading(profile: str, rng: random.Random) -> dict[str, Any]:
    """One set of readings, shaped exactly like the firmware's JSON."""
    ranges = PROFILES[profile]
    ambient = rng.uniform(24, 34)  # Tamil Nadu shed temperatures
    # Better silage is yellow-green/olive; spoiled silage is darker and browner.
    darkness = {"good": 0, "moderate": 25, "poor": 55}[profile]
    return {
        "ph": round(rng.uniform(*ranges["ph"]), 2),
        "moisture_pct": round(rng.uniform(*ranges["moisture"]), 1),
        "moisture_raw": rng.randint(11000, 15000),
        "sample_temp_c": round(ambient + rng.uniform(*ranges["rise"]), 1),
        "ambient_temp_c": round(ambient, 1),
        "rgb": {
            "r": max(0, rng.randint(120, 160) - darkness),
            "g": max(0, rng.randint(110, 150) - darkness),
            "b": max(0, rng.randint(30, 60) - darkness // 2),
        },
    }


def make_sample(device_id: str, created_at: datetime, counter: int, profile: str, rng: random.Random) -> dict[str, Any]:
    return {
        "sample_id": f"{device_id}-{created_at:%Y%m%dT%H%M%S}-{counter % 10000:04d}",
        "device_id": device_id,
        "created_at": created_at.isoformat(),
        "feed_type": rng.choice(FEED_TYPES),
        "readings": make_reading(profile, rng),
        "flags": {"simulated": True},  # always: simulated data must never be mistaken for real data
    }


def pick_profile(requested: str, rng: random.Random) -> str:
    if requested != "mix":
        return requested
    return rng.choices(["good", "moderate", "poor"], weights=[6, 3, 1])[0]


def run(
    client: httpx.Client,
    key: str,
    count: int = 10,
    devices: list[str] | None = None,
    profile: str = "mix",
    days: int = 7,
    offline: bool = False,
    photo: bool = True,
    seed: int | None = None,
) -> list[dict[str, Any]]:
    """Send `count` simulated samples. Returns the server's responses (or bulk results)."""
    rng = random.Random(seed)
    devices = devices or ["DF01"]
    headers = {"X-Device-Key": key}
    now = datetime.now(timezone.utc).replace(microsecond=0)

    # Spread samples over the last `days` days, oldest first, so trend charts have something to show.
    samples = []
    for i in range(count):
        created_at = now - timedelta(days=days) + timedelta(seconds=(days * 86400) * (i + 1) / count)
        created_at -= timedelta(seconds=rng.randint(0, 600))
        samples.append(make_sample(rng.choice(devices), created_at, rng.randint(1, 9999), pick_profile(profile, rng), rng))

    results = []
    if offline:
        for start in range(0, len(samples), 50):  # the API takes at most 50 per batch
            response = client.post("/api/silage/bulk", json={"items": samples[start : start + 50]}, headers=headers)
            response.raise_for_status()
            results.extend(response.json()["results"])
    else:
        for sample in samples:
            response = client.post("/api/silage/test", json=sample, headers=headers)
            response.raise_for_status()
            results.append(response.json())

    if photo:
        data = PHOTO.read_bytes()
        for sample in samples:
            response = client.post(
                "/api/image/analyze",
                data={"sample_id": sample["sample_id"]},
                files={"image": (f"{sample['sample_id']}.jpg", data, "image/jpeg")},
                headers=headers,
            )
            response.raise_for_status()
    return results


def read_key_from_env_file() -> str:
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.strip().startswith("DEVICE_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"')
    return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Send SIMULATED silage samples to the DairyFeed AI backend.")
    parser.add_argument("--url", default="http://localhost:8000", help="backend base URL")
    parser.add_argument("--key", default=os.environ.get("DEVICE_API_KEY") or read_key_from_env_file())
    parser.add_argument("--count", type=int, default=10)
    parser.add_argument("--devices", nargs="+", default=["DF01"])
    parser.add_argument("--profile", choices=["mix", "good", "moderate", "poor"], default="mix")
    parser.add_argument("--days", type=int, default=7, help="spread samples over the last N days")
    parser.add_argument("--offline", action="store_true", help="send as one offline sync via /api/silage/bulk")
    parser.add_argument("--no-photo", action="store_true", help="don't upload the placeholder photo")
    parser.add_argument("--seed", type=int, help="repeatable random readings")
    args = parser.parse_args()

    if not args.key:
        parser.error("no device key: pass --key or set DEVICE_API_KEY in backend/.env")

    with httpx.Client(base_url=args.url, timeout=15) as client:
        try:
            results = run(client, args.key, args.count, args.devices, args.profile, args.days,
                          args.offline, not args.no_photo, args.seed)
        except httpx.HTTPStatusError as error:
            raise SystemExit(f"Server said {error.response.status_code}: {error.response.text}") from error
        except httpx.ConnectError as error:
            raise SystemExit(f"Cannot reach {args.url}. Is the backend running? ({error})") from error

    for r in results:
        if args.offline:
            print(f"{r['sample_id']}: {r['status']}")
        else:
            p = r["prediction"]
            print(f"{r['sample_id']}: {p['quality']:<8} score {p['score']:>3}  spoilage {p['spoilage_risk']}")
    print(f"Sent {len(results)} SIMULATED samples to {args.url}")


if __name__ == "__main__":
    main()
