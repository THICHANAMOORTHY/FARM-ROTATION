const express = require('express');
const cors = require('cors');
const path = require('path');

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

// Quick reference endpoints
const db = require('./data/seed');

app.get('/api/crops', (req, res) => res.json(db.crops));
app.get('/api/farms', (req, res) => res.json(db.farms));
app.get('/api/seasons', (req, res) => res.json(db.seasons));
app.get('/api/farmers', (req, res) => res.json(db.farmers));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'CropSmart P025 API', time: new Date() }));

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
