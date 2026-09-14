/* ============================================================
 * dht11_soil_moisture_client.ino — ESP32 + DHT11 + Analog Soil
 * Moisture Probe, feeding UZHAVU KAAPPAAN's Live Sensor mode
 * (backend/routes/soilSensor.js) over WiFi.
 *
 * This is the "Desk Weather Station" sketch adapted to also POST
 * readings to the app instead of only serving its own local page —
 * both are kept, since the local page is handy for on-site debugging
 * without opening the app.
 *
 * This board has NO NPK/pH sensor, so it only ever sends the
 * env fields the backend supports for that case: air_temperature,
 * air_humidity, soil_moisture. It will never carry a soil_health_score
 * on its own — that still needs a real soil test (manual entry, or a
 * full 7-in-1 sensor — see esp32/soil_sensor_client.ino) at least once.
 * Once one exists, the app keeps showing it alongside this device's
 * live temp/humidity/moisture rather than blanking it out.
 *
 * Wiring:
 *   DHT11 VCC  -> 3.3V
 *   DHT11 GND  -> GND
 *   DHT11 DATA -> GPIO 4
 *
 *   Soil sensor VCC -> 3.3V
 *   Soil sensor GND -> GND
 *   Soil sensor AO  -> GPIO 34 (analog input only pin)
 *
 * Setup:
 *   1. Fill in WIFI_SSID / WIFI_PASSWORD / SERVER_HOST / DEVICE_KEY below.
 *   2. Upload. Open Serial Monitor (115200 baud) — it prints an IP like
 *      "Connected! IP: 192.168.1.55" once WiFi connects.
 *   3. Optional: open that IP in a browser for the standalone debug page
 *      (auto-refreshes every 3s). This is separate from — and doesn't
 *      require — the app itself.
 *   4. The app's Soil Analysis page -> Live Sensor (ESP32) toggle will
 *      start showing live readings once the first POST succeeds.
 *
 * Library required (Arduino IDE > Tools > Manage Libraries):
 *   - DHT sensor library (by Adafruit)
 * (WiFi.h, WebServer.h and HTTPClient.h ship with the ESP32 board package)
 * ============================================================ */

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <DHT.h>

// ---- WiFi credentials ----
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ---- UZHAVU KAAPPAAN backend ----
// Full base URL of the machine running `npm start` — LAN IP (find with
// `ipconfig` / `ifconfig`, the WiFi adapter's IPv4), NOT localhost (the
// ESP32 is a different device on the network), including "http://" and
// the port, e.g. "http://192.168.1.42:3000".
const char* SERVER_HOST = "http://192.168.1.XX:3000"; // <-- your backend LAN IP
const char* INGEST_PATH = "/api/soil-sensor/ingest";

// Must exactly match ESP32_DEVICE_KEY in backend/.env
const char* DEVICE_KEY  = "PASTE_ESP32_DEVICE_KEY_HERE";
const char* DEVICE_ID   = "esp32-desk-station-01";

// Which farm this device belongs to (see /api/farms for valid ids)
const int FARM_ID = 101; // <-- set to your actual farm_id

const unsigned long POST_INTERVAL_MS = 10000; // 10s; raise for a real deployment

// ---- DHT setup ----
#define DHTPIN   4
#define DHTTYPE  DHT11
DHT dht(DHTPIN, DHTTYPE);

// ---- Soil moisture sensor setup ----
#define SOILPIN  34

// Raw ADC readings for calibration — adjust after testing your sensor.
// DRY_VALUE = reading in open air (fully dry)
// WET_VALUE = reading fully submerged in water
const int SOIL_DRY_VALUE = 4095;
const int SOIL_WET_VALUE = 1200;

WebServer server(80);

float lastTemp = NAN;
float lastHum  = NAN;
int   lastSoilRaw = -1;
int   lastSoilPercent = -1;
unsigned long lastRead = 0;
unsigned long lastPost = 0;
const unsigned long READ_INTERVAL = 2000;

// ── Local debug webpage (unchanged from the original sketch) ─────────
void handleRoot() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta http-equiv='refresh' content='3'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<title>Desk Weather Station</title>";
  html += "<style>";
  html += "body{font-family:sans-serif;background:#111;color:#eee;text-align:center;padding-top:60px;}";
  html += "h1{color:#4fd1c5;}";
  html += ".value{font-size:64px;margin:20px;}";
  html += ".label{font-size:20px;color:#aaa;}";
  html += ".err{color:#ff6b6b;}";
  html += "</style></head><body>";
  html += "<h1>Desk Weather Station</h1>";

  html += "<div class='label'>Temperature</div>";
  if (isnan(lastTemp)) {
    html += "<div class='value err'>Sensor Err</div>";
  } else {
    html += "<div class='value'>" + String(lastTemp, 1) + " &deg;C</div>";
  }

  html += "<div class='label'>Humidity</div>";
  if (isnan(lastHum)) {
    html += "<div class='value err'>Sensor Err</div>";
  } else {
    html += "<div class='value'>" + String(lastHum, 1) + " %</div>";
  }

  html += "<div class='label'>Soil Moisture</div>";
  if (lastSoilPercent < 0) {
    html += "<div class='value err'>Sensor Err</div>";
  } else {
    html += "<div class='value'>" + String(lastSoilPercent) + " %</div>";
  }

  html += "</body></html>";
  server.send(200, "text/html", html);
}

// ── POST the latest reading to the app ────────────────────────────
void postToServer() {
  if (isnan(lastTemp) && isnan(lastHum) && lastSoilPercent < 0) return; // nothing valid to send yet

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi dropped — skipping this post.");
    return;
  }

  HTTPClient http;
  String url = String(SERVER_HOST) + INGEST_PATH;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);

  String body = "{\"farm_id\":" + String(FARM_ID) + ",\"device_id\":\"" + DEVICE_ID + "\"";
  if (!isnan(lastTemp))        body += ",\"air_temperature\":" + String(lastTemp, 1);
  if (!isnan(lastHum))         body += ",\"air_humidity\":" + String(lastHum, 1);
  if (lastSoilPercent >= 0)    body += ",\"soil_moisture\":" + String(lastSoilPercent);
  body += "}";

  int statusCode = http.POST(body);
  if (statusCode > 0) {
    Serial.printf("POST %s -> %d: %s\n", url.c_str(), statusCode, http.getString().c_str());
  } else {
    Serial.printf("POST failed: %s\n", http.errorToString(statusCode).c_str());
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(SOILPIN, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.begin();
  Serial.println("Local debug web server started.");
}

void loop() {
  unsigned long now = millis();

  if (now - lastRead >= READ_INTERVAL) {
    lastRead = now;
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    if (!isnan(h) && !isnan(t)) {
      lastTemp = t;
      lastHum  = h;
      Serial.printf("Temp: %.1f C  Humidity: %.1f %%\n", t, h);
    } else {
      Serial.println("Failed to read from DHT sensor!");
    }

    lastSoilRaw = analogRead(SOILPIN);
    int percent = map(lastSoilRaw, SOIL_DRY_VALUE, SOIL_WET_VALUE, 0, 100);
    lastSoilPercent = constrain(percent, 0, 100);
    Serial.printf("Soil raw: %d  Soil moisture: %d %%\n", lastSoilRaw, lastSoilPercent);
  }

  if (now - lastPost >= POST_INTERVAL_MS) {
    lastPost = now;
    postToServer();
  }

  server.handleClient();
}
