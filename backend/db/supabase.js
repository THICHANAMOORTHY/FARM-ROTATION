// ============================================================
// supabase.js — Supabase client & repository layer
// ============================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const memDb = require('../data/seed');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_KEY || '';

const isConfigured = Boolean(
  url &&
  key &&
  !url.includes('your-project') &&
  !key.includes('your-anon')
);

let supabase = null;

if (isConfigured) {
  try {
    supabase = createClient(url, key);
    console.log('  ⚡ [Database] Connected to Supabase Cloud:', url);
  } catch (err) {
    console.error('  ⚠️ [Database] Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.log('  ℹ️ [Database] Supabase credentials not set in .env. Using in-memory fallback.');
}

module.exports = {
  supabase,
  isConfigured: () => Boolean(supabase),
  memDb,
};
