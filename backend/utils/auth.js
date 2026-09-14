// ============================================================
// auth.js — Password hashing, JWT issuance/verification,
// and email-verification token helpers.
// ============================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.warn('  ⚠️  [Auth] JWT_ACCESS_SECRET / JWT_REFRESH_SECRET not set in .env — using ephemeral in-memory secrets (sessions will not survive a server restart).');
}

// Fallback so the server never crashes if secrets are missing; regenerated per boot.
const effectiveAccessSecret = ACCESS_SECRET || crypto.randomBytes(48).toString('hex');
const effectiveRefreshSecret = REFRESH_SECRET || crypto.randomBytes(48).toString('hex');

const BCRYPT_ROUNDS = 12;

async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.user_id,
      role: user.role,
      email: user.email,
      name: user.name,
      farmer_id: user.farmer_id || null,
      buyer_id: user.buyer_id || null,
      org_name: user.org_name || null,
    },
    effectiveAccessSecret,
    { expiresIn: ACCESS_EXPIRES }
  );
}

function signRefreshToken(user, tokenVersion = 0) {
  return jwt.sign(
    { sub: user.user_id, tv: tokenVersion, type: 'refresh' },
    effectiveRefreshSecret,
    { expiresIn: REFRESH_EXPIRES }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, effectiveAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, effectiveRefreshSecret);
}

function generateOpaqueToken() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOpaqueToken,
};
