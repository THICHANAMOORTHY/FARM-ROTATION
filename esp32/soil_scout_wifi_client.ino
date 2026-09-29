/* ============================================================
 * soil_scout_wifi_client.ino — Soil Scout Direct WiFi Client
 * UZHAVU KAAPPAAN / CropSmart IoT Integration
 *
 * Directly connects your Soil Scout ESP32 to WiFi and POSTs readings
 * every cycle to your local or deployed website backend:
 *    POST http://<YOUR_LAN_IP>:3000/api/soil-sensor/ingest
 *
 * Payload matching your Soil Scout:
 *    - temperature: 31.10
 *    - ph: 0.31 (or calibrated pH)
 *    - tds: 0.00
 *    - moisture: 0.00
 *    - light: 100.00
 *    - reliable: "no (too dry)" or boolean
 *    - nitrogen: 0.00
 *    - phosphorus: 0.00
 *    - potassium: 0.00
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── 1. WiFi & Server Credentials ──────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Local LAN IPv4 of your PC running `npm start` (e.g. 192.168.1.15 or 10.216.224.129)
const char* SERVER_URL    = "http://10.216.224.129:3000/api/soil-sensor/ingest";

// Shared device key matching ESP32_DEVICE_KEY in backend/.env
const char* DEVICE_KEY    = "b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc";
const char* DEVICE_ID     = "Soil-Scout-01";
const int   FARM_ID       = 101;

const unsigned long SEND_INTERVAL_MS = 10000; // 10 seconds
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n🌿 [Soil Scout] Booting up...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = millis();

    // Replace with your real sensor reading calls:
    float temperature = 31.10;
    float ph = 0.31;
    float tds = 0.00;
    float moisture = 0.00;
    float light = 100.00;
    float estimated_n = 0.00;
    float estimated_p = 0.00;
    float estimated_k = 0.00;
    bool  is_reliable = (moisture > 5.0); // Dry soil gives false 0 readings
    const char* reliable_str = is_reliable ? "yes" : "no (too dry)";

    // Print to Serial Monitor
    Serial.println("---- Soil Scout Reading ----");
    Serial.printf("Temperature: %.2f C\n", temperature);
    Serial.printf("pH: %.2f\n", ph);
    Serial.printf("TDS: %.2f ppm\n", tds);
    Serial.printf("Moisture: %.2f %%\n", moisture);
    Serial.printf("Light: %.2f %%\n", light);
    Serial.printf("Reading reliable: %s\n", reliable_str);
    Serial.printf("Estimated N: %.2f kg/ha\n", estimated_n);
    Serial.printf("Estimated P: %.2f kg/ha\n", estimated_p);
    Serial.printf("Estimated K: %.2f kg/ha\n", estimated_k);

    // Send HTTP POST to website
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("X-Device-Key", DEVICE_KEY);

      StaticJsonDocument<512> doc;
      doc["farm_id"]     = FARM_ID;
      doc["device_id"]   = DEVICE_ID;
      doc["temperature"] = temperature;
      doc["ph"]          = ph;
      doc["tds"]         = tds;
      doc["moisture"]    = moisture;
      doc["light"]       = light;
      doc["reliable"]    = reliable_str;
      doc["nitrogen"]    = estimated_n;
      doc["phosphorus"]  = estimated_p;
      doc["potassium"]   = estimated_k;

      String requestBody;
      serializeJson(doc, requestBody);

      int httpResponseCode = http.POST(requestBody);
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("📡 [Website API] HTTP %d: %s\n", httpResponseCode, response.c_str());
      } else {
        Serial.printf("❌ [Website API] Error on sending POST: %d\n", httpResponseCode);
      }
      http.end();
    } else {
      Serial.println("❌ WiFi Disconnected");
    }
  }
}
