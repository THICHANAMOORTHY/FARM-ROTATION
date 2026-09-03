require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { supabase, isConfigured } = require('./db/supabase');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/soil-analysis',    require('./routes/soilAnalysis'));
app.use('/api/crop-history',     require('./routes/cropHistory'));
app.use('/api/candidate-crops',  require('./routes/candidateCrops'));
app.use('/api/crop-evaluation',  require('./routes/cropEvaluation'));
app.use('/api/optimize-rotation',require('./routes/optimizeRotation'));
app.use('/api/soil-simulation',  require('./routes/soilSimulation'));
app.use('/api/recommendation',   require('./routes/recommendation'));
app.use('/api/dashboard',        require('./routes/dashboard'));
app.use('/api/weather',          require('./routes/weather'));
app.use('/api/report',           require('./routes/report'));

// ── Downloadable Assets & Export Routes ────────────────────
app.use('/downloads', express.static(path.join(__dirname, '..', 'downloads')));

app.get('/download/farmer-plan-pdf', (req, res) => {
  const filePath = path.join(__dirname, '..', 'downloads', 'CropSmart_Farmer_Soil_Health_Action_Plan.pdf');
  res.download(filePath, 'CropSmart_Farmer_Soil_Health_Action_Plan.pdf');
});

app.get('/download/crops-csv', (req, res) => {
  const filePath = path.join(__dirname, '..', 'downloads', 'CropSmart_Master_60_Crops_Agronomy_Mandi.csv');
  res.download(filePath, 'CropSmart_Master_60_Crops_Agronomy_Mandi.csv');
});

app.get('/download/crops-json', (req, res) => {
  const filePath = path.join(__dirname, '..', 'downloads', 'CropSmart_Master_60_Crops_Agronomy_Mandi.json');
  res.download(filePath, 'CropSmart_Master_60_Crops_Agronomy_Mandi.json');
});

// Quick reference endpoints
const db = require('./data/seed');

app.get('/api/crops', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('crops').select('*').order('crop_id');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {
      console.warn('Supabase query failed, falling back to in-memory:', err.message);
    }
  }
  res.json(db.crops);
});

app.get('/api/farms', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('farms').select('*');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {}
  }
  res.json(db.farms);
});

app.get('/api/seasons', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('seasons').select('*');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {}
  }
  res.json(db.seasons);
});

app.get('/api/farmers', async (req, res) => {
  if (isConfigured()) {
    try {
      const { data, error } = await supabase.from('farmers').select('*');
      if (!error && data && data.length) return res.json(data);
    } catch (err) {}
  }
  res.json(db.farmers);
});

// Health check & Database status
app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  service: 'CropSmart P025 API',
  database: isConfigured() ? 'Supabase Cloud PostgreSQL' : 'In-Memory (Set SUPABASE_URL in .env to connect)',
  time: new Date()
}));

app.get('/api/db-status', (req, res) => res.json({
  supabase_configured: isConfigured(),
  provider: isConfigured() ? 'Supabase' : 'In-Memory Mock',
  instructions: isConfigured()
    ? 'Supabase is connected!'
    : 'To connect Supabase, add SUPABASE_URL and SUPABASE_KEY to backend/.env, then run: npm run db:sync'
}));

// Fallback → serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  🌱  CropSmart P025 API');
  console.log(`  🚀  Running on http://localhost:${PORT}`);
  console.log(`  📊  Dashboard → http://localhost:${PORT}`);
  console.log('');
});
