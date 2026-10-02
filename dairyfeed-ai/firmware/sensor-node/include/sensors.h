// Sensor drivers: ADS1115 (pH + moisture), DS18B20 x2, TCS3200.
#pragma once

#include <stdint.h>

// Returns false if the ADS1115 is not found on the I2C bus.
bool sensorsBegin();

// Average ADS1115 voltage on a channel (ADS_CH_PH or ADS_CH_MOISTURE).
float readAdsVolts(uint8_t channel, int samples);

// Average raw ADS1115 count on a channel.
int32_t readAdsRaw(uint8_t channel, int samples);

// Number of DS18B20 probes found on the bus (should be 2).
int probeCount();

// Copies the address of probe number `index` into addr[8]. Returns false if it doesn't exist.
bool probeAddress(int index, uint8_t addr[8]);

// Reads all probes. Returns false if a probe is missing or disconnected.
// Uses cal.sampleProbe to tell which probe is the sample and which is ambient.
bool readTemperatures(float& sampleC, float& ambientC);

// Temperature of probe `index`, or a value below -100 if it can't be read.
float readProbeC(int index);

// TCS3200: average output frequency (Hz) for channel 0 = red, 1 = green, 2 = blue.
// Turns the box LEDs on while measuring.
void readColourFrequencies(float freq[3]);
