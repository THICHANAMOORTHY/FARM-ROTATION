# Frontend — React dashboard

React + Vite + Tailwind + Recharts + react-i18next, designed for phones first. English / தமிழ்
toggle in the header (remembered in the browser). Light and dark mode follow the phone's setting.

**Status:** Phase 6 done.

## Pages

| Page | URL | What it shows |
|---|---|---|
| Dashboard | `#/` | Latest test (quality, score dial, three risk badges, advice) and counts. Refreshes every 15 s. |
| History | `#/history` | Filters (device, feed type, dates), trend charts (pH, moisture, temperature, score) with the ideal ranges shaded, and the list of tests |
| Sample detail | `#/sample/<sample_id>` | Readings, photo, how the score was made, advice, expert label |
| Label | `#/label/<sample_id>` | Expert labelling form (needs the admin token) |
| Devices | `#/devices` | Each device: last seen, waiting-to-sync count, last reading |

Every result shows **Rule-based** or **AI model vN**. Samples from the simulator carry a
**Simulated** badge. The footer always says this is a screening tool, not a lab test.

## Run it

```bash
cd dairyfeed-ai/frontend
npm install
npm run dev            # http://localhost:5173 — /api is forwarded to the backend on :8000
```

Start the backend first (`uvicorn app.main:app --reload` in `backend/`). With no hardware, fill it
with simulated tests: `python scripts/simulate_device.py --count 40 --days 14 --devices DF01 DF02`.

## Checks

```bash
npm run lint           # ESLint
npm run format:check   # Prettier (npm run format to fix)
npm run check:i18n     # en.json and ta.json have the same keys
npm run build          # production build into dist/
```

## Production

`npm run build` makes a static site in `dist/` that any static host can serve (hash URLs need no
server rules). Set `VITE_API_URL` (see `.env.example`) to the backend's address when it is on a
different domain, and add the dashboard's address to `CORS_ORIGINS` in `backend/.env`.

## Notes

- **Tamil text:** every string in `src/i18n/ta.json` was machine-drafted and needs review by a
  native Tamil speaker. The advice text itself comes from the backend in both languages.
- **Colours:** status colours (green / amber / red) always come with an icon and words. Chart lines
  use blue and orange, checked for colour-blind separation in light and dark mode.
- **Admin token** for labelling is kept in `sessionStorage`, so it is forgotten when the tab closes.
- The charts library is large, so the History page loads separately the first time it is opened.
