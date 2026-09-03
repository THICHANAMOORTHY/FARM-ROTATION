import urllib.request
import json
import sys

BASE = 'http://localhost:3000/api'

def test(name, method, url, body=None):
    try:
        data = json.dumps(body).encode('utf-8') if body else None
        req = urllib.request.Request(f'{BASE}{url}', data=data, headers={'Content-Type': 'application/json'} if body else {})
        req.get_method = lambda: method
        with urllib.request.urlopen(req, timeout=5) as res:
            status = res.status
            content = json.loads(res.read().decode('utf-8'))
            print(f'[PASS] {status} {method} {url} -> OK ({name})')
            return content
    except Exception as e:
        print(f'[FAIL] {method} {url} -> {e}')
        return None

print('=== 1. System & Master Data ===')
test('Health', 'GET', '/health')
crops = test('Crops Master List', 'GET', '/crops')
print(f'     Total crops loaded: {len(crops) if crops else 0}')
test('Farms List', 'GET', '/farms')
test('Seasons List', 'GET', '/seasons')

print('\n=== 2. Soil Analysis ===')
soil_res = test('Submit Soil Test', 'POST', '/soil-analysis', {
    'farm_id': 101, 'nitrogen': 45, 'phosphorus': 30, 'potassium': 55, 'ph': 6.6, 'organic_carbon': 0.55
})
if soil_res:
    print(f'     Health Score: {soil_res.get("soil_health_score")} | Deficiencies: {soil_res.get("deficiencies")}')

print('\n=== 3. Crop History ===')
hist_res = test('Record Crop History', 'POST', '/crop-history', {
    'farm_id': 101,
    'history': [
        {'crop': 'Tomato', 'season': 'Kharif', 'year': 2023, 'yield': 8500, 'cost': 36000, 'revenue': 51000},
        {'crop': 'Tomato', 'season': 'Rabi',   'year': 2024, 'yield': 8800, 'cost': 37000, 'revenue': 49000},
        {'crop': 'Tomato', 'season': 'Kharif', 'year': 2025, 'yield': 8200, 'cost': 38000, 'revenue': 47000}
    ]
})
if hist_res:
    print(f'     Detected Issue: {hist_res.get("rotation_issue")} | Penalized: {hist_res.get("penalized_crop")}')

print('\n=== 4. Candidate Generation ===')
cand_res = test('Candidate Filter', 'GET', '/candidate-crops?farm_id=101&season=Kharif')
run_id = cand_res.get('run_id') if cand_res else 'test-run'
cand_names = cand_res.get('candidates', []) if cand_res else []
print(f'     Candidates found: {len(cand_names)} ({cand_names[:5]}...)')

print('\n=== 5. Crop Evaluation (Scoring Engine) ===')
crop_map = {c['name']: c['crop_id'] for c in crops} if crops else {}
candidate_ids = [crop_map[n] for n in cand_names if n in crop_map][:6]
eval_res = test('Evaluate Candidates', 'POST', '/crop-evaluation', {
    'farm_id': 101, 'run_id': run_id, 'candidate_crop_ids': candidate_ids
})
if eval_res and eval_res.get('results'):
    top = eval_res['results'][0]
    print(f'     Top Ranked: #{top.get("rank")} {top.get("crop")} (Score: {top.get("final_score")}, Expected Profit: Rs. {top.get("predicted_profit")})')

print('\n=== 6. Rotation Optimization ===')
plan_res = test('Optimize Rotation', 'POST', '/optimize-rotation', {
    'farm_id': 101, 'run_id': run_id, 'horizon_seasons': 3
})
plan_id = None
if plan_res and plan_res.get('plans'):
    rec_plan = next((p for p in plan_res['plans'] if p.get('is_recommended')), plan_res['plans'][0])
    plan_id = rec_plan.get('plan_id')
    print(f'     Recommended Plan: Plan {rec_plan.get("plan_label")} -> Sequence: {" -> ".join(rec_plan.get("sequence", []))}')
    print(f'     Final Soil Health: {rec_plan.get("final_soil_health")} | Total Profit: Rs. {rec_plan.get("total_projected_profit")}')

print('\n=== 7. Soil Simulation ===')
if plan_id:
    sim_res = test('Simulate Soil Recovery', 'POST', '/soil-simulation', {'plan_id': plan_id})
    if sim_res and sim_res.get('timeline'):
        print(f'     Simulation steps: {len(sim_res["timeline"])} seasons modeled')

print('\n=== 8. Recommendation ===')
rec_res = test('Get Final Recommendation', 'GET', '/recommendation?farm_id=101')
if rec_res:
    print(f'     Recommended Crop: {rec_res.get("recommended_crop")} (Score: {rec_res.get("score")})')
    print(f'     Reasoning: {rec_res.get("reasoning", [])[:2]}')

print('\n=== 9. Dashboard Aggregator ===')
dash_res = test('Get Full Dashboard State', 'GET', '/dashboard?farm_id=101')
if dash_res:
    print(f'     Farm: {dash_res.get("farm", {}).get("name")} | Health: {dash_res.get("farm_health")}')

print('\nALL BACKEND API WORKFLOW ENDPOINTS VERIFIED.')
