// ============================================================
//  cropHistory.js — Crop History view
// ============================================================

VIEW_LOADERS['crop-history'] = async function loadCropHistory() {
  try {
    const data = await apiGet(`/crop-history?farm_id=${state.farm_id}`);
    renderHistoryTable(data.history);
  } catch(_) {}
};

function renderHistoryTable(history) {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  if (!history || !history.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">${isTa ? 'பயிர் வரலாறு இன்னும் பதிவு செய்யப்படவில்லை.' : 'No history recorded yet.'}</td></tr>`;
    return;
  }
  tbody.innerHTML = history.map(h => `
    <tr>
      <td>${h.sequence_order}</td>
      <td>${cropIcon(h.crop_name)} ${window.tCrop ? tCrop(h.crop_name) : h.crop_name}</td>
      <td>${window.tSeason ? tSeason(h.season_name) : h.season_name}</td>
      <td>${h.year}</td>
      <td>₹${(h.revenue_actual||0).toLocaleString('en-IN')}</td>
      <td style="color:${h.profit_actual > 0 ? 'var(--green-400)' : 'var(--red-400)'}">
        ${h.profit_actual > 0 ? '+' : ''}₹${(h.profit_actual||0).toLocaleString('en-IN')}
      </td>
    </tr>`).join('');
}

// Add history entry rows dynamically
let historyRows = 1;

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-history-row');
  if (addBtn) addBtn.addEventListener('click', addHistoryRow);

  const form = document.getElementById('history-form');
  if (form) form.addEventListener('submit', handleHistorySubmit);
});

function addHistoryRow() {
  historyRows++;
  const container = document.getElementById('history-rows');
  const crops     = ['Tomato','Green Gram','Groundnut','Maize','Black Gram','Rice','Soybean','Sunflower'];
  const seasons   = ['Kharif','Rabi','Zaid'];
  const year      = new Date().getFullYear();
  const isTa      = (window.i18n && window.i18n.getLanguage() === 'ta');

  const row = document.createElement('div');
  row.className = 'history-row glass-card';
  row.style.padding = '16px';
  row.style.marginBottom = '12px';
  row.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;align-items:end">
      <div class="form-group">
        <label class="form-label">${window.t ? t('thCrop') : 'Crop'}</label>
        <select name="crop_${historyRows}" required>
          ${crops.map(c => `<option value="${c}">${cropIcon(c)} ${window.tCrop ? tCrop(c) : c}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${window.t ? t('thSeason') : 'Season'}</label>
        <select name="season_${historyRows}" required>
          ${seasons.map(s => `<option value="${s}">${window.tSeason ? tSeason(s) : s}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">${window.t ? t('thYear') : 'Year'}</label>
        <input type="number" name="year_${historyRows}" value="${year}" min="2000" max="2026" required/>
      </div>
      <div class="form-group">
        <label class="form-label">${window.t ? t('thYield') : 'Yield (kg)'}</label>
        <input type="number" name="yield_${historyRows}" placeholder="8500" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">${window.t ? t('thCost') : 'Cost (₹)'}</label>
        <input type="number" name="cost_${historyRows}" placeholder="38000" min="0"/>
      </div>
      <div class="form-group">
        <label class="form-label">${window.t ? t('thRevenue') : 'Revenue (₹)'}</label>
        <input type="number" name="revenue_${historyRows}" placeholder="51000" min="0"/>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" onclick="this.parentElement.parentElement.remove()">${isTa ? '✕ நீக்கு' : '✕ Remove'}</button>
    </div>`;
  container.appendChild(row);
}

async function handleHistorySubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('history-submit-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Saving…';

  const history = [];
  for (let i = 1; i <= historyRows; i++) {
    const crop    = document.querySelector(`[name="crop_${i}"]`)?.value;
    const season  = document.querySelector(`[name="season_${i}"]`)?.value;
    const year    = parseInt(document.querySelector(`[name="year_${i}"]`)?.value);
    const yield_v = parseFloat(document.querySelector(`[name="yield_${i}"]`)?.value) || 0;
    const cost    = parseFloat(document.querySelector(`[name="cost_${i}"]`)?.value)  || 0;
    const revenue = parseFloat(document.querySelector(`[name="revenue_${i}"]`)?.value)|| 0;
    if (crop && season && year) history.push({ crop, season, year, yield: yield_v, cost, revenue });
  }

  if (!history.length) {
    btn.disabled = false;
    btn.textContent = '💾 Save History';
    return;
  }

  try {
    const result = await apiPost('/crop-history', { farm_id: state.farm_id, history });
    state.historyIssue = result;
    renderHistoryResult(result);
    // Reload table
    const data = await apiGet(`/crop-history?farm_id=${state.farm_id}`);
    renderHistoryTable(data.history);
  } catch(err) {
    document.getElementById('history-result').innerHTML =
      `<div class="alert-banner warning">⚠ ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Save History';
  }
}

function renderHistoryResult(result) {
  const el = document.getElementById('history-result');
  const issueColor = result.rotation_issue === 'Continuous cultivation' ? 'danger'
                   : result.rotation_issue === 'Repeated crop'          ? 'warning'
                   : 'success';

  el.innerHTML = `
    <div class="alert-banner ${issueColor} mt-24" style="margin-top:24px">
      <span>${issueColor === 'danger' ? '🚨' : issueColor === 'warning' ? '⚠' : '✓'}</span>
      <div>
        <b>Rotation Issue: ${result.rotation_issue}</b><br>
        Nutrient Pressure: <b>${result.nutrient_pressure}</b> — 
        Penalized Crop: <b>${result.penalized_crop}</b><br>
        <span style="margin-top:6px;display:block">
          Recommended Families: ${result.suitable_crop_families.map(f => `<span class="chip info" style="margin:2px">${f}</span>`).join('')}
        </span>
      </div>
    </div>`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
