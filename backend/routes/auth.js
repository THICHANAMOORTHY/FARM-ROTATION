// ============================================================
// auth.js — Account creation & session management
// Supports two roles: 'farmer' (Farmer Mode) and 'buyer' (B2B Enterprise Hub)
// Dual-mode persistence: Supabase (if configured) else in-memory (seed.js)
// ============================================================

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { supabase, isConfigured, memDb } = require('../db/supabase');
const {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateOpaqueToken,
  hashToken,
} = require('../utils/auth');
const { isMailConfigured, sendVerificationEmail, buildVerificationLink } = require('../utils/mailer');
const { requireAuth } = require('../middleware/requireAuth');

const REFRESH_COOKIE = 'ukp_refresh';
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// ── Rate limiting on sensitive auth endpoints ─────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts from this device. Please try again in a few minutes.' },
});

// ── Data access helpers (Supabase-first, in-memory fallback) ──
async function findUserByEmail(email) {
  const emailLc = String(email).toLowerCase();
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('email', emailLc).maybeSingle();
      if (!error && data) return data;
      if (!error && !data) return null;
    } catch (err) {
      console.warn('[auth] Supabase findUserByEmail failed, falling back to in-memory:', err.message);
    }
  }
  return memDb.users.find(u => u.email.toLowerCase() === emailLc) || null;
}

async function findUserById(userId) {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('user_id', userId).maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[auth] Supabase findUserById failed, falling back to in-memory:', err.message);
    }
  }
  return memDb.users.find(u => u.user_id === userId) || null;
}

async function findUserByVerificationToken(rawToken) {
  const token = hashToken(rawToken);
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('verification_token', token).maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[auth] Supabase findUserByVerificationToken failed, falling back to in-memory:', err.message);
    }
  }
  return memDb.users.find(u => u.verification_token === token) || null;
}

async function insertUser(user) {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').insert(user).select().single();
      if (!error && data) return data;
      console.warn('[auth] Supabase insertUser failed, falling back to in-memory:', error && error.message);
    } catch (err) {
      console.warn('[auth] Supabase insertUser threw, falling back to in-memory:', err.message);
    }
  }
  const localUser = { ...user, user_id: user.user_id || (++memDb.counters.user_id) };
  memDb.users.push(localUser);
  return localUser;
}

async function updateUser(userId, patch) {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('users').update(patch).eq('user_id', userId).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('[auth] Supabase updateUser failed, falling back to in-memory:', err.message);
    }
  }
  const u = memDb.users.find(x => x.user_id === userId);
  if (u) Object.assign(u, patch);
  return u;
}

function sanitize(user) {
  if (!user) return null;
  const { password_hash, verification_token, ...safe } = user;
  return safe;
}

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const lastVerificationSent = new Map(); // email -> timestamp (per-instance cooldown)

// Creates a fresh token (stored hashed), emails the raw link, and reports how
// it went. With no SMTP configured it returns the link instead (dev mode).
async function issueVerification(user) {
  const rawToken = generateOpaqueToken();
  const patch = {
    verification_token: hashToken(rawToken),
    verification_expires: new Date(Date.now() + VERIFICATION_TTL_MS).toISOString(),
  };
  const link = buildVerificationLink(rawToken);

  if (!isMailConfigured()) {
    console.log(`  ✉️  [Auth-DEV] No SMTP configured — verification link for ${user.email}: ${link}`);
    return { patch, email_sent: false, dev_link: link };
  }
  try {
    await sendVerificationEmail({ to: user.email, name: user.name, link });
    lastVerificationSent.set(user.email, Date.now());
    return { patch, email_sent: true };
  } catch (err) {
    console.error(`[auth] Failed to send verification email to ${user.email}:`, err.message);
    return { patch, email_sent: false, send_failed: true };
  }
}

async function issueSession(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.token_version || 0);
  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  return accessToken;
}

// ────────────────────────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────────────────────────
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { role, name, email, password, phone, org_name, preferred_lang } = req.body;

    if (!role || !['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ error: "role must be 'farmer' or 'buyer'" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (role === 'buyer' && !org_name) {
      return res.status(400).json({ error: 'org_name is required for B2B buyer accounts' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await hashPassword(password);
    const verification = await issueVerification({ email: email.toLowerCase(), name: role === 'buyer' ? org_name : name });

    let farmer_id = null;
    let buyer_id = null;
    let farm_id = null;

    if (role === 'farmer') {
      farmer_id = ++memDb.counters.farmer_id;
      memDb.farmers.push({
        farmer_id,
        name,
        phone: phone || null,
        email: email.toLowerCase(),
        preferred_lang: preferred_lang || 'en',
      });
      // Give every new farmer a starter farm so the dashboard has something to show.
      farm_id = ++memDb.counters.farm_id;
      memDb.farms.push({
        farm_id, farmer_id,
        name: `${name.split(' ')[0]}'s Farm`,
        location_name: 'Unset Location',
        latitude: 11.0168, longitude: 76.9558,
        area_acres: 1.0,
        irrigation: 'Rainfed',
        irrigation_type: 'Rainfed',
      });
    } else {
      buyer_id = memDb.corporate_buyers.length
        ? Math.max(...memDb.corporate_buyers.map(b => b.buyer_id)) + 1
        : 1;
      memDb.corporate_buyers.push({
        buyer_id,
        name: org_name,
        contact_person: name,
        contact_email: email.toLowerCase(),
        contact_phone: phone || null,
      });
    }

    const newUser = await insertUser({
      role,
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      org_name: role === 'buyer' ? org_name : null,
      farmer_id,
      buyer_id,
      password_hash,
      email_verified: false,
      ...verification.patch,
      token_version: 0,
      created_at: new Date().toISOString(),
    });

    // With SMTP configured, the account stays locked until the emailed link is
    // used, so no session is issued here. In dev mode (no SMTP) keep the old
    // behaviour so the demo still works end-to-end.
    if (isMailConfigured()) {
      return res.status(201).json({
        success: true,
        verification_required: true,
        email_sent: verification.email_sent,
        email: newUser.email,
        farm_id,
        message: verification.email_sent
          ? `We sent a verification link to ${newUser.email}. Open it to activate your account.`
          : 'Your account was created, but we could not send the verification email. Use "Resend verification email" to try again.',
      });
    }

    const accessToken = await issueSession(newUser, res);
    res.status(201).json({
      success: true,
      user: sanitize(newUser),
      access_token: accessToken,
      farm_id,
      dev_note: 'No SMTP provider is configured (SMTP_HOST / MAIL_FROM) — verification_link is returned directly for demo purposes instead of being emailed.',
      verification_link: verification.dev_link,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────────────────────────
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Checked after the password so this only tells the account owner.
    if (isMailConfigured() && !user.email_verified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in. Check your inbox for the link, or request a new one.',
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    const accessToken = await issueSession(user, res);
    res.json({ success: true, user: sanitize(user), access_token: accessToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/refresh — rotate refresh token, issue new access token
// ────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies && req.cookies[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: 'No active session' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const user = await findUserById(payload.sub);
    if (!user || (user.token_version || 0) !== payload.tv) {
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
      return res.status(401).json({ error: 'Session no longer valid. Please log in again.' });
    }

    if (isMailConfigured() && !user.email_verified) {
      res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
      return res.status(401).json({ error: 'Please verify your email to continue.', code: 'EMAIL_NOT_VERIFIED' });
    }

    const accessToken = await issueSession(user, res); // rotates the refresh cookie too
    res.json({ success: true, access_token: accessToken, user: sanitize(user) });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh session' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTS);
  res.json({ success: true });
});

// ────────────────────────────────────────────────────────────
// Email verification
// GET  /api/auth/verify-email?token=...  -> confirmation page (does NOT consume the token)
// POST /api/auth/verify-email            -> consumes the token
// The two-step flow matters: mail scanners (Outlook Safe Links, Gmail
// previews, antivirus) auto-open links, and a GET that consumed the token
// would burn it before the user ever clicks.
// ────────────────────────────────────────────────────────────
function verifyPage(token) {
  const safeToken = String(token).replace(/[^a-zA-Z0-9]/g, '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Verify your email — UZHAVU KAAPPAAN</title>
<style>body{font-family:Arial,Helvetica,sans-serif;background:#0b1410;color:#e5efe8;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.card{background:#12211a;border:1px solid #1f3a2c;border-radius:14px;padding:32px;max-width:420px;text-align:center}
h1{color:#4ade80;font-size:22px;margin:0 0 10px}p{color:#a7c4b4;line-height:1.5}
button,a.btn{display:inline-block;background:#16a34a;color:#fff;border:0;padding:12px 24px;border-radius:8px;font-size:16px;font-weight:bold;cursor:pointer;text-decoration:none;margin-top:12px}
.err{color:#f87171}</style></head><body><div class="card">
<h1>🌱 UZHAVU KAAPPAAN</h1>
<div id="box"><p>Confirm your email address to activate your account.<br><small>உங்கள் மின்னஞ்சலை உறுதிப்படுத்தவும்.</small></p>
<button id="go">Confirm my email</button></div></div>
<script>
document.getElementById('go').addEventListener('click', async function () {
  var box = document.getElementById('box'); this.disabled = true; this.textContent = 'Verifying…';
  try {
    var r = await fetch('/api/auth/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: '${safeToken}' }) });
    var d = await r.json();
    if (r.ok) { box.innerHTML = '<p>✅ ' + d.message + '</p><a class="btn" href="/">Continue to log in</a>'; }
    else { box.innerHTML = '<p class="err">⚠ ' + (d.error || 'Verification failed.') + '</p><a class="btn" href="/">Back to the app</a>'; }
  } catch (e) { box.innerHTML = '<p class="err">⚠ Network error. Please try the link again.</p>'; }
});
</script></body></html>`;
}

router.get('/verify-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing verification token');
  res.set('Cache-Control', 'no-store').type('html').send(verifyPage(token));
});

router.post('/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing verification token' });

    const matched = await findUserByVerificationToken(token);
    if (!matched) return res.status(400).json({ error: 'This link is invalid or has already been used. If you already verified, just log in.' });
    if (new Date(matched.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'This link has expired. Log in and request a new verification email.' });
    }

    await updateUser(matched.user_id, { email_verified: true, verification_token: null, verification_expires: null });
    res.json({ success: true, message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('Verify-email error:', err);
    res.status(500).json({ error: 'Failed to verify email' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-verification
// Always answers the same way so it can't be used to discover which emails
// have accounts.
// ────────────────────────────────────────────────────────────
router.post('/resend-verification', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const generic = { success: true, message: 'If that account exists and is not yet verified, a new verification email is on its way.' };

  try {
    const user = await findUserByEmail(email);
    if (!user || user.email_verified) return res.json(generic);

    const last = lastVerificationSent.get(user.email);
    if (last && Date.now() - last < RESEND_COOLDOWN_MS) return res.json(generic);

    const verification = await issueVerification(user);
    await updateUser(user.user_id, verification.patch);

    if (!isMailConfigured()) {
      return res.json({ ...generic, dev_note: 'No SMTP provider is configured — link returned for demo purposes.', verification_link: verification.dev_link });
    }
    res.json(generic);
  } catch (err) {
    console.error('Resend-verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitize(user) });
});

module.exports = router;
