// ============================================================
// clear_all_datasets.js — Clears all datasets from Supabase,
// local generated files, and Kaggle download cache.
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SECRET_KEY;

async function clearAll() {
  console.log('🗑️  Starting complete dataset removal...\n');

  // 1. Clear Supabase tables (if connected)
  if (url && key && !url.includes('your-project')) {
    try {
      const supabase = createClient(url, key);
      console.log('1. Clearing data from Supabase Cloud tables:');

      // Order matters due to foreign key constraints:
      // children first, then parents
      const tables = [
        'recommendations',
        'soil_simulation_log',
        'rotation_plan_seasons',
        'rotation_plans',
        'crop_evaluations',
        'crop_history',
        'weather_data',
        'soil_data',
        'crops',
        // Note: keeping farmers, farms, seasons structure or emptying them if desired
      ];

      for (const table of tables) {
        // Delete all rows where id is not null / >= 0
        const { error, count } = await supabase
          .from(table)
          .delete()
          .neq('created_at', '1970-01-01'); // matches all rows
        if (error) {
          // Fallback delete with another condition
          const { error: err2 } = await supabase.from(table).delete().filter('created_at', 'gte', '1970-01-01');
          if (err2) {
            console.warn(`   ⚠️ Could not clear ${table}:`, err2.message);
          } else {
            console.log(`   ✅ Cleared table '${table}'.`);
          }
        } else {
          console.log(`   ✅ Cleared table '${table}'.`);
        }
      }
    } catch (err) {
      console.warn('   ⚠️ Supabase clear failed:', err.message);
    }
  } else {
    console.log('1. Supabase not configured or credentials missing. Skipping cloud deletion.');
  }

  // 2. Reset backend/data/kaggle_crops.js
  console.log('\n2. Resetting backend/data/kaggle_crops.js...');
  const kaggleCropsFile = path.resolve(__dirname, '../data/kaggle_crops.js');
  const emptyKaggleCrops = `// ============================================================
// kaggle_crops.js — Cleared
// All datasets have been removed.
// Run process_crop_dataset.py with new dataset(s) to populate.
// ============================================================

const kaggleCrops = [];

module.exports = { kaggleCrops };
`;
  fs.writeFileSync(kaggleCropsFile, emptyKaggleCrops, 'utf8');
  console.log('   ✅ Reset kaggle_crops.js to empty array [].');

  // 3. Clear local in-memory seed records in seed.js
  console.log('\n3. Resetting in-memory seed collections in backend/data/seed.js...');
  const seedFile = path.resolve(__dirname, '../data/seed.js');
  const seedContent = `// ============================================================
// seed.js — In-memory database for CropSmart P025 (CLEARED)
// ============================================================

const { v4: uuidv4 } = require('uuid');
const { kaggleCrops } = require('./kaggle_crops');

const seasons = [
  { season_id: 1, name: 'Kharif', start_month: 6, end_month: 10 },
  { season_id: 2, name: 'Rabi',   start_month: 11, end_month: 3  },
  { season_id: 3, name: 'Zaid',   start_month: 4,  end_month: 5  },
];

const crops = [...kaggleCrops];

const farmers = [];
const farms = [];
let soil_data = [];
let crop_history = [];
let weather_data = [];

let crop_evaluations = [];
let rotation_plans = [];
let rotation_plan_seasons = [];
let soil_simulation_log = [];
let recommendations = [];

const counters = { soil_id: 1, eval_id: 1, plan_id: 1, plan_season_id: 1, sim_id: 1, rec_id: 1, history_id: 1 };

module.exports = {
  seasons, crops, farmers, farms,
  soil_data, crop_history, weather_data,
  crop_evaluations, rotation_plans, rotation_plan_seasons,
  soil_simulation_log, recommendations,
  counters,
  uuidv4,
};
`;
  fs.writeFileSync(seedFile, seedContent, 'utf8');
  console.log('   ✅ Cleared in-memory seed tables.');

  // 4. Remove downloaded Kaggle dataset cache from disk
  console.log('\n4. Removing downloaded Kaggle cache directories...');
  const cacheBase = path.join(os.homedir(), '.cache', 'kagglehub', 'datasets');
  const targetFolders = ['madhuraatmarambhagat', 'aksahaha', 'javakhan'];

  for (const folder of targetFolders) {
    const targetPath = path.join(cacheBase, folder);
    if (fs.existsSync(targetPath)) {
      try {
        fs.rmSync(targetPath, { recursive: true, force: true });
        console.log(`   ✅ Deleted cache: ${targetPath}`);
      } catch (e) {
        console.warn(`   ⚠️ Could not delete ${targetPath}:`, e.message);
      }
    } else {
      console.log(`   ℹ️ Cache not found (already clean): ${folder}`);
    }
  }

  console.log('\n✨ ALL CURRENT DATA SETS AND RECORDS REMOVED SUCCESSFULLY!\n');
}

clearAll().catch(err => {
  console.error('Fatal error during clear:', err);
  process.exit(1);
});
