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
} = require('../utils/auth');
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

async function findUserByVerificationToken(token) {
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
    const verification_token = generateOpaqueToken();
    const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
      verification_token,
      verification_expires,
      token_version: 0,
      created_at: new Date().toISOString(),
    });

    const accessToken = await issueSession(newUser, res);

    // No email provider is wired up yet (no SMTP/SendGrid key in .env), so the
    // verification link is returned directly instead of silently pretending
    // to have emailed it. Wire sendVerificationEmail() to a real provider and
    // drop `verification_link` from the response once that's in place.
    const verification_link = `/api/auth/verify-email?token=${verification_token}`;
    console.log(`  ✉️  [Auth-DEV] Verification link for ${email}: ${verification_link}`);

    res.status(201).json({
      success: true,
      user: sanitize(newUser),
      access_token: accessToken,
      farm_id,
      dev_note: 'No email provider is configured — verification_link is returned directly for demo purposes instead of being emailed.',
      verification_link,
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
// GET /api/auth/verify-email?token=...
// ────────────────────────────────────────────────────────────
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing verification token' });

  const matched = await findUserByVerificationToken(token);
  if (!matched) return res.status(400).json({ error: 'Invalid or already-used verification token' });
  if (new Date(matched.verification_expires) < new Date()) {
    return res.status(400).json({ error: 'Verification link expired. Please request a new one.' });
  }

  await updateUser(matched.user_id, { email_verified: true, verification_token: null });
  res.json({ success: true, message: 'Email verified successfully.' });
});

// ────────────────────────────────────────────────────────────
// POST /api/auth/resend-verification
// ────────────────────────────────────────────────────────────
router.post('/resend-verification', authLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const user = await findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'No account found for that email' });
  if (user.email_verified) return res.json({ success: true, message: 'Email already verified.' });

  const verification_token = generateOpaqueToken();
  const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await updateUser(user.user_id, { verification_token, verification_expires });

  const verification_link = `/api/auth/verify-email?token=${verification_token}`;
  console.log(`  ✉️  [Auth-DEV] Verification link for ${email}: ${verification_link}`);

  res.json({
    success: true,
    dev_note: 'No email provider is configured — verification_link is returned directly for demo purposes.',
    verification_link,
  });
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
