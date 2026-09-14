// ============================================================
// requireAuth.js — JWT access-token middleware
// ============================================================

const { verifyAccessToken } = require('../utils/auth');

function getTokenFromReq(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

// Populates req.user if a valid access token is present; never blocks the request.
function optionalAuth(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return next();
  try {
    req.user = verifyAccessToken(token);
  } catch (err) {
    // Invalid/expired token on an optional route — proceed unauthenticated.
  }
  next();
}

// Blocks the request with 401 unless a valid access token is present.
function requireAuth(req, res, next) {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ error: 'Authentication required. Please log in.' });
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required. Please log in.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `This action requires one of these roles: ${roles.join(', ')}.` });
    }
    next();
  };
}

module.exports = { optionalAuth, requireAuth, requireRole };
