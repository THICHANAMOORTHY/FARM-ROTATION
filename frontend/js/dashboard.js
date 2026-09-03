// ============================================================
//  dashboard.js — Dashboard view
// ============================================================

let recoveryChart = null;
let profitChart   = null;

VIEW_LOADERS['dashboard'] = async function loadDashboard() {
  const loadingEl = document.getElementById('dash-loading');
  const contentEl = document.getElementById('dash-content');

  if (loadingEl) loadingEl.style.display = '';
  if (contentEl) contentEl.style.display = 'none';

  // Remove existing error banner if any
  const oldErr = document.getElementById('dash-error-banner');
  if (oldErr) oldErr.remove();

  try {
    const data = await apiGet(`/dashboard?farm_id=${state.farm_id}`);
    state.dashboard = data;
    renderDashboard(data);
  } catch (e) {
    console.error('Dashboard load error:', e);
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) {
      contentEl.style.display = '';
      const banner = document.createElement('div');
      banner.id = 'dash-error-banner';
      banner.className = 'alert-banner warning mb-16';
      banner.textContent = `⚠ Could not connect to API (${e.message}). Make sure the backend is running on port 3000.`;
      contentEl.prepend(banner);
    }
  }
};


function renderDashboard(d) {
  const errBanner = document.getElementById('dash-error-banner');
  if (errBanner) errBanner.remove();  // Farm info
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  document.getElementById('dash-farm-name').textContent   = isTa ? 'கோயம்புத்தூர், தமிழ்நாடு' : 'Coimbatore, Tamil Nadu';
  document.getElementById('dash-farmer-name').textContent = isTa ? 'ரமேஷ் குமார்' : d.farm.farmer_name;
  document.getElementById('dash-area').textContent        = isTa
    ? `${d.farm.area_acres} ஏக்கர் · ${d.farm.irrigation.includes('Drip') ? 'சொட்டு நீர் பாசனம்' : d.farm.irrigation}`
    : `${d.farm.area_acres} acres · ${d.farm.irrigation}`;

  // KPI cards
  const healthColor = d.farm_health >= 70 ? 'var(--green-400)' : d.farm_health >= 50 ? 'var(--amber-400)' : 'var(--red-400)';
  document.getElementById('dash-health-val').textContent = d.farm_health;
  document.getElementById('dash-health-val').style.color = healthColor;

  // Score ring
  animateRing(document.getElementById('dash-ring'), d.farm_health, healthColor);

  // Soil alerts
  const alertsEl = document.getElementById('dash-alerts');
  if (d.soil_alerts && d.soil_alerts.length) {
    alertsEl.innerHTML = d.soil_alerts.map(a => chipDanger(window.tAlert ? tAlert(a) : a)).join('');
  } else {
    alertsEl.innerHTML = chipSuccess(window.t ? t('optimalNutrients', 'All Nutrients Adequate') : 'All Nutrients Adequate');
  }

  // Recommended crop
  const cropName = d.recommended_crop ? d.recommended_crop.name : 'Green Gram';
  document.getElementById('dash-rec-crop').textContent   = window.tCrop ? tCrop(cropName) : cropName;
  document.getElementById('dash-rec-score').textContent  = d.recommended_crop?.score || '—';
  document.getElementById('dash-rec-icon').textContent   = cropIcon(cropName);
  const fam = d.recommended_crop?.family || 'Legume';
  document.getElementById('dash-rec-family').textContent = isTa ? (window.t ? t(fam.toLowerCase(), fam) : fam) : fam;

  // Profit
  document.getElementById('dash-profit').textContent      = `₹${((d.expected_profit_per_acre||33500)/1000).toFixed(0)}K`;
  document.getElementById('dash-profit-3s').textContent   = `₹${((d.projected_3_season_profit||102000)/1000).toFixed(0)}K`;

  // Soil NPK chips
  const soil = d.soil_data;
  if (soil) {
    document.getElementById('dash-npk').innerHTML = [
      chipInfo(`N: ${soil.nitrogen} kg/ha`),
      chipInfo(`P: ${soil.phosphorus} kg/ha`),
      chipInfo(`K: ${soil.potassium} kg/ha`),
      chipInfo(`pH: ${soil.ph}`),
      chipInfo(`OC: ${soil.organic_carbon}%`),
    ].join('');
  }

  // Rotation strip
  renderRotationStrip('dash-rotation-strip', d.rotation_plan);

  // Why this plan
  const whyEl = document.getElementById('dash-why');
  if (whyEl && d.why_this_plan) {
    whyEl.innerHTML = d.why_this_plan.map(r => `
      <li class="reason-item">
        <div class="reason-icon">✓</div>
        <span>${window.tReason ? tReason(r) : r}</span>
      </li>`).join('');
  }

  // Recent history table
  const histEl = document.getElementById('dash-history');
  if (d.recent_history && d.recent_history.length) {
    histEl.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>${window.t ? t('thCrop') : 'Crop'}</th>
            <th>${window.t ? t('thSeason') : 'Season'}</th>
            <th>${window.t ? t('thYear') : 'Year'}</th>
            <th>${window.t ? t('thProfit') : 'Profit (₹)'}</th>
          </tr>
        </thead>
        <tbody>
          ${d.recent_history.map(h => `
            <tr>
              <td>${cropIcon(h.crop)} ${window.tCrop ? tCrop(h.crop) : h.crop}</td>
              <td>${window.tSeason ? tSeason(h.season) : h.season}</td>
              <td>${h.year}</td>
              <td style="color:${h.profit > 0 ? 'var(--green-400)' : 'var(--red-400)'}">
                ${h.profit > 0 ? '+' : ''}₹${(h.profit||0).toLocaleString('en-IN')}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
  } else {
    histEl.innerHTML = `<p class="text-muted" style="text-align:center;padding:20px">${window.t ? t('noHistoryYet') : 'No history yet. Add crop history to get started.'}</p>`;
  }

  // Recovery chart
  renderRecoveryChart(d.soil_recovery_curve, d.rotation_plan);

  document.getElementById('dash-content').style.display = '';
  document.getElementById('dash-loading').style.display = 'none';
}

function renderRotationStrip(containerId, plan) {
  const el = document.getElementById(containerId);
  if (!el || !plan) return;
  el.innerHTML = plan.map((crop, i) => `
    ${i > 0 ? '<span class="rot-arrow">→</span>' : ''}
    <div class="rot-crop">
      <div class="rot-crop-dot">${cropIcon(crop)}</div>
      <span class="rot-crop-name">${window.tCrop ? tCrop(crop) : crop}</span>
    </div>`).join('');
}
window.renderRotationStrip = renderRotationStrip;

function renderRecoveryChart(curve, plan) {
  const ctx = document.getElementById('recovery-chart');
  if (!ctx) return;
  if (recoveryChart) recoveryChart.destroy();

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const labels = [isTa ? 'தற்போதைய நிலை' : 'Current', ...( plan || []).slice(0, curve.length - 1).map((c, i) => isTa ? `பருவம் ${i+1}: ${window.tCrop ? tCrop(c) : c}` : `S${i+1}: ${c}`)];
  while (labels.length < curve.length) labels.push(isTa ? `பருவம் ${labels.length}` : `Season ${labels.length}`);

  recoveryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.slice(0, curve.length),
      datasets: [{
        label: isTa ? 'மண் வள குறியீடு' : 'Soil Health Score',
        data: curve,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.08)',
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#22c55e',
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,26,34,0.95)',
          borderColor: 'rgba(34,197,94,0.3)',
          borderWidth: 1,
          titleColor: '#f0fdf4',
          bodyColor: '#94a3b8',
          callbacks: {
            label: ctx => ` ${isTa ? 'மண் வள குறியீடு' : 'Health Score'}: ${ctx.parsed.y}`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 12 } }
        },
        y: {
          min: 0, max: 100,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 12 }, stepSize: 20 }
        }
      }
    }
  });
}

window.renderDashboard = renderDashboard;
window.renderRecoveryChart = renderRecoveryChart;
