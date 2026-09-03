// ============================================================
//  simulation.js — Soil Simulation view
// ============================================================

let simStep    = 0;
let simTimeline = [];
let simInterval = null;

VIEW_LOADERS['simulation'] = async function loadSimulation() {
  // Use selected plan or recommended plan
  const planId = state.selectedPlanId || getRecommendedPlanId();
  if (!planId) {
    document.getElementById('sim-content').innerHTML = `
      <div class="alert-banner warning">
        ⚠ Please run the <b>Rotation Optimizer</b> first to generate plans, then run simulation.
      </div>`;
    return;
  }

  document.getElementById('sim-plan-id').textContent = planId;
  await fetchSimulation(planId);
};

function getRecommendedPlanId() {
  if (!state.plans) return null;
  const rec = state.plans.find(p => p.is_recommended);
  return rec?.plan_id || state.plans[0]?.plan_id || null;
}

async function fetchSimulation(planId) {
  document.getElementById('sim-content').innerHTML =
    `<div class="loading-wrap"><div class="spinner"></div><p class="loading-text">Running simulation…</p></div>`;

  try {
    const result = await apiPost('/soil-simulation', { plan_id: planId });
    state.simData  = result;
    simTimeline    = result.timeline;
    simStep        = 0;
    renderSimSetup(result);
  } catch(e) {
    document.getElementById('sim-content').innerHTML =
      `<div class="alert-banner warning">⚠ ${e.message}</div>`;
  }
}

function renderSimSetup(result) {
  const container = document.getElementById('sim-content');

  container.innerHTML = `
    <div class="flex items-center gap-12 mb-24" style="flex-wrap:wrap">
      <button class="btn btn-primary" id="sim-play-btn" onclick="playSimulation()">▶ Play Animation</button>
      <button class="btn btn-secondary" onclick="resetSimulation()">↺ Reset</button>
      <span class="text-muted" id="sim-step-info">Season: 0 / ${simTimeline.length - 1}</span>
    </div>
    <div class="sim-timeline" id="sim-cards"></div>`;

  buildSimCards(result.timeline);
  revealSimCard(0); // Show current state immediately
}

function buildSimCards(timeline) {
  const container = document.getElementById('sim-cards');
  container.innerHTML = timeline.map((t, i) => `
    <div class="sim-card" id="sim-card-${i}">
      <div class="sim-season-label">${i === 0 ? 'Current State' : `Season ${i}`}</div>
      <div class="sim-crop-name">${cropIcon(t.crop)} ${t.crop}</div>
      <div class="sim-health">${t.soil_health}</div>
      <div class="card-label">Soil Health Score</div>
      <div class="sim-nutrients">
        ${nutrientChip('N', t.n)}
        ${nutrientChip('P', t.p)}
        ${nutrientChip('K', t.k)}
        ${nutrientChip('OC', t.oc)}
      </div>
    </div>`).join('');
}

function revealSimCard(index) {
  const card = document.getElementById(`sim-card-${index}`);
  if (card) card.classList.add('revealed');
  const info = document.getElementById('sim-step-info');
  if (info) info.textContent = `Season: ${index} / ${simTimeline.length - 1}`;
}

function playSimulation() {
  const btn = document.getElementById('sim-play-btn');
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
    btn.textContent = '▶ Play Animation';
    return;
  }

  btn.textContent = '⏸ Pause';
  resetCardVisibility();
  revealSimCard(0);
  simStep = 1;

  simInterval = setInterval(() => {
    if (simStep >= simTimeline.length) {
      clearInterval(simInterval);
      simInterval = null;
      btn.textContent = '▶ Replay';
      return;
    }
    revealSimCard(simStep);
    simStep++;
  }, 900);
}
window.playSimulation = playSimulation;

function resetSimulation() {
  if (simInterval) { clearInterval(simInterval); simInterval = null; }
  const btn = document.getElementById('sim-play-btn');
  if (btn) btn.textContent = '▶ Play Animation';
  simStep = 0;
  resetCardVisibility();
  revealSimCard(0);
}
window.resetSimulation = resetSimulation;

function resetCardVisibility() {
  document.querySelectorAll('.sim-card').forEach(c => c.classList.remove('revealed'));
}
