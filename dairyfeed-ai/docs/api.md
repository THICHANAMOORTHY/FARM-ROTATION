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
