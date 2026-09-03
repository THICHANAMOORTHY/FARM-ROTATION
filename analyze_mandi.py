import csv, collections, statistics

path = r'C:\Users\lokes\.cache\kagglehub\datasets\arjunyadav99\indian-agricultural-mandi-prices-20232025\versions\1\Agriculture_price_dataset.csv'

commodity_prices = collections.defaultdict(list)
rows = 0

with open(path, newline='', encoding='utf-8', errors='replace') as fp:
    reader = csv.DictReader(fp)
    for r in reader:
        rows += 1
        c = r.get('Commodity', '').strip()
        p = r.get('Modal_Price', '')
        if c and p:
            try:
                price = float(p)
                if price > 50 and price < 500000:
                    commodity_prices[c].append(price)
            except: pass

print(f"TOTAL ROWS: {rows:,}")
print(f"UNIQUE COMMODITIES: {len(commodity_prices)}")
print("\nTop 30 Commodities and their Real Mandi Modal Prices (2023-2025):")
print(f"{'Commodity':<25} | {'Records':<8} | {'Median Rs/q':<12} | {'Rs/kg':<8}")
print("-" * 60)

for comm, pr in sorted(commodity_prices.items(), key=lambda x: -len(x[1]))[:30]:
    med_q = statistics.median(pr)
    rs_kg = round(med_q / 100.0, 2)
    print(f"{comm:<25} | {len(pr):<8} | Rs. {med_q:<8.0f} | Rs. {rs_kg:.2f}/kg")
