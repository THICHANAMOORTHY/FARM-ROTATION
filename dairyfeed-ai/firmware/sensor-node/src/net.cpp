#include "net.h"

#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

#include "config.h"
#include "secrets.h"

bool wifiConnect(uint32_t timeoutMs) {
    if (WiFi.status() == WL_CONNECTED) return true;
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    uint32_t start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < timeoutMs) {
        delay(250);
    }
    if (WiFi.status() != WL_CONNECTED) return false;
    startClockSync();
    return true;
}

void startClockSync() {
    static bool started = false;
    if (started) return;
    configTime(0, 0, NTP_SERVER);  // UTC, no daylight saving; keeps re-syncing in the background
    started = true;
}

bool clockSynced(struct tm* out) {
    // Before NTP sync the ESP32 clock starts in 1970, so any year before 2024 means "not synced".
    if (!getLocalTime(out, 100)) return false;
    return out->tm_year + 1900 >= 2024;
}

static void copyText(char* dest, size_t size, const char* src) {
    strncpy(dest, src ? src : "", size - 1);
    dest[size - 1] = '\0';
}

UploadResult uploadTest(const String& json) {
    UploadResult result = {};
    String url = String(BACKEND_URL) + "/api/silage/test";

    // HTTPS note: setInsecure() encrypts the connection but does NOT check the server's
    // certificate. Fine for a demo; for real deployment, load the server's root CA instead.
    WiFiClient plainClient;
    WiFiClientSecure secureClient;
    secureClient.setInsecure();
    WiFiClient& client = url.startsWith("https://") ? static_cast<WiFiClient&>(secureClient) : plainClient;

    HTTPClient http;
    http.setTimeout(HTTP_TIMEOUT_MS);
    if (!http.begin(client, url)) {
        result.httpCode = -1;
        copyText(result.error, sizeof(result.error), "Bad BACKEND_URL");
        return result;
    }
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", DEVICE_API_KEY);

    result.httpCode = http.POST(json);
    if (result.httpCode < 0) {
        copyText(result.error, sizeof(result.error), http.errorToString(result.httpCode).c_str());
        http.end();
        return result;
    }
    String body = http.getString();
    http.end();

    if (result.httpCode != 200) {
        // FastAPI errors look like {"detail": "..."}; validation errors have a list instead.
        JsonDocument err;
        if (!deserializeJson(err, body) && err["detail"].is<const char*>()) {
            copyText(result.error, sizeof(result.error), err["detail"].as<const char*>());
        } else {
            snprintf(result.error, sizeof(result.error), "HTTP %d", result.httpCode);
        }
        Serial.println(body);
        return result;
    }

    // Read only the fields we show, so the long advisory text doesn't use up memory.
    JsonDocument filter;
    filter["prediction"]["quality"] = true;
    filter["prediction"]["score"] = true;
    filter["prediction"]["spoilage_risk"] = true;
    filter["prediction"]["mould_risk"] = true;
    filter["prediction"]["method"] = true;
    JsonDocument doc;
    if (deserializeJson(doc, body, DeserializationOption::Filter(filter))) {
        copyText(result.error, sizeof(result.error), "Bad reply from server");
        result.httpCode = -2;
        return result;
    }
    JsonObject p = doc["prediction"];
    copyText(result.quality, sizeof(result.quality), p["quality"].as<const char*>());
    result.score = p["score"].as<int>();
    copyText(result.spoilage, sizeof(result.spoilage), p["spoilage_risk"].as<const char*>());
    copyText(result.mould, sizeof(result.mould), p["mould_risk"].as<const char*>());
    copyText(result.method, sizeof(result.method), p["method"].as<const char*>());
    return result;
}
