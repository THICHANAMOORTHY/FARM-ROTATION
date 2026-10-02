#include "commands.h"

#include <Arduino.h>

#include "calibration.h"
#include "config.h"
#include "logic.h"
#include "pins.h"
#include "sensors.h"

static bool gotPh7 = false;
static bool gotPh4 = false;

float recordPhPoint(bool isPh7) {
    float volts = readAdsVolts(ADS_CH_PH, PH_SAMPLES * 2);
    if (isPh7) {
        cal.phV7 = volts;
        gotPh7 = true;
    } else {
        cal.phV4 = volts;
        gotPh4 = true;
    }
    Serial.printf("pH %s buffer: %.4f V\n", isPh7 ? "7.0" : "4.0", volts);
    return volts;
}

bool finishPhCalibration() {
    if (!gotPh7 || !gotPh4) {
        Serial.println("Record both buffers first: ph7 and ph4");
        return false;
    }
    gotPh7 = gotPh4 = false;
    cal.phOk = phCalibrationValid(cal.phV7, cal.phV4);
    if (cal.phOk) {
        saveCalibration();
        Serial.printf("pH calibration saved: pH7 = %.4f V, pH4 = %.4f V\n", cal.phV7, cal.phV4);
    } else {
        Serial.println("pH calibration FAILED: the two buffers read almost the same voltage.");
        Serial.println("Check the probe, the BNC connector and the divider wiring.");
    }
    return cal.phOk;
}

static void printHelp() {
    Serial.println(
        "Commands:\n"
        "  status                       calibration + live readings\n"
        "  ph7 / ph4                    record probe in pH 7.0 / 4.0 buffer (ph4 also saves)\n"
        "  raw                          live moisture raw value (for oven-dry calibration)\n"
        "  moist <raw1> <%1> <raw2> <%2>  save moisture calibration from two oven-dried samples\n"
        "  probes                       find which DS18B20 is the sample probe (warm it in your hand)\n"
        "  black / white                record colour on a black / white card in the closed box\n"
        "  reset                        erase all calibration");
}

static void printStatus() {
    Serial.printf("pH:       %s", cal.phOk ? "calibrated" : "NOT calibrated");
    float phVolts = readAdsVolts(ADS_CH_PH, PH_SAMPLES);
    Serial.printf("   now %.4f V", phVolts);
    if (cal.phOk) Serial.printf(" = pH %.2f", phFromVoltage(phVolts, cal.phV7, cal.phV4));
    Serial.println();

    int32_t raw = readAdsRaw(ADS_CH_MOISTURE, MOISTURE_SAMPLES);
    Serial.printf("Moisture: %s   now raw %ld", cal.moistureOk ? "calibrated" : "NOT calibrated", (long)raw);
    if (cal.moistureOk) {
        Serial.printf(" = %.1f %%", moisturePctFromRaw(raw, cal.moistureRaw1, cal.moisturePct1,
                                                       cal.moistureRaw2, cal.moisturePct2));
    }
    Serial.println();

    Serial.printf("Probes:   %s, %d found\n", cal.probesOk ? "sample probe assigned" : "NOT assigned", probeCount());
    for (int i = 0; i < probeCount(); i++) {
        uint8_t addr[8];
        probeAddress(i, addr);
        bool isSample = cal.probesOk && memcmp(addr, cal.sampleProbe, 8) == 0;
        Serial.printf("          probe %d: %.2f C %s\n", i, readProbeC(i), isSample ? "(sample)" : "");
    }

    float freq[3];
    readColourFrequencies(freq);
    Serial.printf("Colour:   %s   now R %.0f Hz, G %.0f Hz, B %.0f Hz", cal.colourOk ? "calibrated" : "NOT calibrated",
                  freq[0], freq[1], freq[2]);
    if (cal.colourOk) {
        Serial.printf(" = RGB %d, %d, %d", colourTo255(freq[0], cal.colourBlack[0], cal.colourWhite[0]),
                      colourTo255(freq[1], cal.colourBlack[1], cal.colourWhite[1]),
                      colourTo255(freq[2], cal.colourBlack[2], cal.colourWhite[2]));
    }
    Serial.println();
}

static void assignProbes() {
    if (probeCount() != 2) {
        Serial.printf("Need exactly 2 DS18B20 probes, found %d. Check wiring and the 4.7k pull-up.\n", probeCount());
        return;
    }
    float before[2] = {readProbeC(0), readProbeC(1)};
    Serial.println("Hold ONLY the SAMPLE probe tightly in your hand for 30 seconds...");
    delay(30000);
    float rise[2] = {readProbeC(0) - before[0], readProbeC(1) - before[1]};
    Serial.printf("Rise: probe 0 %+.2f C, probe 1 %+.2f C\n", rise[0], rise[1]);

    int sample = rise[0] > rise[1] ? 0 : 1;
    if (rise[sample] < 1.0f || rise[sample] - rise[1 - sample] < 0.5f) {
        Serial.println("Not clear which probe was warmed. Try again, holding one probe only.");
        return;
    }
    probeAddress(sample, cal.sampleProbe);
    cal.probesOk = true;
    saveCalibration();
    Serial.printf("Saved: probe %d is the SAMPLE probe, the other is AMBIENT.\n", sample);
}

static bool gotBlack = false;
static bool gotWhite = false;

static void recordColour(bool white) {
    float freq[3];
    readColourFrequencies(freq);
    for (int ch = 0; ch < 3; ch++) {
        if (white) {
            cal.colourWhite[ch] = freq[ch];
        } else {
            cal.colourBlack[ch] = freq[ch];
        }
    }
    if (white) {
        gotWhite = true;
    } else {
        gotBlack = true;
    }
    Serial.printf("%s card: R %.0f Hz, G %.0f Hz, B %.0f Hz\n", white ? "White" : "Black", freq[0], freq[1], freq[2]);

    if (gotBlack && gotWhite) {
        bool ok = true;
        for (int ch = 0; ch < 3; ch++) ok = ok && cal.colourWhite[ch] > cal.colourBlack[ch] * 1.5f;
        if (ok) {
            cal.colourOk = true;
            saveCalibration();
            Serial.println("Colour calibration saved.");
        } else {
            Serial.println("Colour calibration FAILED: white is not clearly brighter than black.");
            Serial.println("Check the LEDs, the box lid and the S0-S3 wiring.");
        }
        gotBlack = gotWhite = false;
    }
}

static void runCommand(char* line) {
    char* cmd = strtok(line, " \t\r");
    if (!cmd) return;

    if (!strcmp(cmd, "help")) {
        printHelp();
    } else if (!strcmp(cmd, "status")) {
        printStatus();
    } else if (!strcmp(cmd, "ph7")) {
        recordPhPoint(true);
        Serial.println("Now rinse the probe, put it in pH 4.0 buffer, wait ~1 min, type: ph4");
    } else if (!strcmp(cmd, "ph4")) {
        recordPhPoint(false);
        finishPhCalibration();
    } else if (!strcmp(cmd, "raw")) {
        Serial.printf("Moisture raw: %ld\n", (long)readAdsRaw(ADS_CH_MOISTURE, MOISTURE_SAMPLES));
    } else if (!strcmp(cmd, "moist")) {
        char* a = strtok(nullptr, " ");
        char* b = strtok(nullptr, " ");
        char* c = strtok(nullptr, " ");
        char* d = strtok(nullptr, " ");
        if (!a || !b || !c || !d) {
            Serial.println("Usage: moist <raw1> <%1> <raw2> <%2>   e.g. moist 14000 55 12000 75");
            return;
        }
        int32_t raw1 = atol(a), raw2 = atol(c);
        float pct1 = atof(b), pct2 = atof(d);
        if (!moistureCalibrationValid(raw1, pct1, raw2, pct2)) {
            Serial.println("The two points must have different raw values and different %.");
            return;
        }
        cal.moistureRaw1 = raw1;
        cal.moisturePct1 = pct1;
        cal.moistureRaw2 = raw2;
        cal.moisturePct2 = pct2;
        cal.moistureOk = true;
        saveCalibration();
        Serial.println("Moisture calibration saved.");
    } else if (!strcmp(cmd, "probes")) {
        assignProbes();
    } else if (!strcmp(cmd, "black")) {
        recordColour(false);
    } else if (!strcmp(cmd, "white")) {
        recordColour(true);
    } else if (!strcmp(cmd, "reset")) {
        resetCalibration();
        saveCalibration();
        Serial.println("All calibration erased.");
    } else {
        Serial.printf("Unknown command '%s'. Type help.\n", cmd);
    }
}

void handleSerialCommands() {
    static char line[80];
    static size_t length = 0;
    while (Serial.available()) {
        char ch = (char)Serial.read();
        if (ch == '\n') {
            line[length] = '\0';
            runCommand(line);
            length = 0;
        } else if (length < sizeof(line) - 1) {
            line[length++] = ch;
        }
    }
}
