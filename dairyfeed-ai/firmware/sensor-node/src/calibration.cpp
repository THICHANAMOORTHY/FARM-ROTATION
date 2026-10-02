#include "calibration.h"

#include <Preferences.h>
#include <string.h>

// Bump this when the Calibration struct changes, so old saved data is not misread.
static const uint32_t CAL_VERSION = 1;

Calibration cal;
static Preferences prefs;

void resetCalibration() {
    memset(&cal, 0, sizeof(cal));
}

void loadCalibration() {
    resetCalibration();
    prefs.begin("dfcal", true);  // read-only
    if (prefs.getUInt("version", 0) == CAL_VERSION && prefs.getBytesLength("cal") == sizeof(cal)) {
        prefs.getBytes("cal", &cal, sizeof(cal));
    }
    prefs.end();
}

void saveCalibration() {
    prefs.begin("dfcal", false);
    prefs.putUInt("version", CAL_VERSION);
    prefs.putBytes("cal", &cal, sizeof(cal));
    prefs.end();
}

uint32_t nextTestCounter() {
    prefs.begin("dfcal", false);
    uint32_t counter = prefs.getUInt("counter", 0) + 1;
    prefs.putUInt("counter", counter);
    prefs.end();
    return counter;
}
