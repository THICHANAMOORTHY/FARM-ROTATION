// ============================================================
//  soilAnalysis.js — Soil Analysis view
// ============================================================

VIEW_LOADERS['soil-analysis'] = async function loadSoilAnalysis() {
  // Load last known soil data to pre-fill sliders
  try {
    const soil = await apiGet(`/soil-analysis?farm_id=${state.farm_id}`);
    if (soil) prefillSliders(soil);
  } catch(_) {}
};

function prefillSliders(soil) {
  setSlider('n-slider',  soil.nitrogen,       'n-val');
  setSlider('p-slider',  soil.phosphorus,     'p-val');
  setSlider('k-slider',  soil.potassium,      'k-val');
  setSlider('ph-slider', soil.ph * 10,        'ph-val', v => (v/10).toFixed(1));
  setSlider('oc-slider', soil.organic_carbon * 100, 'oc-val', v => (v/100).toFixed(2));
}

function setSlider(sliderId, value, valId, formatter) {
  const slider = document.getElementById(sliderId);
  const valEl  = document.getElementById(valId);
  if (!slider || !valEl) return;
  slider.value = value;
  valEl.textContent = formatter ? formatter(value) : value;
}

// Wire up slider live updates
document.addEventListener('DOMContentLoaded', () => {
  const sliders = [
    { id: 'n-slider',  out: 'n-val',  fmt: v => v },
    { id: 'p-slider',  out: 'p-val',  fmt: v => v },
    { id: 'k-slider',  out: 'k-val',  fmt: v => v },
    { id: 'ph-slider', out: 'ph-val', fmt: v => (v/10).toFixed(1) },
    { id: 'oc-slider', out: 'oc-val', fmt: v => (v/100).toFixed(2) },
  ];
  sliders.forEach(({ id, out, fmt }) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      document.getElementById(out).textContent = fmt(el.value);
    });
  });

  // Form submit
  const form = document.getElementById('soil-form');
  if (form) form.addEventListener('submit', handleSoilSubmit);
});

async function handleSoilSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('soil-submit-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Analysing…';

  const nitrogen       = parseFloat(document.getElementById('n-slider').value);
  const phosphorus     = parseFloat(document.getElementById('p-slider').value);
  const potassium      = parseFloat(document.getElementById('k-slider').value);
  const ph             = parseFloat(document.getElementById('ph-slider').value) / 10;
  const organic_carbon = parseFloat(document.getElementById('oc-slider').value) / 100;

  try {
    const result = await apiPost('/soil-analysis', {
      farm_id: state.farm_id,
      nitrogen, phosphorus, potassium, ph, organic_carbon,
    });
    state.soilData = result;
    renderSoilResult(result);
  } catch(err) {
    document.getElementById('soil-result').innerHTML =
      `<div class="alert-banner warning">⚠ ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = '🔬 Analyse Soil';
  }
}

function renderSoilResult(result) {
  const container = document.getElementById('soil-result');
  container.style.display = '';

  const scoreColor = result.soil_health_score >= 70 ? 'var(--green-400)'
                   : result.soil_health_score >= 50 ? 'var(--amber-400)'
                   : 'var(--red-400)';

  const ringColor = result.soil_health_score >= 70 ? '#22c55e'
                  : result.soil_health_score >= 50 ? '#f59e0b'
                  : '#ef4444';

  container.innerHTML = `
    <div class="glass-card mt-24" id="soil-result-card">
      <div class="flex items-center justify-between mb-16" style="flex-wrap:wrap;gap:16px">
        <div>
          <div class="card-label">Soil Health Analysis Result</div>
          <div style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:800;color:${scoreColor}">
            Score: ${result.soil_health_score} / 100
          </div>
        </div>
        <div class="score-ring" id="soil-ring" style="width:90px;height:90px">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle class="ring-bg"   cx="45" cy="45" r="38"/>
            <circle class="ring-fill" cx="45" cy="45" r="38"
              style="stroke-dasharray:${2*Math.PI*38};stroke-dashoffset:${2*Math.PI*38};stroke:${ringColor}"/>
          </svg>
          <div class="ring-value" style="color:${scoreColor}">0</div>
        </div>
      </div>

      ${result.deficiencies.length ? `
        <div class="mb-16">
          <div class="card-label">Deficiencies Detected</div>
          <div class="chips-wrap">${result.deficiencies.map(d => chipDanger(d)).join('')}</div>
        </div>` : ''}

      ${result.adequate.length ? `
        <div>
          <div class="card-label">Adequate Nutrients</div>
          <div class="chips-wrap">${result.adequate.map(a => chipSuccess(a)).join('')}</div>
        </div>` : ''}

      ${result.deficiencies.length ? `
        <div class="alert-banner warning mt-16" style="margin-top:16px">
          <span>⚠</span>
          <div><b>Action Required:</b> ${result.deficiencies.length} deficiencie(s) detected. Consider soil amendments before next crop cycle.</div>
        </div>` : `
        <div class="alert-banner success mt-16" style="margin-top:16px">
          <span>✓</span>
          <div><b>Excellent Soil Health!</b> Your farm is well-balanced and ready for optimal planting.</div>
        </div>`}
    </div>`;

  // Animate ring
  setTimeout(() => {
    const ring = document.getElementById('soil-ring');
    if (ring) {
      const fill  = ring.querySelector('.ring-fill');
      const label = ring.querySelector('.ring-value');
      const r = 38;
      const circ = 2 * Math.PI * r;
      fill.style.strokeDasharray  = circ;
      fill.style.strokeDashoffset = circ;
      fill.style.stroke = ringColor;
      let cur = 0;
      const target = result.soil_health_score;
      const step   = target / 60;
      const timer  = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        label.textContent = Math.round(cur);
        fill.style.strokeDashoffset = circ - (cur / 100) * circ;
      }, 16);
    }
  }, 80);

  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
