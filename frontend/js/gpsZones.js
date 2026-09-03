// ============================================================
// gpsZones.js — GPS Precision Farm Zone Allocation & Soil Analysis
// ============================================================

(function() {
  let zonesData = null;
  let activeZoneId = 'ZONE-A';
  let currentLat = 11.0168;
  let currentLon = 76.9558;

  async function loadGpsZones(lat = currentLat, lon = currentLon) {
    const container = document.getElementById('gps-zones-container');
    if (container) {
      container.innerHTML = `<div class="loading-spinner">🛰️ Analyzing GPS Micro-Zones & Spatial Soil Data…</div>`;
    }

    try {
      const res = await fetch(`/api/gps-zones?farm_id=${window.state?.farm_id || 101}&lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      zonesData = data;
      renderGpsZonesView();
    } catch (err) {
      console.error('Failed to load GPS zones:', err);
      if (container) {
        container.innerHTML = `<div class="chip danger">⚠️ Could not load GPS zone data. Please check backend connection.</div>`;
      }
    }
  }

  function renderGpsZonesView() {
    const container = document.getElementById('gps-zones-container');
    if (!container || !zonesData) return;

    const farm = zonesData.farm;
    const zones = zonesData.zones;
    const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
    const activeZone = zones.find(z => z.zone_id === activeZoneId) || zones[0];

    container.innerHTML = `
      <!-- GPS Location & Geofencing Header Bar -->
      <div class="location-selector-bar mb-20">
        <div class="loc-select-wrap">
          <span class="loc-select-label">🛰️ ${isTa ? 'ஜிபிஎஸ் இருப்பிடம்:' : 'GPS Coordinates:'}</span>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span class="chip info" style="font-family:monospace;font-size:13px">
              📍 Lat: ${farm.center_gps[0].toFixed(4)}° N, Lon: ${farm.center_gps[1].toFixed(4)}° E
            </span>
            <span class="chip success">
              📐 ${farm.total_acres} Acres · ${farm.total_zones} Precision Micro-Zones
            </span>
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="detectLiveGpsLocation()" style="font-size:12px;padding:6px 14px">
            <span>📡</span> ${isTa ? 'நேரடி ஜிபிஎஸ் கண்டறி (Detect Live GPS)' : 'Detect My Live GPS'}
          </button>
          <button class="btn btn-secondary" onclick="exportGpsZoneSummary()" style="font-size:12px;padding:6px 14px">
            <span>📋</span> ${isTa ? 'மண்டல அறிக்கை (Export Zones)' : 'Export Zone Report'}
          </button>
        </div>
      </div>

      <!-- Precision KPIs -->
      <div class="kpi-grid mb-24">
        <div class="glass-card kpi-card">
          <div class="card-label">${isTa ? 'மொத்த நிலப்பரப்பு' : 'Total Farm Area'}</div>
          <div class="kpi-value green">${farm.total_acres} <span style="font-size:14px;color:#94a3b8">Acres</span></div>
          <div class="kpi-meta">${isTa ? '4 துல்லிய வேளாண் மண்டலங்கள்' : 'Divided into 4 GPS Micro-Zones'}</div>
        </div>
        <div class="glass-card kpi-card">
          <div class="card-label">${isTa ? 'சராசரி மண் வள மதிப்பீடு' : 'Avg. Spatial Soil Score'}</div>
          <div class="kpi-value ${farm.average_soil_score >= 70 ? 'green' : farm.average_soil_score >= 50 ? 'amber' : 'red'}">
            ${farm.average_soil_score} <span style="font-size:14px;color:#94a3b8">/ 100</span>
          </div>
          <div class="kpi-meta">${isTa ? 'மண்டல வாரியான வேறுபாடுகள்' : 'Spatial Soil Heterogeneity Index'}</div>
        </div>
        <div class="glass-card kpi-card">
          <div class="card-label">${isTa ? 'எதிர்பார்க்கப்படும் மொத்த லாபம்' : 'Projected Farm Profit'}</div>
          <div class="kpi-value green">₹${farm.total_projected_profit.toLocaleString('en-IN')}</div>
          <div class="kpi-meta">${isTa ? 'துல்லிய பயிர் ஒதுக்கீடு மூலம்' : 'Optimized per zone allocation'}</div>
        </div>
        <div class="glass-card kpi-card">
          <div class="card-label">${isTa ? 'உரச் சேமிப்பு சதவீதம்' : 'Input Cost Reduction'}</div>
          <div class="kpi-value teal">35% <span style="font-size:14px;color:#94a3b8">Saved</span></div>
          <div class="kpi-meta">${isTa ? 'தேவைக்கேற்ப மாறுபடும் உரமிடுதல்' : 'Variable-Rate Nutrition Control'}</div>
        </div>
      </div>

      <!-- Main Interactive GPS Plot & Zone Inspector Grid -->
      <div class="charts-grid mb-24">
        
        <!-- Left: Interactive Spatial Farm Grid Map -->
        <div class="glass-card">
          <div class="card-title mb-12 flex justify-between items-center">
            <span>🗺️ ${isTa ? 'பண்ணை நில வரைபடம் & மண் மண்டலங்கள்' : 'Farm Spatial Map & Soil Condition Heatmap'}</span>
            <span style="font-size:11px;color:#94a3b8">${isTa ? 'மண்டலத்தை கிளிக் செய்யவும்' : 'Click any zone to inspect'}</span>
          </div>

          <!-- Farm Visual Grid Plot -->
          <div class="gps-farm-plot-container">
            <div class="gps-plot-grid">
              ${zones.map(z => {
                const isSelected = z.zone_id === activeZoneId;
                const scoreColor = z.soil_health_score >= 70 ? '#10b981' : z.soil_health_score >= 60 ? '#f59e0b' : '#ef4444';
                return `
                  <div class="gps-zone-card ${isSelected ? 'active' : ''}" onclick="selectGpsZone('${z.zone_id}')" style="border-top: 4px solid ${scoreColor}">
                    <div class="gps-zone-header">
                      <span class="gps-zone-tag">${z.zone_id}</span>
                      <span class="gps-zone-score" style="color:${scoreColor}">Score: ${z.soil_health_score}/100</span>
                    </div>
                    <div class="gps-zone-title">${isTa ? z.tamil_name : z.zone_name}</div>
                    <div class="gps-zone-meta">
                      <span>📐 ${z.area_acres} Ac</span> · <span>⛰️ ${z.elevation_m}m</span>
                    </div>
                    
                    <div class="gps-zone-soil-pill">
                      <span>🧪 N: <b>${z.soil_data.nitrogen}</b></span>
                      <span>P: <b>${z.soil_data.phosphorus}</b></span>
                      <span>pH: <b>${z.soil_data.ph}</b></span>
                    </div>

                    <div class="gps-zone-crop-badge">
                      <span>🌱 ${isTa ? z.allocated_crop.tamil_name : z.allocated_crop.name}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div class="gps-legend-strip mt-12">
              <span class="gps-legend-item"><span class="legend-dot" style="background:#10b981"></span> ${isTa ? 'சிறந்த மண் வளம் (70-100)' : 'Optimal Soil (>70)'}</span>
              <span class="gps-legend-item"><span class="legend-dot" style="background:#f59e0b"></span> ${isTa ? 'மிதமான சத்து குறைவு (60-69)' : 'Moderate Depletion (60-69)'}</span>
              <span class="gps-legend-item"><span class="legend-dot" style="background:#ef4444"></span> ${isTa ? 'கடுமையான தழைச்சத்து குறைவு (<60)' : 'Critical Deficit (<60)'}</span>
            </div>
          </div>
        </div>

        <!-- Right: Active Zone Precision Inspector & Tailored Action -->
        <div class="glass-card">
          <div class="card-title mb-12 flex justify-between items-center">
            <span>🔬 ${isTa ? 'தேர்ந்தெடுக்கப்பட்ட மண்டல ஆய்வு' : 'Selected Zone Diagnostic Inspector'}</span>
            <span class="chip info">${activeZone.zone_id} (${activeZone.area_acres} Acres)</span>
          </div>

          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:14px;border-radius:10px;margin-bottom:14px">
            <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:4px">
              ${isTa ? activeZone.tamil_name : activeZone.zone_name}
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">
              📍 GPS: ${activeZone.gps_coordinates.center[0].toFixed(4)}° N, ${activeZone.gps_coordinates.center[1].toFixed(4)}° E | ⛰️ Elevation: ${activeZone.elevation_m}m | 🌿 Soil: ${activeZone.soil_texture}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <span class="chip ${activeZone.soil_health_score >= 70 ? 'success' : 'danger'}">Health: ${activeZone.soil_health_score}/100</span>
              <span class="chip warning">${activeZone.fertility_status}</span>
              <span class="chip teal">Moisture: ${activeZone.soil_data.soil_moisture_pct}%</span>
            </div>
          </div>

          <!-- Zone Crop Allocation Highlight -->
          <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);padding:14px;border-radius:10px;margin-bottom:14px">
            <div style="font-size:11px;font-weight:700;color:#10b981;text-transform:uppercase;margin-bottom:2px">
              ${isTa ? 'இம்மண்டலத்திற்கு ஒதுக்கப்பட்ட பயிர்' : 'Optimally Allocated Precision Crop'}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div>
                <div style="font-size:20px;font-weight:800;color:#86efac">
                  🌱 ${isTa ? activeZone.allocated_crop.tamil_name : activeZone.allocated_crop.name}
                </div>
                <div style="font-size:12px;color:#cbd5e1">
                  ${activeZone.allocated_crop.family} · ${activeZone.allocated_crop.growth_days} Days · Seed: ${activeZone.allocated_crop.seed_rate_kg_acre} kg/ac
                </div>
              </div>
              <div style="text-align:right">
                <div style="font-size:11px;color:#94a3b8">${isTa ? 'எதிர்பார்க்கப்படும் லாபம்' : 'Zone Net Profit'}</div>
                <div style="font-size:18px;font-weight:800;color:#10b981">₹${activeZone.allocated_crop.zone_total_profit.toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div style="font-size:11.5px;color:#94a3b8;line-height:1.4;margin-top:8px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px">
              <b>Agronomic Rationale:</b> ${activeZone.allocated_crop.biological_objective}
            </div>
          </div>

          <!-- Variable-Rate Soil Feeding Prescription -->
          <div>
            <div style="font-size:13px;font-weight:700;color:#ffffff;margin-bottom:8px">
              🧪 ${isTa ? 'மண்டல வாரியான ஊட்டச்சத்து & உர பரிந்துரை' : 'Variable-Rate Nutrition Prescription (Zone Specific)'}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);font-size:11.5px">
                <div style="color:#94a3b8">FYM / Vermicompost:</div>
                <div style="color:#ffffff;font-weight:700">${activeZone.prescribed_feeding.fym_tonnes} Tonnes</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);font-size:11.5px">
                <div style="color:#94a3b8">DAP + Potash (MOP):</div>
                <div style="color:#ffffff;font-weight:700">${activeZone.prescribed_feeding.dap_kg} kg DAP + ${activeZone.prescribed_feeding.mop_kg} kg MOP</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);font-size:11.5px">
                <div style="color:#94a3b8">Bio-Fertilizer / Inoculants:</div>
                <div style="color:#ffffff;font-weight:700">${activeZone.prescribed_feeding.rhizobium_kg} kg Rhizobium</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);font-size:11.5px">
                <div style="color:#94a3b8">Special Micro-Nutrient:</div>
                <div style="color:#ffffff;font-weight:700">${activeZone.prescribed_feeding.micronutrient}</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Precision Agronomy Benefits Strip -->
      <div class="glass-card mb-24">
        <div class="card-title mb-12">🎯 ${isTa ? 'ஜிபிஎஸ் துல்லிய வேளாண்மையின் நன்மைகள்' : 'Key Precision Agronomy Benefits for Farmer'}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px">
          ${zonesData.precision_benefits.map((b, i) => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:12px;border-radius:8px;font-size:12px;line-height:1.4">
              <span style="color:#10b981;font-weight:bold;margin-right:4px">✓</span> ${b}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function selectGpsZone(zoneId) {
    activeZoneId = zoneId;
    renderGpsZonesView();
  }

  function detectLiveGpsLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    const btn = document.querySelector('button[onclick="detectLiveGpsLocation()"]');
    if (btn) btn.innerHTML = '<span>📡</span> Detecting GPS…';

    navigator.geolocation.getCurrentPosition(
      pos => {
        currentLat = pos.coords.latitude;
        currentLon = pos.coords.longitude;
        loadGpsZones(currentLat, currentLon);
      },
      err => {
        console.warn('Geolocation failed or permission denied:', err);
        // Fallback to default farm GPS
        loadGpsZones(11.0168, 76.9558);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }

  function exportGpsZoneSummary() {
    exportFarmerReportPDF();
  }

  // Register in view loaders
  if (window.VIEW_LOADERS) {
    window.VIEW_LOADERS['gps-zones'] = function() {
      loadGpsZones();
    };
  }

  window.loadGpsZones = loadGpsZones;
  window.selectGpsZone = selectGpsZone;
  window.detectLiveGpsLocation = detectLiveGpsLocation;
  window.exportGpsZoneSummary = exportGpsZoneSummary;
})();
