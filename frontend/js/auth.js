// ============================================================
// auth.js — Account creation / login UI for Farmer & B2B roles
// ============================================================

window.authUser = null; // sanitized user object once logged in, else null

// ── Sidebar account widget ──────────────────────────────────
function renderAccountWidget() {
  const mount = document.getElementById('account-widget-mount');
  if (!mount) return;

  if (!window.authUser) {
    mount.innerHTML = `
      <div class="account-widget">
        <div class="account-widget-signedout">
          <button class="account-cta-btn" onclick="openAuthModal()">
            <span>🔐</span> Sign Up / Log In
          </button>
        </div>
      </div>`;
    return;
  }

  const u = window.authUser;
  const initials = (u.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const roleLabel = u.role === 'buyer' ? (u.org_name || 'B2B Buyer') : 'Farmer';

  mount.innerHTML = `
    <div class="account-widget">
      <div class="account-widget-signedin">
        <div class="account-avatar">${initials}</div>
        <div class="account-info">
          <div class="account-name">${u.name}</div>
          <div class="account-role-badge ${u.role === 'buyer' ? 'buyer' : ''}">${roleLabel}</div>
        </div>
        <button class="account-logout-btn" onclick="logoutUser()">Logout</button>
      </div>
      ${!u.email_verified ? `
        <div class="account-verify-banner">
          <span>⚠️ Email not verified</span>
          <button onclick="resendVerification()">Resend link</button>
        </div>` : ''}
    </div>`;
}
window.renderAccountWidget = renderAccountWidget;

// ── Modal open/close ─────────────────────────────────────────
let authModalRole = 'farmer'; // 'farmer' | 'buyer'
let authModalMode = 'login';  // 'login' | 'signup'

function openAuthModal(role, mode) {
  authModalRole = role || (window.state && window.state.appMode === 'b2b' ? 'buyer' : 'farmer');
  authModalMode = mode || 'login';
  renderAuthModal();
}
window.openAuthModal = openAuthModal;

function closeAuthModal() {
  const el = document.getElementById('auth-modal-overlay');
  if (el) el.remove();
}
window.closeAuthModal = closeAuthModal;

function switchAuthRole(role) { authModalRole = role; renderAuthModal(); }
function switchAuthMode(mode) { authModalMode = mode; renderAuthModal(); }
window.switchAuthRole = switchAuthRole;
window.switchAuthMode = switchAuthMode;

function renderAuthModal(errorMsg, successMsg) {
  let overlay = document.getElementById('auth-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    overlay.className = 'auth-modal-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAuthModal(); });
    document.body.appendChild(overlay);
  }

  const isSignup = authModalMode === 'signup';
  const isBuyer = authModalRole === 'buyer';

  overlay.innerHTML = `
    <div class="auth-modal-card">
      <div class="auth-modal-header">
        <div>
          <div class="auth-modal-title">${isSignup ? 'Create Account' : 'Log In'}</div>
          <div class="auth-modal-subtitle">UZHAVU KAAPPAAN · ${isBuyer ? 'B2B Enterprise Hub' : 'Farmer Mode'}</div>
        </div>
        <button class="auth-modal-close" onclick="closeAuthModal()">✕</button>
      </div>

      <div class="auth-role-tabs">
        <button class="auth-tab-btn ${!isBuyer ? 'active' : ''}" onclick="switchAuthRole('farmer')">🌾 Farmer</button>
        <button class="auth-tab-btn ${isBuyer ? 'active' : ''}" onclick="switchAuthRole('buyer')">🏢 B2B Buyer</button>
      </div>

      <div class="auth-mode-tabs">
        <button class="auth-tab-btn ${!isSignup ? 'active' : ''}" onclick="switchAuthMode('login')">Log In</button>
        <button class="auth-tab-btn ${isSignup ? 'active' : ''}" onclick="switchAuthMode('signup')">Sign Up</button>
      </div>

      ${errorMsg ? `<div class="auth-error-box">⚠ ${errorMsg}</div>` : ''}
      ${successMsg ? `<div class="auth-success-box">✓ ${successMsg}</div>` : ''}

      <form id="auth-form" class="auth-form-fields" onsubmit="return submitAuthForm(event)">
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isBuyer ? 'Organization Name' : 'Full Name'}</label>
            <input type="text" id="auth-primary-name" placeholder="${isBuyer ? 'e.g. GreenBasket Fresh Supermarkets Ltd.' : 'e.g. Ramesh Kumar'}" required />
          </div>
          ${isBuyer ? `
          <div class="form-group">
            <label class="form-label">Contact Person</label>
            <input type="text" id="auth-contact-name" placeholder="e.g. Priya Sharma" required />
          </div>` : ''}
        ` : ''}
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="auth-email" placeholder="you@example.com" required />
        </div>
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input type="tel" id="auth-phone" placeholder="9876543210" />
          </div>` : ''}
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="auth-password" placeholder="At least 8 characters" minlength="8" required />
        </div>
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" id="auth-password-confirm" placeholder="Repeat password" minlength="8" required />
          </div>` : ''}

        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-submit-btn">
          ${isSignup ? '✨ Create Account' : '🔐 Log In'}
        </button>
      </form>

      <div class="auth-switch-line">
        ${isSignup ? 'Already have an account?' : "Don't have an account?"}
        <button onclick="switchAuthMode('${isSignup ? 'login' : 'signup'}')">${isSignup ? 'Log In' : 'Sign Up'}</button>
      </div>
    </div>`;
}

async function submitAuthForm(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-submit-btn');
  const isSignup = authModalMode === 'signup';
  const isBuyer = authModalRole === 'buyer';

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (isSignup) {
    const confirm = document.getElementById('auth-password-confirm').value;
    if (password !== confirm) {
      renderAuthModal('Passwords do not match');
      return false;
    }
  }

  btn.disabled = true;
  btn.textContent = isSignup ? 'Creating account…' : 'Logging in…';

  try {
    if (isSignup) {
      const primaryName = document.getElementById('auth-primary-name').value.trim();
      const phone = document.getElementById('auth-phone').value.trim();
      const body = {
        role: isBuyer ? 'buyer' : 'farmer',
        email,
        password,
        phone,
      };
      if (isBuyer) {
        body.org_name = primaryName;
        body.name = document.getElementById('auth-contact-name').value.trim();
      } else {
        body.name = primaryName;
      }

      const data = await apiPost('/auth/register', body);
      window.setAccessToken(data.access_token);
      window.authUser = data.user;
      if (data.farm_id) window.state.farm_id = data.farm_id;

      renderAuthModal(null, `Account created! (Dev mode: no email provider configured — verification link: ${data.verification_link})`);
      setTimeout(() => { closeAuthModal(); onAuthChanged(); }, 2600);
    } else {
      const data = await apiPost('/auth/login', { email, password });
      window.setAccessToken(data.access_token);
      window.authUser = data.user;
      closeAuthModal();
      onAuthChanged();
    }
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = isSignup ? '✨ Create Account' : '🔐 Log In';
  }
  return false;
}
window.submitAuthForm = submitAuthForm;

async function logoutUser() {
  try { await apiPost('/auth/logout', {}); } catch (err) { /* ignore */ }
  window.setAccessToken(null);
  window.authUser = null;
  onAuthChanged();
}
window.logoutUser = logoutUser;

async function resendVerification() {
  if (!window.authUser) return;
  try {
    const data = await apiPost('/auth/resend-verification', { email: window.authUser.email });
    alert('Dev mode: no email provider configured.\nVerification link: ' + data.verification_link);
  } catch (err) {
    alert(err.message);
  }
}
window.resendVerification = resendVerification;

// Called whenever login/signup/logout completes.
function onAuthChanged() {
  renderAccountWidget();
  if (window.refreshB2BIdentity) window.refreshB2BIdentity();
  if (window.state && window.state.activeView === 'dashboard' && window.VIEW_LOADERS.dashboard) {
    window.VIEW_LOADERS.dashboard();
  }
}
window.onAuthChanged = onAuthChanged;

// Silent-refresh callback wired from app.js's trySilentRefresh()
window.onAuthRestored = function (user) {
  window.authUser = user;
  renderAccountWidget();
  if (window.refreshB2BIdentity) window.refreshB2BIdentity();
};

// ── Boot: attempt to restore a session from the refresh cookie ──
document.addEventListener('DOMContentLoaded', async () => {
  renderAccountWidget();
  try {
    await window.trySilentRefresh();
  } catch (err) { /* not logged in — fine */ }
});
