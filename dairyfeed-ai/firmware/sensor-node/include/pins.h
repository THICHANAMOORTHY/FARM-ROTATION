// All pin numbers for the sensor node. Never write pin numbers anywhere else.
// Wiring diagram and bench tests: docs/wiring.md — update it in the same change as this file.
//
// Rule: no analog reads on the ESP32 itself. pH and moisture go through the ADS1115,
// because ADC2 pins (GPIO 0, 2, 4, 12-15, 25-27) stop working while Wi-Fi is on.
// The pins below that are on ADC2 are used only as DIGITAL pins, which is fine.
#pragma once

// I2C bus, shared by the ADS1115 and the OLED
#define PIN_I2C_SDA        21
#define PIN_I2C_SCL        22

// DS18B20 x2 (sample + ambient) on one OneWire bus, with one 4.7k pull-up to 3.3 V
#define PIN_ONEWIRE        4

// TCS3200 colour sensor
#define PIN_TCS_S0         25
#define PIN_TCS_S1         26
#define PIN_TCS_S2         32
#define PIN_TCS_S3         33
#define PIN_TCS_OUT        34   // input-only pin, fine: OUT is a signal from the sensor
#define PIN_TCS_LED        14   // white LEDs in the closed box: on only while measuring

// Push button to GND (uses the internal pull-up)
#define PIN_BUTTON         27

// UART to the camera node: sends "SNAP <sample_id>"
#define PIN_CAM_TX         17   // -> ESP32-CAM RX
#define PIN_CAM_RX         16   // <- ESP32-CAM TX (for "OK"/"ERR" replies)

// ADS1115 input channels
#define ADS_CH_PH          0    // A0 <- pH module Po, through the 10k/20k divider
#define ADS_CH_MOISTURE    1    // A1 <- capacitive moisture sensor AOUT (sensor powered from 3.3 V)
