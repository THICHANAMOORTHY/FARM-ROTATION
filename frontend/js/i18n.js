// ============================================================
// i18n.js — Multi-Language Support (English & Tamil தமிழ்)
// ============================================================

const TRANSLATIONS = {
  en: {
    // Brand & Nav
    brandSubtitle: "P025 · Soil Restorer",
    navMain: "Main",
    navAnalysis: "Analysis",
    navOutput: "Output",
    navDashboard: "Dashboard",
    navSoilAnalysis: "Soil Analysis",
    navCropHistory: "Crop History",
    navEvaluation: "Crop Evaluation",
    navRotation: "Rotation Optimizer",
    navSimulation: "Soil Simulation",
    navRecommendation: "Recommendation",
    activeFarm: "Active Farm",
    acresDrip: "4.5 acres · Drip Irrigation",

    // Dashboard
    dashboardTitle: "Farm Dashboard",
    downloadPdf: "Download Action Plan (PDF)",
    soilHealthScore: "Soil Health Score",
    recommendedNextCrop: "Recommended Next Crop",
    expectedProfit: "Expected Profit / Acre",
    activeRotationPlan: "Active Rotation Plan",
    soilAlertsTitle: "⚠️ Soil Deficiencies & Monoculture Warnings",
    monocultureWarningText: "Continuous cultivation penalty detected: Growing the same crop continuously depletes specific nutrients and increases disease susceptibility.",
    recoveryTrendTitle: "Projected Soil Recovery Trend",
    quickActionsTitle: "Quick Actions",
    btnRunSoilTest: "Run Soil Test",
    btnOptimizeRotation: "Optimize Rotation",
    btnViewRecommendation: "View Recommendation",

    // Soil Analysis
    soilAnalysisTitle: "Soil Health Diagnosis",
    soilAnalysisSubtitle: "Enter NPK lab test values or adjust sliders to diagnose soil health",
    nitrogenLabel: "Nitrogen (N) — kg/ha",
    phosphorusLabel: "Phosphorus (P) — kg/ha",
    potassiumLabel: "Potassium (K) — kg/ha",
    phLabel: "Soil pH (Acidity / Alkalinity)",
    organicCarbonLabel: "Organic Carbon (%)",
    btnAnalyseSoil: "🧪 Analyse Soil Health",

    // Recommendations
    recTitle: "Final Recommendation",
    recSubtitle: "AI-powered crop + rotation recommendation for your farm",
    whyThisCrop: "Why This Crop?",
    projectedSoilRecovery: "Projected Soil Recovery",
    recommendedRotation: "Recommended 4-Season Rotation",
    btnBackDashboard: "📊 Back to Dashboard",
    btnReanalyseSoil: "🔬 Re-analyse Soil",
    btnDownloadPlanPdf: "📄 Download Farmer Action Plan (PDF)",
    downloadingPdf: "⏳ Generating PDF…",

    // Statuses
    optimal: "Optimal",
    moderateDepletion: "Moderate Depletion",
    criticalDeficit: "Critical Deficit",
    nitrogenFixer: "N-Fixer",
    legume: "Legume",
    cereal: "Cereal",
    fruit: "Fruit",
    vegetable: "Vegetable",
    commercial: "Commercial",
    spices: "Spices",
    oilseed: "Oilseed",
  },

  ta: {
    // Brand & Nav
    brandSubtitle: "P025 · மண் வளம் மீட்பு & பயிர் சுழற்சி",
    navMain: "முதன்மை",
    navAnalysis: "பகுப்பாய்வு",
    navOutput: "பரிந்துரை",
    navDashboard: "முகப்பு பலகை",
    navSoilAnalysis: "மண் பரிசோதனை",
    navCropHistory: "பயிர் வரலாறு",
    navEvaluation: "பயிர் மதிப்பீடு",
    navRotation: "சுழற்சி உகப்பாக்கி",
    navSimulation: "மண் வளம் உருவகப்படுத்துதல்",
    navRecommendation: "இறுதி பரிந்துரை",
    activeFarm: "செயலில் உள்ள பண்ணை",
    acresDrip: "4.5 ஏக்கர் · சொட்டு நீர் பாசனம்",

    // Dashboard
    dashboardTitle: "பண்ணை முகப்பு பலகை",
    downloadPdf: "செயல்திட்ட அறிக்கை (PDF)",
    soilHealthScore: "மண் வள மதிப்பீடு",
    recommendedNextCrop: "பரிந்துரைக்கப்படும் அடுத்த பயிர்",
    expectedProfit: "எதிர்பார்க்கப்படும் லாபம் / ஏக்கர்",
    activeRotationPlan: "செயலில் உள்ள பயிர் சுழற்சி திட்டம்",
    soilAlertsTitle: "⚠️ மண் ஊட்டச்சத்து குறைபாடுகள் & தொடர் பயிரிடுதல் எச்சரிக்கைகள்",
    monocultureWarningText: "தொடர் பயிரிடுதல் அபாயம் கண்டறியப்பட்டது: ஒரே பயிரை தொடர்ந்து பயிரிடுவது குறிப்பிட்ட சத்துக்களை அழித்து பூச்சித் தாக்குதலை அதிகரிக்கும்.",
    recoveryTrendTitle: "எதிர்பார்க்கப்படும் மண் வளம் மீட்பு பாதை",
    quickActionsTitle: "விரைவு செயல்பாடுகள்",
    btnRunSoilTest: "மண் பரிசோதனை செய்",
    btnOptimizeRotation: "சுழற்சியை உகப்பாக்கு",
    btnViewRecommendation: "பரிந்துரையை பார்க்க",

    // Soil Analysis
    soilAnalysisTitle: "மண் வள நோயறிதல்",
    soilAnalysisSubtitle: "மண் பரிசோதனை முடிவுகளை உள்ளிட்டு உங்கள் நிலத்தின் ஆரோக்கியத்தை பரிசோதிக்கவும்",
    nitrogenLabel: "தழைச்சத்து (நைட்ரஜன் - N) — கிலோ/ஹெக்டேர்",
    phosphorusLabel: "மணிச்சத்து (பாஸ்பரஸ் - P) — கிலோ/ஹெக்டேர்",
    potassiumLabel: "சாம்பல் சத்து (பொட்டாசியம் - K) — கிலோ/ஹெக்டேர்",
    phLabel: "மண் கார அமிலத்தன்மை (pH)",
    organicCarbonLabel: "மண் கரிம வளம் (%)",
    btnAnalyseSoil: "🧪 மண் ஆரோக்கியத்தை பரிசோதி",

    // Recommendations
    recTitle: "இறுதி பரிந்துரை & செயல்திட்டம்",
    recSubtitle: "செயற்கை நுண்ணறிவு அடிப்படையிலான உகந்த பயிர் மற்றும் சுழற்சி திட்டம்",
    whyThisCrop: "ஏன் இந்த பயிர்?",
    projectedSoilRecovery: "எதிர்பார்க்கப்படும் மண் வளம் மீட்பு",
    recommendedRotation: "பரிந்துரைக்கப்பட்ட 4-பருவ பயிர் சுழற்சி",
    btnBackDashboard: "📊 முகப்பிற்கு திரும்புக",
    btnReanalyseSoil: "🔬 மீண்டும் பரிசோதிக்க",
    btnDownloadPlanPdf: "📄 விவசாயி செயல்திட்ட அறிக்கை (PDF)",
    downloadingPdf: "⏳ அறிக்கை தயாராகிறது…",

    // Statuses
    optimal: "சிறந்த நிலை",
    moderateDepletion: "மிதமான சத்து குறைவு",
    criticalDeficit: "தீவிர ஊட்டச்சத்து பற்றாக்குறை",
    nitrogenFixer: "தழைச்சத்து நிலைநிறுத்தி",
    legume: "பயறு வகை (லெகூம்)",
    cereal: "தானிய வகை",
    fruit: "பழ வகை",
    vegetable: "காய்கறி வகை",
    commercial: "பணப்பயிர்",
    spices: "நறுமணப் பயிர்",
    oilseed: "எண்ணெய் வித்து",
  }
};

// ── Tamil Crop Names Dictionary ──────────────────────────────
const CROP_TRANSLATIONS_TA = {
  "Tomato": "தக்காளி (Tomato)",
  "Green Gram": "பாசிப்பயறு (Green Gram)",
  "Black Gram": "உளுந்து (Black Gram)",
  "Groundnut": "வேர்க்கடலை (Groundnut)",
  "Rice": "நெல் (Paddy/Rice)",
  "Wheat": "கோதுமை (Wheat)",
  "Maize": "மக்காச்சோளம் (Maize)",
  "Cotton": "பருத்தி (Cotton)",
  "Sugarcane": "கரும்பு (Sugarcane)",
  "Banana": "வாழை (Banana)",
  "Coconut": "தென்னை (Coconut)",
  "Onion": "வெங்காயம் (Onion)",
  "Potato": "உருளைக்கிழங்கு (Potato)",
  "Chickpea": "கொண்டைக்கடலை (Chickpea)",
  "Pigeon Pea": "துவரம்பருப்பு (Pigeon Pea)",
  "Soybean": "சோயாபீன் (Soybean)",
  "Mustard": "கடுகு (Mustard)",
  "Garlic": "பூண்டு (Garlic)",
  "Ginger": "இஞ்சி (Ginger)",
  "Turmeric": "மஞ்சள் (Turmeric)",
  "Dry Chillies": "காய்ந்த மிளகாய் (Dry Chillies)",
  "Apple": "ஆப்பிள் (Apple)",
  "Mango": "மாம்பழம் (Mango)",
  "Pomegranate": "மாதுளை (Pomegranate)",
  "Watermelon": "தர்பூசணி (Watermelon)",
  "Grapes": "திராட்சை (Grapes)",
  "Papaya": "பப்பாளி (Papaya)",
  "Sweet Potato": "சர்க்கரைவள்ளிக்கிழங்கு",
  "Tapioca": "மரவள்ளிக்கிழங்கு (Tapioca)",
  "Jute": "சணல் (Jute)",
  "Coffee": "காபி (Coffee)",
  "Tobacco": "புகையிலை (Tobacco)",
  "Sunflower": "சூரியகாந்தி (Sunflower)",
  "Sesamum": "எள் (Sesamum)",
  "Bajra": "கம்பு (Pearl Millet)",
  "Jowar": "சோளம் (Sorghum)",
  "Ragi": "கேழ்வரகு (Ragi)",
  "Barley": "பார்லி (Barley)",
  "Small millets": "சிறு தானியங்கள் (Small Millets)",
  "Kidney Bean": "ராஜ்மா / காராமணி",
  "Red Lentil": "மைசூர் பருப்பு (Red Lentil)",
  "Moth Bean": "நரிப்பயறு (Moth Bean)",
  "Peas & Beans": "பட்டாணி & பீன்ஸ்",
  "Cowpea": "தட்டப்பயறு (Cowpea)",
  "Horse-gram": "கொள்ளு (Horse-gram)",
  "Cardamom": "ஏலக்காய் (Cardamom)",
  "Black pepper": "கருப்பு மிளகு (Black Pepper)",
  "Coriander": "கொத்தமல்லி (Coriander)",
  "Cashewnut": "முந்திரி (Cashewnut)",
  "Arecanut": "பாக்கு (Arecanut)",
};

// ── Tamil Soil Alerts Dictionary ─────────────────────────────
const ALERT_TRANSLATIONS_TA = {
  "Low Nitrogen": "குறைந்த தழைச்சத்து (நைட்ரஜன் - N)",
  "Low Organic Carbon": "குறைந்த கரிம வளம் (Organic Carbon)",
  "Low Phosphorus": "குறைந்த மணிச்சத்து (பாஸ்பரஸ் - P)",
  "Low Potassium": "குறைந்த சாம்பல் சத்து (பொட்டாசியம் - K)",
  "Continuous cultivation": "தொடர் பயிரிடுதல் அபாயம் (தக்காளி)",
  "Continuous cultivation penalty": "தொடர் பயிரிடுதல் அபாயம் (பூச்சி மற்றும் ஊட்டச்சத்து இழப்பு)",
  "High Nitrogen": "அதிகப்படியான தழைச்சத்து",
  "High Acidity": "அதிக அமிலத்தன்மை (குறைந்த pH)",
  "High Alkalinity": "அதிக காரத்தன்மை (அதிக pH)",
};

// ── Tamil Reasoning Phrases ──────────────────────────────────
const REASONING_TRANSLATIONS_TA = {
  "Improves nitrogen balance through biological fixation": "இயற்கை வேர் முடிச்சுகள் மூலம் வளிமண்டல தழைச்சத்தை மண்ணில் நிலைநிறுத்துகிறது",
  "Breaks repeated cultivation cycle": "ஒரே பயிரைத் தொடர்ந்து பயிரிடும் சுழற்சியை உடைத்து மண் வளத்தை மீட்டெடுக்கிறது",
  "Breaks continuous cultivation disease cycle": "தொடர் பயிர் சாகுபடியினால் ஏற்படும் பூச்சி மற்றும் நோய் பரவல் சுழற்சியை உடைக்கிறது",
  "Low water requirement suits current irrigation": "குறைந்த நீர் தேவை தற்போதைய பாசன வசதிக்கு மிகவும் பொருத்தமானது",
  "Strong projected profitability per acre": "சந்தை விலைகளின் அடிப்படையில் ஏக்கருக்கு அதிக நிகர லாபம் தரும்",
  "Low disease risk compared to alternatives": "மாற்றுப் பயிர்களை விட பூச்சி மற்றும் நோய் தாக்குதல் அபாயம் மிகக் குறைவு",
  "High market demand": "சந்தையில் நிலையான அதிக கிராக்கி உள்ளது",
};

let currentLang = localStorage.getItem('cropsmart_lang') || 'en';

function getLanguage() {
  return currentLang;
}

function setLanguage(lang) {
  currentLang = lang === 'ta' ? 'ta' : 'en';
  localStorage.setItem('cropsmart_lang', currentLang);
  updateLanguageUI();
  
  // Re-render the active view with translated content
  if (window.state && window.state.activeView && window.VIEW_LOADERS) {
    const loader = window.VIEW_LOADERS[window.state.activeView];
    if (loader) loader();
  }
}

function t(key, fallback = '') {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || fallback;
}

function tCrop(name) {
  if (currentLang === 'ta') {
    return CROP_TRANSLATIONS_TA[name] || name;
  }
  return name;
}

function tAlert(alertText) {
  if (currentLang === 'ta') {
    for (const [enKey, taVal] of Object.entries(ALERT_TRANSLATIONS_TA)) {
      if (alertText.toLowerCase().includes(enKey.toLowerCase())) {
        return taVal;
      }
    }
  }
  return alertText;
}

function tReason(reasonText) {
  if (currentLang === 'ta') {
    for (const [enKey, taVal] of Object.entries(REASONING_TRANSLATIONS_TA)) {
      if (reasonText.toLowerCase().includes(enKey.toLowerCase())) {
        return taVal;
      }
    }
  }
  return reasonText;
}

function updateLanguageUI() {
  // Update toggle button states
  const btnEn = document.getElementById('lang-btn-en');
  const btnTa = document.getElementById('lang-btn-ta');
  if (btnEn && btnTa) {
    if (currentLang === 'ta') {
      btnTa.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnTa.classList.remove('active');
    }
  }

  // Update elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    }
  });

  // Also update chatbot UI language
  if (typeof window.updateChatbotLanguage === 'function') {
    window.updateChatbotLanguage();
  }
}

// Expose globally
window.i18n = {
  getLanguage,
  setLanguage,
  t,
  tCrop,
  tAlert,
  tReason,
  updateLanguageUI,
};

window.t = t;
window.tCrop = tCrop;
window.tAlert = tAlert;
window.tReason = tReason;
window.setLanguage = setLanguage;

document.addEventListener('DOMContentLoaded', () => {
  updateLanguageUI();
});
