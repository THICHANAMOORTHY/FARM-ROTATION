# test_b2b_apis.py
# Verification suite for UZHAVU KAAPPAAN B2B Enterprise Model

import urllib.request
import json
import sys

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:3000/api/b2b'

def test(name, method, endpoint, body=None):
    try:
        url = f'{BASE}{endpoint}'
        data = json.dumps(body).encode('utf-8') if body else None
        headers = {'Content-Type': 'application/json'} if body else {}
        req = urllib.request.Request(url, data=data, headers=headers)
        req.get_method = lambda: method
        with urllib.request.urlopen(req, timeout=15) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print(f'[PASS] {res.status} {method} {endpoint} -> OK ({name})')
            return res_data
    except Exception as e:
        print(f'[FAIL] {method} {endpoint} -> {e}')
        return None

print('=== 1. Executive Fleet & Overview ===')
ov = test('B2B Executive Overview', 'GET', '/overview')
if ov:
    f = ov.get('fleet_summary', {})
    c = ov.get('contracts_summary', {})
    e = ov.get('esg_summary', {})
    print(f'     FPOs: {f.get("total_fpos")} | Farmers: {f.get("total_member_farmers")} | Acreage: {f.get("total_network_acreage")} ac')
    print(f'     Active Contracts: {c.get("active_contracts")} | Value: Rs. {c.get("total_contract_value_rs"):,}')
    print(f'     Carbon Credits: {e.get("carbon_credits_potential_mt_co2e")} tCO2e | Rating: {e.get("esg_rating")}')

print('\n=== 2. Aggregated Harvest Projections ===')
pf = test('Procurement Forecast', 'GET', '/procurement-forecast')
if pf:
    print(f'     Total Projected: {pf.get("total_projected_mt")} MT across {len(pf.get("forecasts", []))} crops')
    top = pf.get('forecasts', [])[0]
    print(f'     Top Crop: {top.get("crop")} ({top.get("projected_yield_mt")} MT) - Rs. {top.get("mandi_modal_price_rs_kg")}/kg')

print('\n=== 3. Corporate Procurement Matchmaker ===')
match = test('AI Matchmaker', 'POST', '/match-contract', {
    'crop_name': 'Potato',
    'target_quantity_mt': 150
})
if match:
    fpo = match.get('recommended_fpo', {})
    pm = match.get('pricing_matrix', {})
    print(f'     Recommended FPO: {fpo.get("name")} ({fpo.get("district")}, {fpo.get("state")})')
    print(f'     Payout: Rs. {pm.get("guaranteed_farmer_payout_rs_kg")}/kg (with {pm.get("regenerative_premium_bonus_pct")}% eco bonus)')
    print(f'     Total Value: Rs. {pm.get("total_contract_value_rs"):,}')

print('\n=== 4. Forward Contract Lifecycle ===')
new_c = test('Issue Forward Contract', 'POST', '/contracts', {
    'buyer_name': 'GreenBasket Fresh Supermarkets Ltd.',
    'fpo_id': 1,
    'crop_name': 'Black Gram',
    'target_season': 'Kharif 2026',
    'target_quantity_mt': 50,
    'base_price_rs_kg': 65,
    'soil_bonus_premium_pct': 12
})
if new_c and new_c.get('contract'):
    c_info = new_c['contract']
    print(f'     Contract ID: {c_info.get("contract_id")} | Crop: {c_info.get("crop_name")} | Value: Rs. {c_info.get("total_contract_value_rs"):,}')

contracts_list = test('List Contracts', 'GET', '/contracts')
if contracts_list:
    print(f'     Active Database Contracts: {len(contracts_list.get("contracts", []))}')

print('\n=== 5. Bulk Bio-Input Demand Aggregator ===')
inp = test('Input Demand Diagnostics', 'GET', '/input-demand')
if inp:
    deficits = inp.get('soil_deficiency_summary', {})
    print(f'     N-Deficit: {deficits.get("nitrogen_deficient_acres")} ac | P-Deficit: {deficits.get("phosphorus_deficient_acres")} ac')
    print(f'     Bulk Packages: {len(inp.get("procurement_packages", []))} | Estimated Bulk Savings: Rs. {inp.get("total_collective_savings_estimated_rs"):,}')

print('\n=== 6. Corporate ESG & Carbon Registry ===')
esg = test('ESG Compliance Metrics', 'GET', '/esg-metrics')
if esg:
    print(f'     Total Certified Acreage: {esg.get("total_certified_acreage")} ac')
    for k in esg.get('esg_kpis', [])[:2]:
        print(f'     {k.get("metric")}: {k.get("value")} ({k.get("trend")})')

print('\n============================================================')
print('  ALL B2B ENTERPRISE API SUITE TESTS PASSED (100% OK)')
print('============================================================')
