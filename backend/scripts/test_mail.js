// ============================================================
// test_mail.js — Verify the SMTP settings in backend/.env before relying on
// them for sign-up. Logs in to the SMTP server, then sends a sample
// verification email.
//
//   npm run mail:test                 -> sends to SMTP_USER
//   npm run mail:test -- you@mail.com -> sends to that address
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { isMailConfigured, getTransport, sendVerificationEmail, buildVerificationLink } = require('../utils/mailer');

(async () => {
  if (!isMailConfigured()) {
    console.error('✖ SMTP is not configured. Set SMTP_HOST and MAIL_FROM (plus SMTP_USER / SMTP_PASS) in backend/.env — see backend/.env.example.');
    process.exit(1);
  }

  const to = process.argv[2] || process.env.SMTP_USER;
  if (!to) {
    console.error('✖ No recipient. Pass one: npm run mail:test -- you@example.com');
    process.exit(1);
  }

  console.log(`Connecting to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587} as ${process.env.SMTP_USER || '(no auth)'} …`);
  await getTransport().verify();
  console.log('✔ SMTP login OK');

  await sendVerificationEmail({ to, name: 'SMTP test', link: buildVerificationLink('test-token-not-real') });
  console.log(`✔ Test email sent to ${to} — check the inbox (and spam folder).`);
})().catch(err => {
  console.error(`✖ ${err.message}`);
  if (err.code === 'EAUTH') {
    console.error('  Login rejected. For Gmail use a 16-character App Password (Google Account → Security → 2-Step Verification → App passwords), not your normal password.');
  } else if (err.code === 'ESOCKET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNECTION') {
    console.error('  Could not reach the SMTP server — check SMTP_HOST / SMTP_PORT and that outbound SMTP isn\'t blocked by your network.');
  }
  process.exit(1);
});
