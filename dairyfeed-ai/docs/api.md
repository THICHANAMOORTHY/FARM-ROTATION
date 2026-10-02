# API reference

Device endpoints require the header `X-Device-Key`. Errors are returned as JSON with a clear message.
Read endpoints (history, detail, image, advisory, stats) are open, with no key, so the dashboard
can show results. Labelling needs the header `X-Admin-Token`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/silage/test` | Device sends readings → returns prediction + advisory |
| POST | `/api/silage/bulk` | Offline sync: list of readings, idempotent on `sample_id` |
| POST | `/api/image/analyze` | Multipart image + `sample_id` → stores image, updates mould risk |
| GET | `/api/silage/history` | Filter by device, farm, date range, feed type; paginated |
| GET | `/api/silage/{sample_id}` | Full sample detail |
| GET | `/api/silage/{sample_id}/image` | Stream the image |
| GET | `/api/advisory/{sample_id}` | Advisory only |
| POST | `/api/silage/{sample_id}/label` | Expert labelling (admin token) |
| GET | `/api/stats/summary` | Counts by quality / risk |
| GET | `/api/devices` | Devices: last seen, pending sync, latest sample |
| GET | `/api/scoring` | Score weights and ideal ranges (from `scoring_config.yaml`) |

Readings and images can arrive in either order. The prediction is recomputed whenever either arrives.

## POST /api/silage/test

Header: `X-Device-Key`. Body:

```json
{
  "sample_id": "DF01-20261002T103015-0007",
  "device_id": "DF01",
  "created_at": "2026-10-02T10:30:15+05:30",
  "feed_type": "maize_silage",
  "farm_id": "optional",
  "readings": {
    "ph": 4.2, "moisture_pct": 64.0, "sample_temp_c": 28.4, "ambient_temp_c": 27.1,
    "moisture_raw": 2150, "rgb": {"r": 112, "g": 98, "b": 41}
  },
  "flags": {"simulated": false, "demo": false}
}
```

- `sample_id` must start with `device_id` followed by `-`.
- Send `created_at` only if the device clock is NTP-synced. Without it, server time is used and
  `time_source` is `server`.
- `moisture_raw`, `rgb`, `farm_id`, `created_at` and `flags` are optional; the four main readings are required.

Responses:

| Code | When |
|---|---|
| 200 | The full sample (CLAUDE.md section 4 shape) with `prediction` and `advisory` |
| 200 | Same `sample_id` sent again: the first stored result is returned unchanged, so retries are safe |
| 401 | `X-Device-Key` missing or wrong |
| 409 | The `sample_id` already belongs to another device |
| 422 | A value is missing or out of range; `detail` says which |
| 503 | `DEVICE_API_KEY` is not set on the server |

## GET /api/health

`{"status": "ok", "database": "supabase"}`, or `"memory"` when Supabase is not configured.

## POST /api/silage/bulk

Header: `X-Device-Key`. Body: `{"items": [ ... ]}` with 1–50 items, each shaped like the
`/api/silage/test` body. Each item is checked on its own, so one bad item never blocks the rest.
Stored samples get `synced_from_offline: true`.

```json
{"results": [
  {"sample_id": "DF01-...-0007", "status": "saved", "detail": null},
  {"sample_id": "DF01-...-0008", "status": "duplicate", "detail": null},
  {"sample_id": "DF01-...-0009", "status": "rejected", "detail": "readings.ph: Input should be less than or equal to 14"}
]}
```

| Status | Meaning | What the device does |
|---|---|---|
| `saved` | Stored now | Delete from queue |
| `duplicate` | Already stored earlier | Delete from queue |
| `rejected` | Can never be accepted (bad data, or another device's `sample_id`) | Log it, delete from queue |

## POST /api/image/analyze

Header: `X-Device-Key`. Multipart form: `sample_id` (text) and `image` (JPEG file, at most 5 MB).

- Stored in Supabase Storage as `silage-images/<device_id>/<sample_id>.jpg`. The device_id is the
  part of `sample_id` before the first `-`.
- Works before or after the readings arrive. Before: the sample waits with `prediction: null`.
- A second photo for the same `sample_id` is ignored and the stored sample is returned.
- Mould risk stays `Unknown` until a validated image model exists.
- Errors: 401 bad key, 413 too large, 415 not a JPEG, 422 bad `sample_id`.

## GET /api/silage/history

Query parameters, all optional: `device_id`, `farm_id`, `feed_type`, `date_from`, `date_to`,
`page` (from 1), `page_size` (1–100, default 20). Dates are ISO date-times; with no timezone, UTC
is assumed. In a URL, write `+` in a timezone as `%2B` (for example `2026-10-02T00:00:00%2B05:30`).

```json
{"items": [ /* samples, newest first */ ], "total": 42, "page": 1, "page_size": 20}
```

## GET /api/silage/{sample_id}

The full sample. 404 if it doesn't exist.

## GET /api/silage/{sample_id}/image

The JPEG photo. 404 if the sample doesn't exist or has no photo yet.

## GET /api/advisory/{sample_id}

`{"level": "warn", "en": "...", "ta": "..."}`. 404 if the sample doesn't exist, or its readings
have not arrived yet.

## POST /api/silage/{sample_id}/label

Header: `X-Admin-Token`. Body:

```json
{"quality": "Poor", "mould": "High", "spoilage": null,
 "labelled_by": "Dr. Name", "reference": "expert visual"}
```

`quality`, `labelled_by` and `reference` are required. A new label replaces the old one. The
device's prediction is never changed. Returns the full sample.

## GET /api/stats/summary

Optional `device_id`. Counts for the dashboard cards:

```json
{"total": 4, "awaiting_readings": 1,
 "by_quality": {"Good": 2, "Moderate": 0, "Poor": 1},
 "by_spoilage_risk": {"Low": 2, "Medium": 0, "High": 1},
 "by_mould_risk": {"Low": 0, "High": 0, "Unknown": 4},
 "labelled": 1}
```

`awaiting_readings` counts samples that have a photo but no readings yet, so they have no quality.

## GET /api/devices

Every device that has sent data, sorted by `device_id`:

```json
[{"device_id": "DF01", "name": null, "last_seen_at": "2026-10-02T10:31:00Z",
  "pending_sync": 0, "last_sample": { /* full sample, or null */ }}]
```

`pending_sync` is reported by the device once the offline queue exists (Phase 4); until then it is 0.

## GET /api/scoring

The weights and ideal ranges from `scoring_config.yaml`, so the dashboard never copies them:

```json
{"weights": {"ph": 40, "moisture": 30, "temperature": 20, "visual": 10},
 "ideal": {"ph": [3.8, 4.5], "moisture_pct": [60, 70], "temperature_rise_max_c": 3.0},
 "provisional": true}
```
