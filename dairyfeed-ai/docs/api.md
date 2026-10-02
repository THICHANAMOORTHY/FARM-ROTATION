# API reference

Device endpoints require the header `X-Device-Key`. Errors are returned as JSON with a clear message.
Full request and response examples arrive with each endpoint (Phases 1–2).

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
