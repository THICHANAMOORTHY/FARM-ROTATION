# Demo script (about 8 minutes, no hardware needed)

Everything here uses the **device simulator**. Every sample it sends is marked **SIMULATED** on
screen, so say so up front: *"Our hardware is being assembled; the simulator sends exactly the
same data the device will, and it is always labelled as simulated."*

## Before the demo (once)

```bash
cd dairyfeed-ai/backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

In `backend/.env` set at least `DEVICE_API_KEY=demo-key` and `ADMIN_TOKEN=admin-demo`.
Leave the Supabase lines empty for an offline demo (data is kept in memory), or fill them in to
show the data appearing in Supabase.

```bash
cd ../frontend && npm install
```

## Start (three terminals)

```bash
# 1. backend
cd dairyfeed-ai/backend && source .venv/bin/activate
uvicorn app.main:app --reload

# 2. dashboard -> open http://localhost:5173 on a laptop, or on a phone on the same Wi-Fi
cd dairyfeed-ai/frontend && npm run dev -- --host

# 3. simulator (two weeks of history from two devices)
cd dairyfeed-ai/backend && source .venv/bin/activate
python scripts/simulate_device.py --count 40 --days 14 --devices DF01 DF02
```

## The demo

**1. The problem (30 s).** Bad silage looks like good silage; lab tests are slow and far away.
We give a first check at the pit in minutes.

**2. Dashboard (1 min).** Point at the latest test: big quality, score dial, three risk badges,
advice. Point out **Rule-based** (how the result was made) and **SIMULATED**. Point at the footer:
*screening tool, not a lab test.*

**3. A bad batch, live (1 min).** In terminal 3:

```bash
python scripts/simulate_device.py --profile poor --count 1 --days 0
```

Within 15 seconds the dashboard shows it: **Poor**, red, with the danger advice:
*"Do not feed until it is checked by a veterinarian or animal nutrition expert, or confirmed by a lab."*

**4. Tamil (30 s).** Tap **தமிழ்** in the header. Everything switches, including the advice.
The choice is remembered. Switch back.

**5. Why this score? (1.5 min).** Tap **View details**:
- the readings (pH, moisture, both temperatures, colour swatch),
- the photo (here a placeholder that says SIMULATED),
- **How the score was made**: points per component. *"No photo, so not scored"* for visual:
  we never invent a value.
- Mould risk **Unknown**: *we don't guess mould until an image model trained on expert labels
  passes validation.*

**6. History and trends (1 min).** Open **History**. Shaded bands are the ideal ranges (they come
straight from the scoring config). Filter by device **DF02**, then by a date. On a phone, the
table becomes a simple list.

**7. Experts teach the AI (1.5 min).** On a sample's page tap **Label this sample**. Enter the
admin token (`admin-demo`), pick the true quality, your name and how it was judged, **Save**.
Point at the yellow note: *simulated data is never used for training.*

Then show the safety gate in terminal 3:

```bash
cd ../ml && python train_tabular.py
```

It prints **REFUSED to train**. *"Training only runs on real, expert-labelled samples, at least 15
per class, and a model is used only if it passes cross-validation. Until then every result is
honestly Rule-based."*

**8. Devices (30 s).** Open **Devices**: last seen, waiting-to-sync count, last reading.

**9. Close (30 s).** Hardware: ESP32 with pH (through an ADS1115), moisture, two temperature
probes and a TCS3200 colour sensor; an ESP32-CAM for the photo; offline queue coming. Show
`docs/wiring.md` if asked.

## Likely questions

| Question | Short answer |
|---|---|
| Is this AI? | The pipeline is built and tested; it trains only on real expert labels and is gated by validation. Until data exists, results are rule-based and say so. |
| Can it detect aflatoxin? | No. It is a screening tool; for toxins or nutrition a lab test is needed. The advice says so for risky samples. |
| Why trust the score? | Every result shows the points per component, and every threshold is in one file, marked provisional, for experts to tune. |
| What if there's no internet? | The device scores on its own OLED and queues readings, syncing later (Phase 4, with the hardware). The backend already accepts offline batches safely. |
| What about mould? | Unknown until a photo model trained on expert mould labels passes validation. We chose not to guess. |
| Cost? | ESP32 + ADS1115 + sensors + ESP32-CAM; mostly low-cost hobby parts. |

## If something goes wrong

| Symptom | Fix |
|---|---|
| Dashboard says "Could not load data" | The backend isn't running (terminal 1) |
| Simulator: "Cannot reach http://localhost:8000" | Same: start the backend first |
| Simulator: "Server said 401" | `DEVICE_API_KEY` in `backend/.env` doesn't match; restart the backend after editing `.env` |
| Label: "Invalid X-Admin-Token" | Use the `ADMIN_TOKEN` from `backend/.env` |
| Data gone after restart | Expected without Supabase (in-memory). Re-run the simulator. |
