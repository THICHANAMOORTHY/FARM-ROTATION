// ============================================================
// withTimeout.js — Bounds how long we'll wait on a slow/rate-limited
// external API call (Gemini, etc.) before giving up and letting the
// caller fall back to a deterministic alternative. Without this, a
// rate-limited API key can make a request hang or slow-retry for
// 10+ seconds — indistinguishable from "broken" to a user.
// ============================================================

function withTimeout(promise, ms, timeoutMessage = 'Operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMessage)), ms)),
  ]);
}

module.exports = { withTimeout };
