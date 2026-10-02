// Wi-Fi, clock (NTP) and upload to the backend.
#pragma once

#include <Arduino.h>
#include <time.h>

// Connects to Wi-Fi (credentials from secrets.h) and starts the clock sync. Returns true when connected.
bool wifiConnect(uint32_t timeoutMs);

// Starts NTP time sync (only the first time it is called).
void startClockSync();

// Fills `out` with the current UTC time. Returns false if the clock has never been synced.
bool clockSynced(struct tm* out);

struct UploadResult {
    int httpCode;          // 200 = OK; negative = network error (no reply)
    char quality[12];      // Good / Moderate / Poor
    int score;
    char spoilage[8];      // Low / Medium / High
    char mould[8];         // Low / High / Unknown
    char method[8];        // rules / ml
    char error[64];        // short reason when httpCode != 200
};

// POSTs one test to /api/silage/test and reads back the prediction.
UploadResult uploadTest(const String& json);
