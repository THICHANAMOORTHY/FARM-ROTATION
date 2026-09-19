// ============================================================
// mailer.js — Transactional email (account verification)
// Generic SMTP via nodemailer, so any provider works (Gmail app
// password, Brevo, SendGrid/SES SMTP, Mailgun, ...). Configured
// entirely through env vars; when SMTP isn't configured the app runs
// in "dev mode" and auth.js falls back to returning the link directly.
// ============================================================

const nodemailer = require('nodemailer');

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

let transport = null;
function getTransport() {
  if (transport) return transport;
  const port = Number(process.env.SMTP_PORT) || 587;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 = implicit TLS; 587/25 = STARTTLS (upgraded automatically)
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    // Don't let a dead SMTP server hang the sign-up request.
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transport;
}

// Base URL used to build links in emails. Deliberately NOT derived from the
// request's Host header, which an attacker controls.
function appBaseUrl() {
  const configured = process.env.APP_BASE_URL;
  if (configured) return configured.replace(/\/+$/, '');
  return `http://localhost:${process.env.PORT || 3000}`;
}

function buildVerificationLink(token) {
  return `${appBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

async function sendVerificationEmail({ to, name, link }) {
  const safeName = escapeHtml(name || 'there');
  const subject = 'Verify your email — UZHAVU KAAPPAAN (உழவு காப்பான்)';

  const text =
`Hello ${name || 'there'},

Welcome to UZHAVU KAAPPAAN. Please confirm your email address by opening this link (valid for 24 hours):

${link}

உங்கள் மின்னஞ்சலை உறுதிப்படுத்த மேலே உள்ள இணைப்பைத் திறக்கவும்.

If you didn't create this account, you can ignore this email.`;

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h2 style="color:#15803d;margin:0 0 12px">🌱 UZHAVU KAAPPAAN</h2>
  <p>Hello ${safeName},</p>
  <p>Welcome! Please confirm your email address to activate your account.</p>
  <p style="margin:24px 0">
    <a href="${escapeHtml(link)}" style="background:#16a34a;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Verify my email</a>
  </p>
  <p style="color:#6b7280;font-size:13px">உங்கள் மின்னஞ்சலை உறுதிப்படுத்த மேலே உள்ள பொத்தானை அழுத்தவும்.</p>
  <p style="color:#6b7280;font-size:13px">This link is valid for 24 hours. If the button doesn't work, paste this into your browser:<br>
    <span style="word-break:break-all">${escapeHtml(link)}</span></p>
  <p style="color:#6b7280;font-size:13px">If you didn't create this account, you can ignore this email.</p>
</div>`;

  return getTransport().sendMail({ from: process.env.MAIL_FROM, to, subject, text, html });
}

module.exports = { isMailConfigured, sendVerificationEmail, buildVerificationLink };
