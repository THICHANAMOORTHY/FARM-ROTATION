/* ============================================================
 * neo6m_gps_soil_client.ino — ESP32 + NEO-6M GPS Module + Soil Sensors
 *
 * Transmits real-time physical GPS coordinates (Latitude & Longitude)
 * along with soil/environmental telemetry directly into UZHAVU KAAPPAAN
 * (/api/soil-sensor/ingest) over Wi-Fi.
 *
 * Enables automatic spatial micro-zone allocation (Zone A, B, C, D)
 * centered on the farmer's real-time field coordinates!
 *
 * ── Hardware Wiring ──────────────────────────────────────────
 * NEO-6M GPS Module:
 *   VCC  -> ESP32 3.3V (or 5V if module has onboard 3.3V regulator)
 *   GND  -> ESP32 GND
 *   TXD  -> ESP32 GPIO 16 (Hardware Serial2 RX)
 *   RXD  -> ESP32 GPIO 17 (Hardware Serial2 TX)
 *
 * Optional Sensors:
 *   DHT11/DHT22 DATA -> GPIO 4
 *   Soil Moisture AO -> GPIO 34 (ADC1)
 *   TDS Sensor AO    -> GPIO 35 (ADC1)
 *
 * ── Required Arduino Libraries ───────────────────────────────
 * In Arduino IDE -> Sketch -> Include Library -> Manage Libraries:
 *   1. "TinyGPSPlus" by Mikal Hart
 *   2. "DHT sensor library" by Adafruit (optional, if using DHT)
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>

// ── Wi-Fi Configuration ──────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ── UZHAVU KAAPPAAN Backend Host ─────────────────────────────
// Use your computer's local IP address (find using 'ipconfig' on Windows)
const char* SERVER_HOST   = "http://10.216.224.129:3000";
const char* INGEST_PATH   = "/api/soil-sensor/ingest";

// Shared device key matching ESP32_DEVICE_KEY in backend/.env
const char* DEVICE_KEY    = "b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc";
const char* DEVICE_ID     = "esp32-neo6m-field-probe";
const int   FARM_ID       = 101;

// Telemetry transmit interval (in milliseconds)
const unsigned long POST_INTERVAL_MS = 10000; // Every 10 seconds

// ── Hardware Serial2 for NEO-6M GPS ──────────────────────────
#define GPS_RX_PIN 16 // Connects to NEO-6M TX
#define GPS_TX_PIN 17 // Connects to NEO-6M RX
#define GPS_BAUD   9600

HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// Optional Analog Soil Moisture Pin
#define SOIL_PIN 34
const int SOIL_DRY_VALUE = 4095;
const int SOIL_WET_VALUE = 1200;

unsigned long lastPostTime = 0;

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("\n[WiFi] Connecting to %s ", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] Connection failed. Will retry next cycle.");
  }
}

int readSoilMoisturePercent() {
  int raw = analogRead(SOIL_PIN);
  int pct = map(raw, SOIL_DRY_VALUE, SOIL_WET_VALUE, 0, 100);
  return constrain(pct, 0, 100);
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================================");
  Serial.println("  🌱 UZHAVU KAAPPAAN — ESP32 + NEO-6M GPS Field Probe");
  Serial.println("========================================================");

  // Initialize NEO-6M UART on Serial2
  gpsSerial.begin(GPS_BAUD, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.printf("📡 NEO-6M GPS initialized on RX=GPIO %d, TX=GPIO %d (9600 baud)\n", GPS_RX_PIN, GPS_TX_PIN);

  connectWiFi();
}

void loop() {
  // Feed incoming NMEA stream from NEO-6M into TinyGPS++ parser
  while (gpsSerial.available() > 0) {
    char c = gpsSerial.read();
    gps.encode(c);
  }

  // Periodic transmission check
  if (millis() - lastPostTime >= POST_INTERVAL_MS) {
    lastPostTime = millis();

    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;

    double lat = 0.0;
    double lon = 0.0;
    bool hasGpsFix = false;

    if (gps.location.isValid()) {
      lat = gps.location.lat();
      lon = gps.location.lng();
      hasGpsFix = true;
      Serial.printf("📍 [GPS FIX] Lat: %.6f, Lon: %.6f | Sats: %d | HDOP: %.1f\n",
                    lat, lon, gps.satellites.value(), gps.hdop.hdop());
    } else {
      Serial.printf("⏳ [GPS SEARCHING] Satellites: %d (Awaiting outdoor lock...)\n",
                    gps.satellites.value());
      // Fallback coordinate for testing indoors if satellite lock hasn't completed yet
      lat = 11.0168;
      lon = 76.9558;
    }

    int soilMoisture = readSoilMoisturePercent();
    float temp = 28.2;  // Replace with dht.readTemperature() if DHT connected
    float hum  = 62.0;  // Replace with dht.readHumidity() if DHT connected
    int   tds  = 430;   // In ppm

    // Construct JSON Payload
    String payload = "{";
    payload += "\"farm_id\":" + String(FARM_ID) + ",";
    payload += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
    payload += "\"latitude\":" + String(lat, 6) + ",";
    payload += "\"longitude\":" + String(lon, 6) + ",";
    payload += "\"air_temperature\":" + String(temp, 1) + ",";
    payload += "\"air_humidity\":" + String(hum, 1) + ",";
    payload += "\"soil_moisture\":" + String(soilMoisture) + ",";
    payload += "\"tds\":" + String(tds);
    payload += "}";

    // HTTP POST to UZHAVU KAAPPAAN API
    HTTPClient http;
    String url = String(SERVER_HOST) + String(INGEST_PATH);
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Key", DEVICE_KEY);

    Serial.printf("🚀 Posting telemetry to %s ...\n", url.c_str());
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      String response = http.getString();
      Serial.printf("✅ Server Response [%d]: %s\n", httpCode, response.c_str());
    } else {
      Serial.printf("❌ POST failed: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
}
