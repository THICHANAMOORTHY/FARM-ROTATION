// Settings for the sensor node that are not secrets and not pins.
#pragma once

// Feed type sent with every test: maize_silage, sorghum_silage, napier_silage or other.
#define FEED_TYPE              "maize_silage"

// Optional farm ID sent with every test. Leave "" for none.
#define FARM_ID                ""

// Silage pH method (shown on the OLED): ~25 g silage + ~100 mL distilled water, wait ~10 min.
#define SOAK_SECONDS           600

// Readings averaged per measurement
#define PH_SAMPLES             30
#define MOISTURE_SAMPLES       20
#define TCS_SAMPLES            5

// Hold the button this long to open the pH calibration wizard.
#define LONG_PRESS_MS          2000

// HTTP timeout for the upload, in milliseconds.
#define HTTP_TIMEOUT_MS        10000

// NTP server and the timestamp is sent in UTC.
#define NTP_SERVER             "pool.ntp.org"
