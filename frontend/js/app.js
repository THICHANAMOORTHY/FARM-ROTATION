// ============================================================
//  app.js — Router, API client, global state
// ============================================================

const API = (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http'))
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';


window.state = {
  farm_id:    101,
  run_id:     null,
  soilData:   null,
  historyIssue: null,
  candidates: null,
  evaluation: null,
  plans:      null,
  simData:    null,
  recData:    null,
  dashboard:  null,
};

// ── API Helpers ─────────────────────────────────────────────
async function apiGet(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(API + path, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

window.apiGet  = apiGet;
window.apiPost = apiPost;

// ── Crop Icons Map (All 26 crops) ────────────────────────────
const CROP_ICONS = {
  'Tomato':      '🍅',
  'Green Gram':  '🫘',
  'Groundnut':   '🥜',
  'Maize':       '🌽',
  'Black Gram':  '🫘',
  'Blackgram':   '🫘',
  'Rice':        '🌾',
  'Soybean':     '🌱',
  'Sunflower':   '🌻',
  'Wheat':       '🌾',
  'Potato':      '🥔',
  'Sugarcane':   '🎋',
  'Apple':       '🍎',
  'Banana':      '🍌',
  'Chickpea':    '🫘',
  'Coconut':     '🥥',
  'Coffee':      '☕',
  'Cotton':      '☁️',
  'Grapes':      '🍇',
  'Jute':        '🌿',
  'Kidneybeans': '🫘',
  'Lentil':      '🥣',
  'Mango':       '🥭',
  'Mothbeans':   '🫘',
  'Mungbean':    '🫘',
  'Muskmelon':   '🍈',
  'Orange':      '🍊',
  'Papaya':      '🍈',
  'Pigeonpeas':  '🫘',
  'Pomegranate': '🪴',
  'Watermelon':  '🍉',
  'Default':     '🌱',
};
window.CROP_ICONS = CROP_ICONS;

function cropIcon(name) {
  return CROP_ICONS[name] || CROP_ICONS.Default;
}
window.cropIcon = cropIcon;

// ── Score Ring ───────────────────────────────────────────────
function animateRing(ringEl, score, color = '#22c55e') {
  const circle = ringEl.querySelector('.ring-fill');
  const label  = ringEl.querySelector('.ring-value');
  if (!circle || !label) return;

  const circumference = 2 * Math.PI * 40; // r=40
  circle.style.stroke = color;
  const offset = circumference - (score / 100) * circumference;

  // Animate number
  let current = 0;
  const step  = score / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= score) { current = score; clearInterval(timer); }
    label.textContent = Math.round(current);
    circle.style.strokeDashoffset = circumference - (current / 100) * circumference;
  }, 16);
}
window.animateRing = animateRing;

// ── Score bar helper ─────────────────────────────────────────
function scoreBar(value, label = '') {
  const color = value >= 75 ? 'var(--green-400)' : value >= 50 ? 'var(--amber-400)' : 'var(--red-400)';
  return `
    <div class="score-bar-wrap">
      <div class="score-bar-track">
        <div class="score-bar-fill" style="width:0%;background:${color}" data-target="${value}"></div>
      </div>
      <span class="score-bar-val" style="color:${color}">${value}</span>
    </div>`;
}
window.scoreBar = scoreBar;

function animateBars(container) {
  container.querySelectorAll('.score-bar-fill[data-target]').forEach(el => {
    const t = el.dataset.target;
    setTimeout(() => { el.style.width = t + '%'; }, 100);
  });
}
window.animateBars = animateBars;

// ── Chip helpers ─────────────────────────────────────────────
function chipDanger(text)  { return `<span class="chip danger">⚠ ${text}</span>`; }
function chipSuccess(text) { return `<span class="chip success">✓ ${text}</span>`; }
function chipInfo(text)    { return `<span class="chip info">◈ ${text}</span>`; }
function chipWarning(text) { return `<span class="chip warning">◉ ${text}</span>`; }
function chipTeal(text)    { return `<span class="chip teal">✦ ${text}</span>`; }

window.chipDanger  = chipDanger;
window.chipSuccess = chipSuccess;
window.chipInfo    = chipInfo;
window.chipWarning = chipWarning;
window.chipTeal    = chipTeal;

function nutrientChip(label, value) {
  return `<span class="sim-nutrient chip ns-${value}"><b>${label}</b> ${value}</span>`;
}
window.nutrientChip = nutrientChip;

// ── Router ───────────────────────────────────────────────────
const VIEW_LOADERS = {};

function navigate(viewId) {
  state.activeView = viewId;

  // Update active view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  // Update desktop nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const navEl = document.querySelector(`.nav-link[data-view="${viewId}"]`);
  if (navEl) navEl.classList.add('active');

  // Update mobile bottom nav items
  document.querySelectorAll('.mb-nav-item').forEach(b => b.classList.remove('active'));
  const mbEl = document.querySelector(`.mb-nav-item[data-view="${viewId}"]`);
  if (mbEl) mbEl.classList.add('active');

  // Auto-close mobile drawer if open
  closeMobileSidebar();

  // Scroll main view to top smoothly
  const mainEl = document.querySelector('.main');
  if (mainEl) mainEl.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Run view loader
  if (VIEW_LOADERS[viewId]) VIEW_LOADERS[viewId]();

  window.location.hash = viewId;
}
window.navigate = navigate;
window.VIEW_LOADERS = VIEW_LOADERS;

// ── Mobile Sidebar Controls ──────────────────────────────────
function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('mobile-menu-btn');
  if (!sidebar) return;

  const isOpen = sidebar.classList.toggle('open');
  if (backdrop) backdrop.classList.toggle('active', isOpen);
  if (btn) btn.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('mobile-menu-btn');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
  if (btn) btn.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleLanguageMobile() {
  if (window.i18n) {
    const nextLang = (window.i18n.getLanguage() === 'ta') ? 'en' : 'ta';
    window.setLanguage(nextLang);
    const label = document.getElementById('mobile-lang-label');
    if (label) label.textContent = (nextLang === 'ta') ? 'English' : 'தமிழ்';
  }
}

window.toggleMobileSidebar = toggleMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.toggleLanguageMobile = toggleLanguageMobile;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Attach nav click handlers
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', () => navigate(link.dataset.view));
  });

  // Load initial view from hash or default
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);
});
