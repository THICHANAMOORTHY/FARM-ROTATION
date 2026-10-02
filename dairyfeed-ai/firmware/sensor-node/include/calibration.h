// Calibration values, saved in the ESP32's NVS (flash) so they survive a reboot.
// How to calibrate: docs/calibration.md
#pragma once

#include <stdint.h>

struct Calibration {
    // pH: ADS1115 voltages in the pH 7.0 and pH 4.0 buffers
    bool phOk;
    float phV7;
    float phV4;

    // Moisture: two (raw, %) points from oven-dried samples
    bool moistureOk;
    int32_t moistureRaw1;
    float moisturePct1;
    int32_t moistureRaw2;
    float moisturePct2;

    // DS18B20: address of the probe that goes into the sample (the other one is ambient)
    bool probesOk;
    uint8_t sampleProbe[8];

    // TCS3200: frequency (Hz) on a black and a white card, for red, green, blue
    bool colourOk;
    float colourBlack[3];
    float colourWhite[3];
};

extern Calibration cal;

void loadCalibration();
void saveCalibration();
void resetCalibration();

// Test counter, used in the sample_id. Saved on every test.
uint32_t nextTestCounter();
