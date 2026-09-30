// ============================================================
// chat.js — Kisan AI Agronomist Chatbot Backend Route
// POST /api/chat
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');
const { kaggleCrops } = require('../data/kaggle_crops');
const { withTimeout } = require('../utils/withTimeout');

// Bounds how long we'll wait on Gemini in total before falling back to the
// offline rule engine. Without this, a rate-limited/overloaded API key can
// make every candidate model hang or slow-retry in turn, and a single chat
// message can take 10-15+ seconds to answer — indistinguishable from "the
// chatbot is broken" from a user's perspective.
const GEMINI_TIMEOUT_MS = 14000;

router.post('/', async (req, res) => {
  try {
    const { message = '', farm_id = 101, lang = 'en' } = req.body;
    const q = message.trim().toLowerCase();
    const isTa = (lang === 'ta') || /[\u0B80-\u0BFF]/.test(message);

    // Retrieve active farm context
    const farm = db.farms.find(f => f.farm_id === parseInt(farm_id)) || db.farms[0];
    const farmer = db.farmers.find(f => f.farmer_id === farm?.farmer_id) || { name: 'Ramesh Kumar' };
    const soil = db.soil_data.filter(s => s.farm_id === farm?.farm_id).pop() || {
      soil_health_score: 63,
      nitrogen: 42, phosphorus: 28, potassium: 55, ph: 6.5, organic_carbon: 0.52,
      deficiencies: ['Low Nitrogen', 'Low Organic Carbon']
    };
    const liveSensor = (db.live_sensor_status && db.live_sensor_status[farm?.farm_id]) || null;
    const history = db.crop_history.filter(h => h.farm_id === farm?.farm_id);
    const rec = db.recommendations.filter(r => r.farm_id === farm?.farm_id).pop() || {
      recommended_crop_id: 21,
      final_score: 88.5
    };
    const recCropObj = kaggleCrops.find(c => c.crop_id === rec.recommended_crop_id) || kaggleCrops.find(c => c.name === 'Green Gram');

    // 1. Check if Gemini API Key is configured in environment
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // High-availability working models prioritized by lowest latency and availability
        const candidateModels = [
          'gemini-3.5-flash-lite',
          'gemini-3.7-flash',
          'gemini-3.6-flash',
          'gemini-3.5-flash',
          'gemini-3.8-flash'
        ];
        let text = null;
        let successfulModel = null;

        const probeMoist = liveSensor?.moisture ?? soil.soil_moisture ?? 45;
        const probeLight = liveSensor?.light ?? soil.light ?? 74;
        const probeTemp = liveSensor?.temperature ?? soil.air_temperature ?? 31.5;
        const probeTds = liveSensor?.tds ?? soil.tds ?? 420;

        const prompt = `You are "UZHAVU KAAPPAAN AI" (CropSmart Kisan AI), an expert agricultural advisor and precision agronomist.
FARM CONTEXT:
- Farmer: ${farmer.name}, Location: ${farm.location_name} (${farm.area_acres} acres, ${farm.irrigation_type} irrigation)
- Current Soil Health Score: ${soil.soil_health_score}/100.
- Live Soil Scout IoT Probe: Moisture=${probeMoist}%, Sunlight=${probeLight}%, Temperature=${probeTemp}°C, TDS Mineral Salts=${probeTds} ppm.
- Measured Chemical Nutrients: Nitrogen=${soil.nitrogen} kg/ha (Deficient), Phosphorus=${soil.phosphorus} kg/ha, Potassium=${soil.potassium} kg/ha, pH=${soil.ph}, Organic Carbon=${soil.organic_carbon}%.
- History: Cultivated Tomato consecutively for 3 seasons (severe monoculture penalty applied, high solanaceae blight risk).
- AI Top Recommendation: ${recCropObj.name} (Legume, biological nitrogen fixer, ₹${recCropObj.avg_market_price}/kg).
- User Language: ${isTa ? 'Tamil (தமிழ்)' : 'English'}.

CRITICAL INSTRUCTION:
Keep response crisp, actionable, high-impact, formatted with bullet points and emojis, strictly under 150-180 words.
${isTa ? 'You MUST reply completely in pure, spoken Tamil (தமிழ் எழுத்துக்களில்). Use simple, friendly agricultural vocabulary that Tamil Nadu farmers use. Do not use English sentences.' : 'Respond in clear English with actionable agronomic insights, bullet points and emojis.'}

User Question: "${message}"`;

        await withTimeout((async () => {
          for (const modelName of candidateModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              // Individual model timeout to prevent one slow/503 candidate from blocking others
              const modelResult = await withTimeout(
                model.generateContent(prompt),
                6000
              );
              text = modelResult.response.text();
              if (text) {
                successfulModel = modelName;
                break;
              }
            } catch (mErr) {
              console.warn(`[chat] Model ${modelName} failed (${mErr.message}), trying next candidate.`);
            }
          }
        })(), GEMINI_TIMEOUT_MS).catch((timeoutErr) => {
          console.warn('[chat] Gemini API calls timed out or all failed:', timeoutErr.message);
        });

        if (text) {
          return res.json({
            reply: text,
            suggestions: isTa
              ? ["மண் பரிசோதனை அறிக்கை", "பரிந்துரைக்கப்பட்ட சுழற்சி", "சந்தை விலை நிலவரம்"]
              : ["Explain my soil test", "Why Green Gram?", "Current Mandi prices"],
            provider: `Google Gemini AI (${successfulModel || 'Flash'})`
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to Agronomic Knowledge Engine:", geminiErr.message);
      }
    }

    // 2. Built-in Context-Aware Agronomic Knowledge Engine (Offline & Fast)
    let reply = "";
    let suggestions = [];

    // Question: What to plant next / Crop recommendation / Rotation
    if (q.includes("next") || q.includes("plant") || q.includes("grow") || q.includes("recommend") || q.includes("rotate") || q.includes("rotation") || q.includes("green gram") || q.includes("moong") || q.includes("pulse") || q.includes("legume") || q.includes("பயிர்") || q.includes("நடலாம்") || q.includes("சாகுபடி") || q.includes("சுழற்சி") || q.includes("பாசிப்பயறு")) {
      if (isTa) {
        reply = `🌱 **பரிந்துரைக்கப்படும் அடுத்த பயிர்: பாசிப்பயறு (Green Gram)**\n\n` +
          `உங்கள் நிலத்தில் கடந்த 3 பருவங்களாக தொடர்ச்சியாக தக்காளி பயிரிடப்பட்டுள்ளதால், மண்ணில் **தழைச்சத்து (Nitrogen) 42 kg/ha** ஆக குறைந்துள்ளது.\n\n` +
          `• **ஏன் பாசிப்பயறு?**: இது ஒரு பயறு வகை (Legume). இதன் வேர் முடிச்சுகள் காற்றில் உள்ள தழைச்சத்தை இயற்கையாக மண்ணில் நிலைநிறுத்தும் (சுமார் 35-45 kg N/ha).\n` +
          `• **வளர்ச்சி காலம்**: 75 நாட்கள் மட்டுமே.\n` +
          `• **மண்டி சந்தை விலை**: ₹85.00/கிலோ.\n` +
          `• **எதிர்பார்க்கப்படும் லாபம்**: சுமார் ₹33,500/ஏக்கர்.\n\n` +
          `இதன் மூலம் அடுத்த பருவத்தில் ரசாயன யூரியா உரச்செலவு 30% வரை குறையும்!`;
        suggestions = ["மண் பரிசோதனை பார்க்க", "உர பரிந்துரை என்ன?", "3-பருவ சுழற்சி திட்டம்", "சந்தை விலை பட்டியல்"];
      } else {
        reply = `🌱 **Top Recommended Next Crop: Green Gram (Moong)**\n\n` +
          `Because your farm has grown Tomato continuously for 3 seasons, your soil's **Nitrogen level is depleted to 42 kg/ha** (critical threshold is 80 kg/ha).\n\n` +
          `• **Why Green Gram?**: As a legume, it performs Biological Nitrogen Fixation, returning 35-45 kg N/ha naturally into root nodules.\n` +
          `• **Duration**: Just 70–75 days.\n` +
          `• **Mandi Market Price**: ₹85.00/kg (based on real APMC trading data).\n` +
          `• **Projected Net Profit**: ~₹33,500 per acre.\n\n` +
          `Sowing Green Gram now will break the tomato blight disease cycle and restore your soil score from 63 to 72!`;
        suggestions = ["Explain my soil deficiencies", "What fertilizer to apply?", "Show 3-season rotation", "View Mandi prices"];
      }
    }

    // Question: Fertilizer dosage / Soil feeding advice
    else if (q.includes("fertiliz") || q.includes("urea") || q.includes("dap") || q.includes("fym") || q.includes("compost") || q.includes("feed") || q.includes("dose") || q.includes("உர") || q.includes("யூரியா") || q.includes("சாணம்")) {
      if (isTa) {
        reply = `🧪 **ஊட்டச்சத்து மற்றும் உரப் பரிந்துரை (#101 பண்ணை - 4.5 ஏக்கர்):**\n\n` +
          `மண்ணில் தழைச்சத்து குறைவு (42 kg/ha) மற்றும் கரிமச்சத்து 0.52% உள்ளதால் பின்வரும் ஊட்டச்சத்து திட்டம் பரிந்துரைக்கப்படுகிறது:\n\n` +
          `• **மக்கிய தொழுவுரம் / மண்புழு உரம்**: ஏக்கருக்கு 5 டன் (நில தயாரிப்பின் போது).\n` +
          `• **ரைசோபியம் உயிரி உரம்**: விதை நேர்த்திக்கு 200 கிராம் / ஏக்கர்.\n` +
          `• **டி.ஏ.பி (DAP)**: ஏக்கருக்கு 35 கிலோ (அடிப்படை உரமாக).\n` +
          `• **பொட்டாஷ் (MOP)**: ஏக்கருக்கு 20 கிலோ.\n` +
          `• **வேப்பம் புண்ணாக்கு**: ஏக்கருக்கு 100 கிலோ (மண் பூச்சிகளை கட்டுப்படுத்த).\n\n` +
          `⚠️ *ரசாயன யூரியா பயன்பாட்டை குறைத்து பயறு வகை பயிர் மூலம் இயற்கையாக தழைச்சத்தை கூட்டவும்.*`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "மண் பரிசோதனை அறிக்கை", "செயல்திட்டம் PDF"];
      } else {
        reply = `🧪 **Targeted Fertilizer & Nutrition Plan (Farm #101 - 4.5 Acres):**\n\n` +
          `Based on your soil test (Nitrogen: 42 kg/ha deficit, Organic Carbon: 0.52%):\n\n` +
          `• **Farmyard Manure / Vermicompost**: 5.0 Tonnes/acre during basal ploughing to restore organic carbon.\n` +
          `• **Bio-Inoculant (Rhizobium)**: 200g per 10kg seed treatment to stimulate nodule formation.\n` +
          `• **DAP (Di-Ammonium Phosphate)**: 35 kg/acre as basal dose for root development.\n` +
          `• **MOP (Muriate of Potash)**: 20 kg/acre.\n` +
          `• **Neem Cake**: 100 kg/acre to suppress soil-borne fungal pathogens.\n\n` +
          `⚠️ *Avoid heavy chemical Urea dressing — let the Green Gram crop naturally fix atmospheric nitrates!*`;
        suggestions = ["What crop to plant next?", "Download Action Plan PDF", "View Soil Test"];
      }
    }

    // Question: Soil health / Deficiencies / Why is score low
    else if (q.includes("soil") || q.includes("health") || q.includes("nitrogen") || q.includes("score") || q.includes("deficien") || q.includes("மண்") || q.includes("வளம்") || q.includes("சத்து")) {
      if (isTa) {
        reply = `🧪 **மண் பரிசோதனை ஆய்வு அறிக்கை (#101 கோவை பண்ணை):**\n\n` +
          `உங்கள் தற்போதைய மண் வள மதிப்பீடு: **${soil.soil_health_score} / 100** (மிதமான சத்து குறைவு).\n\n` +
          `⚠️ **கண்டறியப்பட்ட குறைபாடுகள்:**\n` +
          `1. **தழைச்சத்து (Nitrogen): 42 kg/ha** (தேவை: 80 - 160 kg/ha) - *மிகக் குறைவு*\n` +
          `2. **கரிம வளம் (Organic Carbon): 0.52%** (தேவை: 0.8%+) - *குறைவு*\n\n` +
          `✅ **போதுமான சத்துக்கள்:**\n` +
          `• மணிச்சத்து (P): 28 kg/ha | சாம்பல் சத்து (K): 55 kg/ha | pH: 6.5 (சிறந்த கார அமிலத்தன்மை)\n\n` +
          `💡 **தீர்வு:** தழைச்சத்தை மீட்டெடுக்க பாசிப்பயறு அல்லது உளுந்து போன்ற பயறு வகைகளை உடனே பயிரிடவும்.`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "செயல்திட்ட அறிக்கை PDF", "உர பயன்பாட்டு ஆலோசனை"];
      } else {
        reply = `🧪 **Soil Diagnostic Analysis (Coimbatore Farm - 4.5 Acres):**\n\n` +
          `Current Soil Health Score: **${soil.soil_health_score} / 100** (Moderate Depletion).\n\n` +
          `⚠️ **Critical Deficiencies Detected:**\n` +
          `1. **Nitrogen (N): 42.0 kg/ha** (Optimal: 80 – 160 kg/ha) — *Depleted due to consecutive tomato harvesting.*\n` +
          `2. **Organic Carbon (OC): 0.52%** (Optimal: 0.80 – 1.50%) — *Low soil organic matter and water retention capacity.*\n\n` +
          `✅ **Adequate Parameters:**\n` +
          `• Phosphorus: 28 kg/ha | Potassium: 55 kg/ha | pH: 6.50 (Neutral, ideal for nutrient absorption).\n\n` +
          `💡 **Action Plan:** Rotate immediately into a nitrogen-fixing legume to replenish root-zone nitrates without over-applying chemical fertilizers.`;
        suggestions = ["What crop to plant next?", "Download PDF Action Plan", "How to fix low Nitrogen?"];
      }
    }

    // Question: Mandi Prices / Market Rates / Price
    else if (q.includes("price") || q.includes("mandi") || q.includes("market") || q.includes("profit") || q.includes("rate") || q.includes("விலை") || q.includes("சந்தை") || q.includes("லாபம்")) {
      const topQuotes = [
        { name: isTa ? "பாசிப்பயறு (Green Gram)" : "Green Gram", price: "₹85.00/kg" },
        { name: isTa ? "தக்காளி (Tomato)" : "Tomato", price: "₹79.50/kg" },
        { name: isTa ? "வெங்காயம் (Onion)" : "Onion", price: "₹15.80/kg" },
        { name: isTa ? "உருளைக்கிழங்கு (Potato)" : "Potato", price: "₹12.60/kg" },
        { name: isTa ? "கோதுமை (Wheat)" : "Wheat", price: "₹22.85/kg" },
        { name: isTa ? "வாழை (Banana)" : "Banana", price: "₹27.00/kg" },
        { name: isTa ? "பூண்டு (Garlic)" : "Garlic", price: "₹75.00/kg" },
      ];

      if (isTa) {
        reply = `📊 **இந்திய மண்டி (APMC) சந்தை விலைகள் (சமீபத்திய தினசரி தரவுகள்):**\n\n` +
          topQuotes.map(q => `• **${q.name}**: ${q.price}`).join('\n') +
          `\n\n💡 *குறிப்பு: இந்த விலைகள் 23,000+ மண்டி சந்தை விலைப் பதிவுகளின் நடுநிலை மதிப்பு ஆகும்.*`;
        suggestions = ["பயிர்களின் லாபம் ஒப்பிடு", "பாசிப்பயறு லாபம் என்ன?", "முகப்பிற்கு செல்"];
      } else {
        reply = `📊 **Recent APMC Mandi Prices (daily commodity quotes):**\n\n` +
          topQuotes.map(q => `• **${q.name}**: ${q.price}`).join('\n') +
          `\n\n💡 *Median of 23,093 APMC market price quotes across Indian states.*`;
        suggestions = ["Which crop gives highest profit?", "Recommend best rotation", "Download CSV Dataset"];
      }
    }

    // Question: Continuous Cultivation / Tomato penalty / Disease risk
    else if (q.includes("tomato") || q.includes("continuous") || q.includes("monoculture") || q.includes("disease") || q.includes("தக்காளி") || q.includes("தொடர்")) {
      if (isTa) {
        reply = `⚠️ **தொடர் தக்காளி சாகுபடி எச்சரிக்கை:**\n\n` +
          `உங்கள் பண்ணையில் 3 பருவங்களாக தக்காளி மட்டுமே பயிரிடப்பட்டுள்ளது.\n\n` +
          `1. **பூச்சி மற்றும் நோய் பரவல்**: தக்காளியை தாக்கும் ஆரம்பக்கால கருகல் நோய் (Early Blight) மற்றும் வேர் புழுக்கள் மண்ணில் தங்கி அடுத்த பயிரை அழிக்கும்.\n` +
          `2. **சத்து இழப்பு**: தக்காளி செடிகள் மண்ணில் உள்ள தழைச்சத்தை அதிகளவில் உறிஞ்சிவிட்டன.\n` +
          `3. **சுழற்சி விதி**: இதனால் CropSmart அல்காரிதம் தக்காளிக்கு **-30% அபராத மதிப்பீடு** விதித்து பயிர் சுழற்சியை கட்டாயமாக்கியுள்ளது!`;
        suggestions = ["மாற்று பயிர் என்ன?", "மண் வளம் மீட்பது எப்படி?", "செயல்திட்டம் PDF"];
      } else {
        reply = `⚠️ **Monoculture Warning: 3x Consecutive Tomato Cultivation**\n\n` +
          `Growing Solanaceae (Tomato) continuously introduces two major agricultural hazards:\n\n` +
          `1. **Soil Pathogen Accumulation**: Fungal spores causing Early Blight and root-knot nematodes proliferate in the soil.\n` +
          `2. **Nutrient Depletion**: Tomato heavily exhausts nitrates, dropping your soil nitrogen to 42 kg/ha.\n` +
          `3. **Optimizer Action**: CropSmart has applied a **-30% penalty** to Tomato to protect your farm from catastrophic crop failure. Rotating to Green Gram breaks this pathogen cycle completely!`;
        suggestions = ["What to plant instead?", "Show Soil Health Score", "View 3-Season Plan"];
      }
    }

    // Question: Irrigation / Water / Drip
    else if (q.includes("water") || q.includes("irrigat") || q.includes("drip") || q.includes("பாசனம்") || q.includes("நீர்") || q.includes("சொட்டு")) {
      if (isTa) {
        reply = `💧 **பாசன மேலாண்மை ஆலோசனை (#101 பண்ணை - சொட்டு நீர் பாசனம்):**\n\n` +
          `• **தற்போதைய மண் ஈரப்பதம்**: ${liveSensor?.moisture ?? soil.soil_moisture ?? 45}% (சிறந்த நிலை).\n` +
          `• **பாசன முறை**: உங்கள் நிலத்தில் சொட்டு நீர் பாசனம் உள்ளதால் 40-50% வரை தண்ணீர் சேமிக்க முடியும்.\n` +
          `• **பாசிப்பயறு பாசன கால இடைவெளி**: விதைப்பு, பூக்கும் பருவம் மற்றும் காய் பிடிக்கும் பருவத்தில் மட்டும் மிதமான பாசனம் போதுமானது.\n` +
          `• **அறிவுரை**: அதிகப்படியான நீர் தேங்குவதை தவிர்க்கவும்; வேர் அழுகல் நோய் பரவாமல் தடுக்கும்.`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "வானிலை அறிக்கை", "மண் பரிசோதனை"];
      } else {
        reply = `💧 **Precision Irrigation Advisory (Farm #101 - Drip Irrigation):**\n\n` +
          `• **Current Soil Moisture**: ${liveSensor?.moisture ?? soil.soil_moisture ?? 45}% (Optimal zone: 40–60%).\n` +
          `• **Water Efficiency**: Drip system provides ~45% water savings compared to flood irrigation.\n` +
          `• **Green Gram Schedule**: Only 3 critical irrigation cycles needed (Sowing, Flowering at day 30, and Pod development at day 50).\n` +
          `• **Action**: Avoid waterlogging to prevent root-knot fungal proliferation in warm soil.`;
        suggestions = ["What crop to plant next?", "View Weather Forecast", "Check Soil Health"];
      }
    }

    // Question: Pest & Disease / Blight / Fungus
    else if (q.includes("pest") || q.includes("disease") || q.includes("blight") || q.includes("fung") || q.includes("பூச்சி") || q.includes("நோய்") || q.includes("கருகல்")) {
      if (isTa) {
        reply = `🛡️ **பயிர் பாதுகாப்பு & நோய் தடுப்பு வழிகாட்டல்:**\n\n` +
          `• **தக்காளி கருகல் நோய் தடுப்பு**: தொடர்ந்து தக்காளி பயிரிட்டதால் மண்ணில் பூஞ்சை வித்துக்கள் தங்கியிருக்க வாய்ப்புள்ளது. பாசிப்பயறு பயிரிடுவதன் மூலம் இந்த நோய் சுழற்சி உடைக்கப்படும்.\n` +
          `• **இயற்கை பூச்சி விரட்டி**: வேப்பெண்ணெய் கரைசல் (3%) அல்லது 5-இலை கரைசல் தெளிக்கவும்.\n` +
          `• **மண் கிருமி நீக்கம்**: விதைப்புக்கு முன் வேப்பம் புண்ணாக்கு ஏக்கருக்கு 100 கிலோ இடவும்.\n` +
          `• **உயிரியல் கட்டுப்பாடு**: டிரைக்கோடெர்மா விரிடி (Trichoderma viride) கொண்டு விதை நேர்த்தி செய்யவும்.`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "உர பரிந்துரை", "மண் பரிசோதனை பார்க்க"];
      } else {
        reply = `🛡️ **Integrated Pest & Disease Management (IPM):**\n\n` +
          `• **Blight & Wilt Mitigation**: 3 seasons of Solanaceae (Tomato) build up soil-borne *Alternaria* and *Fusarium*. Rotating to a legume breaks this pathogen cycle completely.\n` +
          `• **Bio-fungicide Seed Treatment**: Treat seeds with *Trichoderma viride* (4g/kg seed) or *Pseudomonas fluorescens* before sowing.\n` +
          `• **Soil Pest Barrier**: Apply 100 kg/acre Neem Cake during land preparation to suppress parasitic nematodes.\n` +
          `• **Foliar Spray**: 3% Neem Seed Kernel Extract (NSKE) at vegetative stage for sucking pest deterrent.`;
        suggestions = ["What crop to plant next?", "Explain my soil test", "Fertilizer plan"];
      }
    }

    // Default / Greeting
    else {
      if (isTa) {
        reply = `வணக்கம் ${farmer.name}! நான் உங்கள் **CropSmart உழவன் AI ஆலோசகர்** 🌱\n\n` +
          `உங்கள் கோவை பண்ணையின் (4.5 ஏக்கர்) மண் வளம், முந்தைய பயிர் வரலாறு மற்றும் 23,000+ மண்டி சந்தை விலைகளின் அடிப்படையில் நான் உங்களுக்கு உதவ முடியும்.\n\n` +
          `நீங்கள் கேட்கக்கூடிய கேள்விகள்:\n` +
          `• *"அடுத்த பருவத்தில் என்ன பயிர் நடலாம்?"*\n` +
          `• *"என் நிலத்தின் மண் வளம் மற்றும் குறைபாடுகள் என்ன?"*\n` +
          `• *"தக்காளி, பாசிப்பயறு மண்டி சந்தை விலை என்ன?"*\n` +
          `• *"பயிர் சுழற்சி மூலம் லாபத்தை உயர்த்துவது எப்படி?"*`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "மண் பரிசோதனை பார்க்க", "மண்டி சந்தை விலைகள்"];
      } else {
        reply = `Hello ${farmer.name}! I am your **CropSmart Kisan AI Agronomist** 🌱\n\n` +
          `I have full context of your 4.5-acre Coimbatore farm, your current soil test (Score: ${soil.soil_health_score}/100, N: 42 kg/ha), your 3-season continuous Tomato history, and 23k+ APMC Mandi market quotes.\n\n` +
          `Here are questions you can ask me:\n` +
          `• *"What crop should I plant next?"*\n` +
          `• *"Why is my soil nitrogen depleted?"*\n` +
          `• *"Compare profits of Green Gram vs Potato vs Tomato"*\n` +
          `• *"How does the 3-season rotation restore my soil?"*`;
        suggestions = ["What crop to plant next?", "Explain my soil test", "Current Mandi prices"];
      }
    }

    res.json({
      reply,
      suggestions,
      provider: "CropSmart Agronomic Engine"
    });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

module.exports = router;
