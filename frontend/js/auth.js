// ============================================================
// auth.js — Account creation, login, Email Verification & OTP UI
// ============================================================

window.authUser = null; // sanitized user object once logged in, else null

function escapeHtml(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

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

  mount.innerHTML = `
    <div class="account-widget">
      <div class="account-widget-signedin">
        <div class="account-avatar">${initials}</div>
        <div class="account-info">
          <div class="account-name">${escapeHtml(u.name)}</div>
          <div class="account-role-badge">Farmer</div>
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

// ── Modal State & Flow Control ──────────────────────────────
let authModalMode = 'login';  // 'login' | 'signup' | 'forgot' | 'reset_otp'
let isAuthMandatory = false;
let resetFlowEmail = '';
let otpCooldownTimer = null;
let otpCooldownSeconds = 0;

function startOtpCooldown(seconds = 30) {
  otpCooldownSeconds = seconds;
  if (otpCooldownTimer) clearInterval(otpCooldownTimer);
  updateOtpCooldownUi();
  otpCooldownTimer = setInterval(() => {
    otpCooldownSeconds--;
    updateOtpCooldownUi();
    if (otpCooldownSeconds <= 0) {
      clearInterval(otpCooldownTimer);
      otpCooldownTimer = null;
    }
  }, 1000);
}

function updateOtpCooldownUi() {
  const btn = document.getElementById('auth-resend-otp-btn');
  const span = document.getElementById('auth-otp-cooldown');
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  if (btn) {
    if (otpCooldownSeconds > 0) {
      btn.disabled = true;
      btn.innerHTML = `⏳ ${isTa ? 'மீண்டும் அனுப்ப' : 'Resend in'} (${otpCooldownSeconds}s)`;
    } else {
      btn.disabled = false;
      btn.innerHTML = `🔄 ${isTa ? 'OTP மீண்டும் அனுப்பு' : 'Resend OTP'}`;
    }
  }
  if (span) {
    span.textContent = otpCooldownSeconds > 0 ? `(${otpCooldownSeconds}s)` : '';
  }
}

function openAuthModal(mode, opts = {}) {
  authModalMode = mode || 'login';
  isAuthMandatory = false;
  renderAuthModal(null, null, opts);
}
window.openAuthModal = openAuthModal;

function openForgotPassword(email) {
  if (email) resetFlowEmail = email;
  else {
    const curEmail = document.getElementById('auth-email')?.value.trim();
    if (curEmail) resetFlowEmail = curEmail;
  }
  authModalMode = 'forgot';
  renderAuthModal();
}
window.openForgotPassword = openForgotPassword;

function closeAuthModal(force = true) {
  const el = document.getElementById('auth-modal-overlay');
  if (el) el.remove();
  if (window.initAppAfterAuth) window.initAppAfterAuth();
}
window.closeAuthModal = closeAuthModal;

function switchAuthMode(mode) {
  authModalMode = mode;
  renderAuthModal();
}
window.switchAuthMode = switchAuthMode;

// ── Modal Rendering ─────────────────────────────────────────
function renderAuthModal(errorMsg, successMsg, opts = {}) {
  isAuthMandatory = false;

  let overlay = document.getElementById('auth-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'auth-modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.className = 'auth-modal-overlay';
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeAuthModal(true);
    }
  };

  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');

  // 1. FORGOT PASSWORD VIEW (Step 1: Request OTP)
  if (authModalMode === 'forgot') {
    overlay.innerHTML = `
      <div class="auth-modal-card">
        <div class="auth-modal-header">
          <div>
            <div class="auth-modal-title">🔑 ${isTa ? 'கடவுச்சொல் மீட்டமை' : 'Reset Password'}</div>
            <div class="auth-modal-subtitle">${isTa ? 'பதிவுசெய்த மின்னஞ்சலுக்கு 6-இலக்க OTP அனுப்பப்படும்' : 'Enter your registered email to receive a 6-digit OTP'}</div>
          </div>
          ${!mandatory ? `<button class="auth-modal-close" onclick="closeAuthModal()">✕</button>` : ''}
        </div>

        ${errorMsg ? `<div class="auth-error-box">⚠ ${escapeHtml(errorMsg)}</div>` : ''}
        ${successMsg ? `<div class="auth-success-box">✓ ${escapeHtml(successMsg)}</div>` : ''}

        <form id="auth-forgot-form" class="auth-form-fields" onsubmit="return submitForgotPassword(event)">
          <div class="form-group">
            <label class="form-label">${isTa ? 'மின்னஞ்சல்' : 'Email Address'}</label>
            <input type="email" id="auth-forgot-email" placeholder="you@example.com" value="${escapeHtml(resetFlowEmail)}" required autofocus />
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-forgot-btn">
            📩 ${isTa ? 'OTP குறியீடு அனுப்பவும்' : 'Send Verification OTP'}
          </button>
        </form>

        <div class="auth-switch-line">
          ${isTa ? 'கடவுச்சொல் நினைவிருக்கிறதா?' : 'Remembered your password?'}
          <button onclick="switchAuthMode('login')">${isTa ? 'உள்நுழைக' : 'Log In'}</button>
        </div>
      </div>`;
    return;
  }

  // 2. ENTER OTP & NEW PASSWORD VIEW (Step 2: Verify & Reset)
  if (authModalMode === 'reset_otp') {
    overlay.innerHTML = `
      <div class="auth-modal-card">
        <div class="auth-modal-header">
          <div>
            <div class="auth-modal-title">🔒 ${isTa ? 'OTP & புதிய கடவுச்சொல்' : 'Enter OTP & New Password'}</div>
            <div class="auth-modal-subtitle">
              ${isTa ? `மின்னஞ்சலுக்கு அனுப்பப்பட்ட 6-இலக்க OTP: ` : `Enter the 6-digit OTP sent to `}<strong>${escapeHtml(resetFlowEmail)}</strong>
            </div>
          </div>
          ${!mandatory ? `<button class="auth-modal-close" onclick="closeAuthModal()">✕</button>` : ''}
        </div>

        ${errorMsg ? `<div class="auth-error-box">⚠ ${escapeHtml(errorMsg)}</div>` : ''}
        ${successMsg ? `<div class="auth-success-box">✓ ${escapeHtml(successMsg)}</div>` : ''}

        <form id="auth-reset-form" class="auth-form-fields" onsubmit="return submitResetPassword(event)">
          <div class="form-group">
            <label class="form-label">${isTa ? '6-இலக்க OTP குறியீடு' : '6-Digit OTP Code'}</label>
            <input type="text" id="auth-otp-code" class="auth-otp-input" placeholder="123456" maxlength="6" pattern="[0-9]{6}" required autofocus />
          </div>

          <div class="auth-otp-actions">
            <button type="button" id="auth-resend-otp-btn" class="btn btn-secondary" style="font-size:12px;padding:6px 14px" onclick="handleResendOtp()">
              🔄 ${isTa ? 'OTP மீண்டும் அனுப்பு' : 'Resend OTP'}
            </button>
            <span id="auth-otp-cooldown" style="font-size:12px;color:var(--text-muted)"></span>
          </div>

          <div class="form-group" style="margin-top:8px">
            <label class="form-label">${isTa ? 'புதிய கடவுச்சொல்' : 'New Password'}</label>
            <input type="password" id="auth-new-password" placeholder="${isTa ? 'குறைந்தது 8 எழுத்துக்கள்' : 'At least 8 characters'}" minlength="8" required />
          </div>

          <div class="form-group">
            <label class="form-label">${isTa ? 'கடவுச்சொல்லை உறுதிப்படுத்து' : 'Confirm New Password'}</label>
            <input type="password" id="auth-new-password-confirm" placeholder="${isTa ? 'மீண்டும் புதிய கடவுச்சொல்' : 'Repeat new password'}" minlength="8" required />
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-reset-btn">
            ✅ ${isTa ? 'கடவுச்சொல்லை மாற்றி உள்நுழைக' : 'Reset Password & Log In'}
          </button>
        </form>

        <div class="auth-switch-line">
          <button onclick="switchAuthMode('login')">← ${isTa ? 'உள்நுழைவுக்கு திரும்பு' : 'Back to Log In'}</button>
        </div>
      </div>`;
    updateOtpCooldownUi();
    return;
  }

  // 3. LOGIN & SIGNUP VIEWS
  const isSignup = authModalMode === 'signup';

  overlay.innerHTML = `
    <div class="auth-modal-card">
      <div class="auth-modal-header">
        <div>
          <div class="auth-modal-title">${isSignup ? (isTa ? 'புதிய கணக்கு உருவாக்கு' : 'Create Account') : (isTa ? 'உள்நுழைவு' : 'Log In')}</div>
          <div class="auth-modal-subtitle">${isTa ? 'UZHAVU KAAPPAAN தளத்தைப் பயன்படுத்தவும்' : 'Sign in, register, or explore as guest'}</div>
        </div>
        <button class="auth-modal-close" onclick="closeAuthModal(true)">✕</button>
      </div>

      <div class="auth-mode-tabs">
        <button class="auth-tab-btn ${!isSignup ? 'active' : ''}" onclick="switchAuthMode('login')">${isTa ? 'உள்நுழைவு' : 'Log In'}</button>
        <button class="auth-tab-btn ${isSignup ? 'active' : ''}" onclick="switchAuthMode('signup')">${isTa ? 'பதிவு செய்' : 'Sign Up'}</button>
      </div>

      ${!isSignup ? `
        <div style="margin-bottom:14px;background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:var(--radius-sm);padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--text-primary)">🌾 ${isTa ? 'ஒரு கிளிக் மாதிரி உள்நுழைவு' : 'One-Click Demo Farmer Login'}</div>
            <div style="font-size:11px;color:var(--text-muted)">Ramesh Kumar · Coimbatore Farm 101</div>
          </div>
          <button type="button" class="btn btn-primary" style="font-size:11px;padding:6px 12px;white-space:nowrap" onclick="demoLogin()">
            ⚡ ${isTa ? 'உடனடி உள்நுழைவு' : 'Instant Login'}
          </button>
        </div>
      ` : ''}

      ${errorMsg ? `<div class="auth-error-box">⚠ ${escapeHtml(errorMsg)}</div>` : ''}
      ${successMsg ? `<div class="auth-success-box">✓ ${escapeHtml(successMsg)}</div>` : ''}
      ${opts.canInstantVerify && opts.resendEmail ? `
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;background:rgba(34,197,94,0.08);padding:12px;border-radius:var(--radius-sm);border:1px solid rgba(34,197,94,0.25)">
          <div style="font-size:12px;color:var(--text-secondary);text-align:center">${isTa ? 'உள்ளூர் சோதனையில் உள்ளீர்களா? உடனடியாக உள்நுழைய:' : 'Testing on localhost? Skip opening email:'}</div>
          <button type="button" class="btn btn-primary" style="width:100%" onclick="instantVerifyAndLogin('${escapeHtml(opts.resendEmail).replace(/'/g, '')}')">⚡ ${isTa ? 'உடனடியாக சரிபார்த்து உள்நுழை' : 'Verify & Log In Now (Instant)'}</button>
          <button type="button" class="btn btn-secondary" style="width:100%;font-size:12px;padding:6px 12px" onclick="resendVerification('${escapeHtml(opts.resendEmail).replace(/'/g, '')}')">📧 ${isTa ? 'மின்னஞ்சலை மீண்டும் அனுப்பு' : 'Resend verification email to Gmail'}</button>
        </div>
      ` : (opts.resendEmail ? `<button type="button" class="btn btn-secondary" style="width:100%;margin-bottom:10px" onclick="resendVerification('${escapeHtml(opts.resendEmail).replace(/'/g, '')}')">📧 ${isTa ? 'மின்னஞ்சலை மீண்டும் அனுப்பு' : 'Resend verification email'}</button>` : '')}

      <form id="auth-form" class="auth-form-fields" onsubmit="return submitAuthForm(event)">
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isTa ? 'முழு பெயர்' : 'Full Name'}</label>
            <input type="text" id="auth-name" placeholder="e.g. Ramesh Kumar" required />
          </div>
        ` : ''}
        <div class="form-group">
          <label class="form-label">${isTa ? 'மின்னஞ்சல்' : 'Email'}</label>
          <input type="email" id="auth-email" placeholder="you@example.com" required />
        </div>
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isTa ? 'தொலைபேசி எண்' : 'Phone'}</label>
            <input type="tel" id="auth-phone" placeholder="9876543210" />
          </div>` : ''}
        <div class="form-group">
          <label class="form-label">${isTa ? 'கடவுச்சொல்' : 'Password'}</label>
          <input type="password" id="auth-password" placeholder="${isTa ? 'குறைந்தது 8 எழுத்துக்கள்' : 'At least 8 characters'}" minlength="8" required />
        </div>
        ${!isSignup ? `
          <div style="display:flex;justify-content:flex-end;margin-top:-6px;margin-bottom:4px">
            <a href="javascript:void(0)" class="auth-link-forgot" onclick="openForgotPassword()">
              ${isTa ? 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?' : 'Forgot Password?'}
            </a>
          </div>
        ` : ''}
        ${isSignup ? `
          <div class="form-group">
            <label class="form-label">${isTa ? 'கடவுச்சொல்லை உறுதிப்படுத்து' : 'Confirm Password'}</label>
            <input type="password" id="auth-password-confirm" placeholder="${isTa ? 'மீண்டும் கடவுச்சொல்' : 'Repeat password'}" minlength="8" required />
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;color:var(--text-secondary)">
            <input type="checkbox" id="auth-instant-verify" checked style="accent-color:var(--green-500);width:15px;height:15px;cursor:pointer" />
            <label for="auth-instant-verify" style="cursor:pointer">
              ${isTa ? 'உடனடி கணக்கு செயல்படுத்தல் (மின்னஞ்சல் இணைப்பு தேவையில்லை)' : 'Instant Activation (Skip email verification on localhost)'}
            </label>
          </div>
        ` : ''}

        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:6px" id="auth-submit-btn">
          ${isSignup ? (isTa ? '✨ கணக்கு உருவாக்கு' : '✨ Create Account') : (isTa ? '🔐 உள்நுழை' : '🔐 Log In')}
        </button>
      </form>

      <div class="auth-switch-line">
        ${isSignup ? (isTa ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?') : (isTa ? 'கணக்கு இல்லையா?' : "Don't have an account?")}
        <button onclick="switchAuthMode('${isSignup ? 'login' : 'signup'}')">${isSignup ? (isTa ? 'உள்நுழைக' : 'Log In') : (isTa ? 'பதிவு செய்க' : 'Sign Up')}</button>
      </div>

      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);text-align:center">
        <button type="button" class="btn btn-secondary" style="width:100%;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px" onclick="closeAuthModal(true)">
          <span>🚶</span> ${isTa ? 'விருந்தினராக தொடரவும் (உள்நுழைவு தேவையில்லை)' : 'Continue as Guest (Skip Login)'}
        </button>
      </div>
    </div>`;
}

// ── One-Click Demo Login ────────────────────────────────────
async function demoLogin() {
  try {
    const data = await apiPost('/auth/demo-login', {});
    window.setAccessToken(data.access_token);
    window.authUser = data.user;
    isAuthMandatory = false;
    if (data.user && data.user.farm_id) window.state.farm_id = data.user.farm_id;
    renderAuthModal(null, data.message || 'Logged in successfully as Demo Farmer!', { mandatory: false });
    setTimeout(() => {
      closeAuthModal(true);
      onAuthChanged();
      if (window.initAppAfterAuth) window.initAppAfterAuth();
    }, 700);
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  }
}
window.demoLogin = demoLogin;

// ── Standard Form Submission ────────────────────────────────
async function submitAuthForm(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-submit-btn');
  const isSignup = authModalMode === 'signup';

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
      const name = document.getElementById('auth-name').value.trim();
      const phone = document.getElementById('auth-phone').value.trim();
      const instant_verify = document.getElementById('auth-instant-verify')?.checked ?? true;

      const data = await apiPost('/auth/register', { name, email, password, phone, instant_verify });
      if (data.farm_id) window.state.farm_id = data.farm_id;

      if (data.access_token) {
        window.setAccessToken(data.access_token);
        window.authUser = data.user;
        isAuthMandatory = false;
        renderAuthModal(null, `Account created and verified! Welcome, ${escapeHtml(data.user?.name || name)}.`, { mandatory: false });
        setTimeout(() => {
          closeAuthModal(true);
          onAuthChanged();
          if (window.initAppAfterAuth) window.initAppAfterAuth();
        }, 900);
        return false;
      }

      if (data.verification_required) {
        authModalMode = 'login';
        renderAuthModal(null, data.message, { resendEmail: data.email, canInstantVerify: true });
        return false;
      }

      window.setAccessToken(data.access_token);
      window.authUser = data.user;
      isAuthMandatory = false;
      renderAuthModal(null, `Account created! (Verification link: ${data.verification_link || 'Sent to email'})`, { mandatory: false });
      setTimeout(() => {
        closeAuthModal(true);
        onAuthChanged();
        if (window.initAppAfterAuth) window.initAppAfterAuth();
      }, 1200);
    } else {
      const data = await apiPost('/auth/login', { email, password });
      window.setAccessToken(data.access_token);
      window.authUser = data.user;
      isAuthMandatory = false;
      if (data.user && data.user.farm_id) window.state.farm_id = data.user.farm_id;
      closeAuthModal(true);
      onAuthChanged();
      if (window.initAppAfterAuth) window.initAppAfterAuth();
    }
  } catch (err) {
    const needsVerify = err.body && err.body.code === 'EMAIL_NOT_VERIFIED';
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message, null,
      needsVerify ? { resendEmail: err.body.email || email, canInstantVerify: true } : {});
  } finally {
    btn.disabled = false;
    btn.textContent = isSignup ? '✨ Create Account' : '🔐 Log In';
  }
  return false;
}
window.submitAuthForm = submitAuthForm;

// ── Instant Verify & Log In (Local / Dev) ───────────────────
async function instantVerifyAndLogin(email) {
  try {
    const data = await apiPost('/auth/verify-instant', { email });
    window.setAccessToken(data.access_token);
    window.authUser = data.user;
    isAuthMandatory = false;
    if (data.user && data.user.farm_id) window.state.farm_id = data.user.farm_id;
    renderAuthModal(null, data.message || 'Email verified successfully! Logging you in...', { mandatory: false });
    setTimeout(() => {
      closeAuthModal(true);
      onAuthChanged();
      if (window.initAppAfterAuth) window.initAppAfterAuth();
    }, 900);
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  }
}
window.instantVerifyAndLogin = instantVerifyAndLogin;

// ── Forgot Password & Resend OTP Handlers ───────────────────
async function submitForgotPassword(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-forgot-btn');
  const emailInput = document.getElementById('auth-forgot-email');
  const email = emailInput ? emailInput.value.trim() : '';
  if (!email) return false;

  btn.disabled = true;
  btn.textContent = 'Sending OTP…';

  try {
    const res = await apiPost('/auth/forgot-password', { email });
    resetFlowEmail = email;
    authModalMode = 'reset_otp';
    startOtpCooldown(res.cooldown_seconds || 30);
    renderAuthModal(null, res.message || 'Verification OTP sent to your email.');
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}
window.submitForgotPassword = submitForgotPassword;

async function handleResendOtp() {
  if (!resetFlowEmail) return;
  const btn = document.getElementById('auth-resend-otp-btn');
  if (btn) btn.disabled = true;

  try {
    const res = await apiPost('/auth/resend-otp', { email: resetFlowEmail });
    startOtpCooldown(res.cooldown_seconds || 30);
    renderAuthModal(null, res.message || 'A fresh OTP has been sent to your email.');
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  }
}
window.handleResendOtp = handleResendOtp;

async function submitResetPassword(e) {
  e.preventDefault();
  const btn = document.getElementById('auth-reset-btn');
  const otp = document.getElementById('auth-otp-code')?.value.trim();
  const newPass = document.getElementById('auth-new-password')?.value;
  const confirmPass = document.getElementById('auth-new-password-confirm')?.value;

  if (newPass !== confirmPass) {
    renderAuthModal('Passwords do not match');
    return false;
  }

  btn.disabled = true;
  btn.textContent = 'Updating password…';

  try {
    const res = await apiPost('/auth/reset-password', {
      email: resetFlowEmail,
      otp,
      new_password: newPass,
    });
    authModalMode = 'login';
    renderAuthModal(null, res.message || 'Password reset successfully! Please log in.');
  } catch (err) {
    renderAuthModal(err.body && err.body.error ? err.body.error : err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
  return false;
}
window.submitResetPassword = submitResetPassword;

async function logoutUser() {
  try { await apiPost('/auth/logout', {}); } catch (err) { /* ignore */ }
  window.setAccessToken(null);
  window.authUser = null;
  window.state.farm_id = 101; // back to the demo farm
  onAuthChanged();
  if (window.initAppAfterAuth) window.initAppAfterAuth();
}
window.logoutUser = logoutUser;

async function resendVerification(email) {
  const target = email || (window.authUser && window.authUser.email);
  if (!target) return;
  try {
    const data = await apiPost('/auth/resend-verification', { email: target });
    if (data.verification_link) {
      alert('Dev mode: no email provider configured.\nVerification link: ' + data.verification_link);
    } else if (document.getElementById('auth-modal-overlay')) {
      renderAuthModal(null, data.message);
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert(err.message);
  }
}
window.resendVerification = resendVerification;

// Called whenever login/signup/logout completes.
function onAuthChanged() {
  renderAccountWidget();
  if (window.state && window.state.activeView === 'dashboard' && window.VIEW_LOADERS.dashboard) {
    window.VIEW_LOADERS.dashboard();
  }
}
window.onAuthChanged = onAuthChanged;

// Silent-refresh callback wired from app.js's trySilentRefresh()
window.onAuthRestored = function (user) {
  window.authUser = user;
  isAuthMandatory = false;
  closeAuthModal(true);
  const farmChanged = user && user.farm_id && window.state.farm_id !== user.farm_id;
  if (farmChanged) window.state.farm_id = user.farm_id;
  renderAccountWidget();
  if (farmChanged && window.state.activeView === 'dashboard' && window.VIEW_LOADERS.dashboard) {
    window.VIEW_LOADERS.dashboard();
  }
  if (window.initAppAfterAuth) window.initAppAfterAuth();
};

// ── Boot: attempt to restore a session from the refresh cookie ──
document.addEventListener('DOMContentLoaded', async () => {
  renderAccountWidget();
  try {
    await window.trySilentRefresh();
  } catch (err) { /* not logged in */ }

  // Directly initialize app in guest mode (or restored session) without blocking login popup
  if (window.initAppAfterAuth) window.initAppAfterAuth();
});
