// ============================================================
// soilScoring.js — Shared soil health scoring
// Used by both manual entry (soilAnalysis.js) and the ESP32
// live-sensor ingestion route (soilSensor.js) so both paths score
// identically.
// ============================================================

function scoreFactor(value, ideal, max = 100) {
  return Math.min(max, Math.max(0, (value / ideal) * max));
}

function phScore(ph) {
  if (ph >= 6.0 && ph <= 7.5) return 100;
  const dist = Math.min(Math.abs(ph - 6.0), Math.abs(ph - 7.5));
  return Math.max(0, 100 - dist * 40);
}

function computeHealth({ nitrogen, phosphorus, potassium, ph, organic_carbon }) {
  const nS  = scoreFactor(nitrogen,       120);
  const pS  = scoreFactor(phosphorus,      45);
  const kS  = scoreFactor(potassium,       90);
  const phS = phScore(ph);
  const ocS = scoreFactor(organic_carbon,   1.0, 100);

  const score = Math.round(nS * 0.25 + pS * 0.20 + kS * 0.20 + phS * 0.20 + ocS * 0.15);

  const deficiencies = [];
  const adequate     = [];

  if (nS  < 50) deficiencies.push('Low Nitrogen');       else adequate.push('Nitrogen');
  if (pS  < 50) deficiencies.push('Low Phosphorus');     else adequate.push('Phosphorus');
  if (kS  < 50) deficiencies.push('Low Potassium');      else adequate.push('Potassium');
  if (phS < 50) deficiencies.push('pH Imbalance');       else adequate.push('pH');
  if (ocS < 50) deficiencies.push('Low Organic Carbon'); else adequate.push('Organic Carbon');

  return { score, deficiencies, adequate };
}

module.exports = { computeHealth, scoreFactor, phScore };
