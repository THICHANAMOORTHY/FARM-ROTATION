#include "sensors.h"

#include <Adafruit_ADS1X15.h>
#include <Arduino.h>
#include <DallasTemperature.h>
#include <OneWire.h>
#include <Wire.h>
#include <string.h>

#include "calibration.h"
#include "config.h"
#include "pins.h"

static Adafruit_ADS1115 ads;
static OneWire oneWire(PIN_ONEWIRE);
static DallasTemperature probes(&oneWire);

bool sensorsBegin() {
    // DS18B20: 12-bit resolution (0.0625 degC steps, ~750 ms per reading)
    probes.begin();
    probes.setResolution(12);

    // TCS3200: frequency scaling 2% (S0 low, S1 high). Full white is then ~12 kHz, a period of
    // ~80 us, which pulseIn (1 us resolution) measures precisely. At 20% it would be ~8 us.
    pinMode(PIN_TCS_S0, OUTPUT);
    pinMode(PIN_TCS_S1, OUTPUT);
    pinMode(PIN_TCS_S2, OUTPUT);
    pinMode(PIN_TCS_S3, OUTPUT);
    pinMode(PIN_TCS_OUT, INPUT);
    pinMode(PIN_TCS_LED, OUTPUT);
    digitalWrite(PIN_TCS_S0, LOW);
    digitalWrite(PIN_TCS_S1, HIGH);
    digitalWrite(PIN_TCS_LED, LOW);

    // ADS1115 at address 0x48 (ADDR pin to GND). GAIN_ONE: inputs up to 4.096 V,
    // but never more than the ADS1115's supply (3.3 V) + 0.3 V — that is why pH has a divider.
    if (!ads.begin(0x48, &Wire)) return false;
    ads.setGain(GAIN_ONE);
    return true;
}

int32_t readAdsRaw(uint8_t channel, int samples) {
    int32_t total = 0;
    for (int i = 0; i < samples; i++) {
        total += ads.readADC_SingleEnded(channel);
        delay(10);
    }
    return total / samples;
}

float readAdsVolts(uint8_t channel, int samples) {
    float total = 0;
    for (int i = 0; i < samples; i++) {
        total += ads.computeVolts(ads.readADC_SingleEnded(channel));
        delay(10);
    }
    return total / samples;
}

int probeCount() {
    return probes.getDeviceCount();
}

bool probeAddress(int index, uint8_t addr[8]) {
    return probes.getAddress(addr, index);
}

float readProbeC(int index) {
    uint8_t addr[8];
    if (!probes.getAddress(addr, index)) return DEVICE_DISCONNECTED_C;
    probes.requestTemperaturesByAddress(addr);
    return probes.getTempC(addr);
}

bool readTemperatures(float& sampleC, float& ambientC) {
    if (probeCount() < 2) return false;
    probes.requestTemperatures();

    bool foundSample = false, foundAmbient = false;
    for (int i = 0; i < probeCount(); i++) {
        uint8_t addr[8];
        if (!probes.getAddress(addr, i)) continue;
        float c = probes.getTempC(addr);
        if (c == DEVICE_DISCONNECTED_C) return false;
        if (memcmp(addr, cal.sampleProbe, 8) == 0) {
            sampleC = c;
            foundSample = true;
        } else if (!foundAmbient) {
            ambientC = c;
            foundAmbient = true;
        }
    }
    return foundSample && foundAmbient;
}

// S2/S3 select the photodiode filter: red = L/L, blue = L/H, green = H/H.
static void selectFilter(int channel) {
    const uint8_t s2[3] = {LOW, HIGH, LOW};   // red, green, blue
    const uint8_t s3[3] = {LOW, HIGH, HIGH};
    digitalWrite(PIN_TCS_S2, s2[channel]);
    digitalWrite(PIN_TCS_S3, s3[channel]);
}

void readColourFrequencies(float freq[3]) {
    digitalWrite(PIN_TCS_LED, HIGH);
    delay(200);  // let the LEDs settle
    for (int ch = 0; ch < 3; ch++) {
        selectFilter(ch);
        delay(50);
        float total = 0;
        int good = 0;
        for (int i = 0; i < TCS_SAMPLES; i++) {
            // One full period = time LOW + time HIGH (microseconds). 0 means it timed out.
            unsigned long low = pulseIn(PIN_TCS_OUT, LOW, 100000);
            unsigned long high = pulseIn(PIN_TCS_OUT, HIGH, 100000);
            if (low > 0 && high > 0) {
                total += 1000000.0f / (float)(low + high);
                good++;
            }
        }
        freq[ch] = good > 0 ? total / good : 0;
    }
    digitalWrite(PIN_TCS_LED, LOW);
}
