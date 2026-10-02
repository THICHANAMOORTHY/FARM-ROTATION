// DairyFeed AI — sensor node
//
// Short press: run a silage test.   Long press (2 s): pH calibration wizard.
// Other calibration and diagnostics: USB serial at 115200 baud, type "help".
//
// Not yet (Phase 4): offline queue and on-device score. For now, if the upload fails,
// the reading is printed on USB serial so it is not lost.

#include <Arduino.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <Wire.h>
#include <esp_system.h>

#include "calibration.h"
#include "commands.h"
#include "config.h"
#include "display.h"
#include "logic.h"
#include "net.h"
#include "pins.h"
#include "secrets.h"
#include "sensors.h"

static bool adsFound = false;

// ---------- Button ----------

enum Press { PRESS_NONE, PRESS_SHORT, PRESS_LONG };

static Press readButton() {
    if (digitalRead(PIN_BUTTON) == HIGH) return PRESS_NONE;  // not pressed (pull-up)
    delay(30);                                               // debounce
    if (digitalRead(PIN_BUTTON) == HIGH) return PRESS_NONE;

    uint32_t start = millis();
    while (digitalRead(PIN_BUTTON) == LOW) {
        if (millis() - start >= LONG_PRESS_MS) {
            while (digitalRead(PIN_BUTTON) == LOW) delay(10);  // wait for release
            return PRESS_LONG;
        }
        delay(10);
    }
    return PRESS_SHORT;
}

static void waitForPress() {
    while (readButton() == PRESS_NONE) delay(10);
}

// ---------- Screens ----------

// Redraws the idle screen only when something on it changed.
static void showIdle(bool force = false) {
    static char last[80] = "";
    char line1[22], line2[22], line3[22];
    struct tm now = {};
    snprintf(line1, sizeof(line1), "WiFi:%s Clock:%s", WiFi.status() == WL_CONNECTED ? "OK" : "--",
             clockSynced(&now) ? "OK" : "--");
    snprintf(line2, sizeof(line2), "pH:%s Moist:%s", cal.phOk ? "OK" : "--", cal.moistureOk ? "OK" : "--");
    snprintf(line3, sizeof(line3), "Temp:%s Colour:%s", cal.probesOk ? "OK" : "--", cal.colourOk ? "OK" : "--");
    char current[80];
    snprintf(current, sizeof(current), "%s|%s|%s", line1, line2, line3);
    if (!force && strcmp(current, last) == 0) return;
    strcpy(last, current);
    showScreen("DairyFeed " DEVICE_ID, line1, line2, line3, adsFound ? "Press=test Hold=pH cal" : "ADS1115 NOT FOUND");
}

static void showErrorAndWait(const char* title, const char* line1, const char* line2 = "") {
    showScreen(title, line1, line2, "", "Press to continue");
    waitForPress();
}

// ---------- pH calibration wizard (long press) ----------

static void phWizard() {
    char line[22];
    showScreen("pH calibration 1/2", "Rinse probe, put in", "pH 7.0 buffer.", "Wait ~1 min.", "Press to read");
    waitForPress();
    showScreen("pH calibration 1/2", "Reading...");
    snprintf(line, sizeof(line), "pH 7.0 = %.3f V", recordPhPoint(true));

    showScreen("pH calibration 2/2", line, "Rinse, put in", "pH 4.0 buffer.", "Wait ~1 min, press");
    waitForPress();
    showScreen("pH calibration 2/2", "Reading...");
    recordPhPoint(false);

    if (finishPhCalibration()) {
        char v7[22], v4[22];
        snprintf(v7, sizeof(v7), "pH 7.0 = %.3f V", cal.phV7);
        snprintf(v4, sizeof(v4), "pH 4.0 = %.3f V", cal.phV4);
        showScreen("pH calibration", "Saved.", v7, v4, "Press to continue");
    } else {
        showScreen("pH cal FAILED", "Both buffers read", "about the same.", "Check probe/wiring.", "Press to continue");
    }
    waitForPress();
}

// ---------- Silage test (short press) ----------

static bool soakCountdown() {
    for (int left = SOAK_SECONDS; left > 0; left--) {
        char line[22];
        snprintf(line, sizeof(line), "Soaking  %02d:%02d", left / 60, left % 60);
        showScreen("Step 1: soak", line, "", "", "Press to skip");
        uint32_t start = millis();
        while (millis() - start < 1000) {
            if (readButton() != PRESS_NONE) return false;
            delay(10);
        }
    }
    return true;
}

static void runTest() {
    if (!adsFound) {
        showErrorAndWait("Cannot test", "ADS1115 not found.", "Check SDA/SCL wiring.");
        return;
    }
    if (!cal.phOk || !cal.moistureOk || !cal.probesOk) {
        char missing[22];
        snprintf(missing, sizeof(missing), "%s%s%s", cal.phOk ? "" : "pH ", cal.moistureOk ? "" : "Moist ",
                 cal.probesOk ? "" : "Temp");
        showErrorAndWait("Not calibrated", missing, "See calibration.md");
        return;
    }

    // Silage pH method: ~25 g silage + ~100 mL distilled water, wait ~10 min, probe in the liquid.
    showScreen("Step 1: prepare", "Mix ~25 g silage", "with ~100 mL", "distilled water.", "Press: start timer");
    waitForPress();
    soakCountdown();
    showScreen("Step 2: probes", "pH probe: in LIQUID", "(not dry silage)", "Moist+temp: silage", "Press when ready");
    waitForPress();
    showScreen("Step 3: colour", "Put silage in the", "colour box and", "close the lid.", "Press to measure");
    waitForPress();
    showScreen("Measuring...", "Please wait", "about 10 seconds");

    // Colour (optional: only sent if the colour sensor is calibrated)
    float freq[3];
    readColourFrequencies(freq);

    // pH
    float phVolts = readAdsVolts(ADS_CH_PH, PH_SAMPLES);
    float ph = phFromVoltage(phVolts, cal.phV7, cal.phV4);
    if (ph < 0 || ph > 14) {
        showErrorAndWait("pH error", "Reading out of range.", "Check probe/calib.");
        return;
    }

    // Moisture
    int32_t moistureRaw = readAdsRaw(ADS_CH_MOISTURE, MOISTURE_SAMPLES);
    float moisturePct = moisturePctFromRaw(moistureRaw, cal.moistureRaw1, cal.moisturePct1, cal.moistureRaw2,
                                           cal.moisturePct2);

    // Temperatures
    float sampleC = 0, ambientC = 0;
    if (!readTemperatures(sampleC, ambientC)) {
        showErrorAndWait("Temp error", "DS18B20 missing.", "Check probes/pull-up.");
        return;
    }

    // sample_id, from NTP time if available
    struct tm now = {};
    bool synced = clockSynced(&now);
    char sampleId[48];
    formatSampleId(sampleId, sizeof(sampleId), DEVICE_ID, synced, now.tm_year + 1900, now.tm_mon + 1, now.tm_mday,
                   now.tm_hour, now.tm_min, now.tm_sec, esp_random(), nextTestCounter());

    // Tell the camera node to photograph this sample.
    Serial2.printf("SNAP %s\n", sampleId);

    // Build the request for POST /api/silage/test (docs/api.md)
    JsonDocument doc;
    doc["sample_id"] = sampleId;
    doc["device_id"] = DEVICE_ID;
    if (synced) {
        char created[25];
        strftime(created, sizeof(created), "%Y-%m-%dT%H:%M:%SZ", &now);
        doc["created_at"] = created;
    }
    doc["feed_type"] = FEED_TYPE;
    if (strlen(FARM_ID) > 0) doc["farm_id"] = FARM_ID;
    JsonObject readings = doc["readings"].to<JsonObject>();
    readings["ph"] = roundf(ph * 100) / 100;
    readings["moisture_pct"] = roundf(moisturePct * 10) / 10;
    readings["moisture_raw"] = moistureRaw;
    readings["sample_temp_c"] = roundf(sampleC * 10) / 10;
    readings["ambient_temp_c"] = roundf(ambientC * 10) / 10;
    if (cal.colourOk) {
        JsonObject rgb = readings["rgb"].to<JsonObject>();
        rgb["r"] = colourTo255(freq[0], cal.colourBlack[0], cal.colourWhite[0]);
        rgb["g"] = colourTo255(freq[1], cal.colourBlack[1], cal.colourWhite[1]);
        rgb["b"] = colourTo255(freq[2], cal.colourBlack[2], cal.colourWhite[2]);
    }
    String json;
    serializeJson(doc, json);
    Serial.println(json);  // a copy of every reading on USB serial

    showScreen("Sending...", sampleId);
    UploadResult result = {};
    if (wifiConnect(10000)) {
        result = uploadTest(json);
    } else {
        result.httpCode = -1;
        strncpy(result.error, "No Wi-Fi", sizeof(result.error));
    }

    if (result.httpCode == 200) {
        char line1[22], line2[22], line3[22];
        snprintf(line1, sizeof(line1), "Score %d/100", result.score);
        snprintf(line2, sizeof(line2), "Spoilage: %s", result.spoilage);
        snprintf(line3, sizeof(line3), "Mould: %s", result.mould);
        showScreen(result.quality, line1, line2, line3, strcmp(result.method, "ml") == 0 ? "AI model" : "Rule-based");
    } else {
        // Phase 4 adds the offline queue. Until then the JSON above is the only copy.
        showScreen("NOT SENT", result.error, "Reading printed on", "USB serial.", "Press to finish");
    }
    waitForPress();
}

// ---------- Arduino entry points ----------

void setup() {
    Serial.begin(115200);
    Serial2.begin(115200, SERIAL_8N1, PIN_CAM_RX, PIN_CAM_TX);
    Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
    pinMode(PIN_BUTTON, INPUT_PULLUP);

    displayBegin();
    loadCalibration();
    adsFound = sensorsBegin();
    if (!adsFound) Serial.println("ADS1115 not found at 0x48: check SDA/SCL and power");
    Serial.printf("DS18B20 probes found: %d\n", probeCount());

    showScreen("DairyFeed " DEVICE_ID, "Connecting Wi-Fi...");
    if (wifiConnect(15000)) {
        Serial.printf("Wi-Fi connected, IP %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("Wi-Fi not connected (will retry when sending)");
    }
    Serial.println("Type 'help' for calibration commands.");
    showIdle(true);
}

void loop() {
    static uint32_t lastIdle = 0;
    handleSerialCommands();

    Press press = readButton();
    if (press == PRESS_SHORT) {
        runTest();
        showIdle(true);
    } else if (press == PRESS_LONG) {
        phWizard();
        showIdle(true);
    } else if (millis() - lastIdle > 5000) {
        lastIdle = millis();
        showIdle();
    }
    delay(10);
}
