// Calculations with no hardware in them, so they can be tested on a PC (pio test -e native).
#pragma once

#include <stdint.h>
#include <stdio.h>

// ---------- pH: two-point calibration ----------
// v7 and v4 are the ADS1115 voltages measured in the pH 7.0 and pH 4.0 buffers.
// The voltage divider before A0 scales every reading by the same factor, so it cancels out:
// we calibrate on the voltage the ADS1115 actually sees.

// A real probe changes by roughly 0.1-0.2 V between pH 7 and 4 (after the divider).
// Less than 0.05 V means the probe or the calibration is wrong.
inline bool phCalibrationValid(float v7, float v4) {
    float diff = v4 - v7;
    if (diff < 0) diff = -diff;
    return diff >= 0.05f;
}

// Straight line through (v7, 7.0) and (v4, 4.0).
inline float phFromVoltage(float v, float v7, float v4) {
    return 7.0f + (v - v7) * (4.0f - 7.0f) / (v4 - v7);
}

// ---------- Moisture: two-point calibration against oven-dry dry matter ----------
// (raw1, pct1) and (raw2, pct2) come from two silage samples whose moisture % was measured
// by oven-drying. Result is clamped to 0-100 %.
inline bool moistureCalibrationValid(int32_t raw1, float pct1, int32_t raw2, float pct2) {
    return raw1 != raw2 && pct1 != pct2;
}

inline float moisturePctFromRaw(int32_t raw, int32_t raw1, float pct1, int32_t raw2, float pct2) {
    float pct = pct1 + (float)(raw - raw1) * (pct2 - pct1) / (float)(raw2 - raw1);
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    return pct;
}

// ---------- Colour: TCS3200 frequency to 0-255 ----------
// Brighter light gives a higher frequency. fBlack and fWhite are the frequencies measured on a
// black and a white card inside the closed box, for this colour channel.
inline int colourTo255(float f, float fBlack, float fWhite) {
    if (fWhite <= fBlack) return 0;
    float value = (f - fBlack) * 255.0f / (fWhite - fBlack);
    if (value < 0) value = 0;
    if (value > 255) value = 255;
    return (int)(value + 0.5f);
}

// ---------- sample_id ----------
// With NTP time:    DF01-20261002T103015-0007
// Without NTP time: DF01-R1a2b3c4d-0007   (random part, so a reset counter can never repeat an old ID)
// The backend requires sample_id to start with "<device_id>-".
inline void formatSampleId(char* out, size_t size, const char* deviceId, bool timeSynced,
                           int year, int month, int day, int hour, int minute, int second,
                           uint32_t randomPart, uint32_t counter) {
    if (timeSynced) {
        snprintf(out, size, "%s-%04d%02d%02dT%02d%02d%02d-%04lu", deviceId, year, month, day, hour,
                 minute, second, (unsigned long)(counter % 10000));
    } else {
        snprintf(out, size, "%s-R%08lx-%04lu", deviceId, (unsigned long)randomPart,
                 (unsigned long)(counter % 10000));
    }
}
