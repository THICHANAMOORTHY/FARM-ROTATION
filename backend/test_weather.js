// Test Weather API endpoints
const assert = require('assert');

async function testWeather() {
  console.log('Testing Weather APIs...');

  // 1. Default weather
  const res1 = await fetch('http://localhost:3000/api/weather');
  assert.strictEqual(res1.status, 200, 'Default weather should return 200');
  const d1 = await res1.json();
  assert(d1.current, 'Should have current weather');
  assert(typeof d1.current.temperature === 'number', 'Temperature should be number');
  assert(d1.forecast && d1.forecast.length > 0, 'Should have forecast array');
  assert(d1.advisories && d1.advisories.length > 0, 'Should have advisories array');
  console.log(`[PASS] Default weather: ${d1.location.name} -> ${d1.current.temperature}°C, ${d1.current.label} (${d1.current.icon})`);

  // 2. Farm weather (Nashik - 102)
  const res2 = await fetch('http://localhost:3000/api/weather?farm_id=102');
  assert.strictEqual(res2.status, 200, 'Farm 102 weather should return 200');
  const d2 = await res2.json();
  console.log(`[PASS] Nashik weather: ${d2.location.name} -> ${d2.current.temperature}°C, Humidity: ${d2.current.humidity}%`);

  // 3. Search geocoding
  const res3 = await fetch('http://localhost:3000/api/weather/search?q=Pune');
  assert.strictEqual(res3.status, 200, 'Search should return 200');
  const d3 = await res3.json();
  assert(d3.results && d3.results.length > 0, 'Should return search results for Pune');
  console.log(`[PASS] Geocoding search: Found ${d3.results.length} locations for 'Pune'. Top: ${d3.results[0].display_name}`);

  console.log('\nALL WEATHER API TESTS PASSED SUCCESSFULLY! 🌤️');
}

testWeather().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
