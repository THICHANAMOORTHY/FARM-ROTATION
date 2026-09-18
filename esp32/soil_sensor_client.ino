/* ============================================================
 * soil_sensor_client.ino — ESP32 Live Soil Sensor Client
 * UZHAVU KAAPPAAN (CropSmart P025)
 *
 * Reads a 7-in-1 RS485/Modbus soil sensor (N, P, K, pH, moisture,
 * temperature, conductivity — the common cheap agri-IoT module) and
 * POSTs a reading to the backend every SEND_INTERVAL_MS.
 *
 * IMPORTANT — you WILL need to adapt this:
 * 1. WIFI_SSID / WIFI_PASSWORD / SERVER_HOST below.
 * 2. The Modbus register addresses in readSoilSensor() — these vary
 *    by sensor vendor. Check your sensor's datasheet. The values
 *    below match the widely-sold "7-in-1 NPK soil sensor" register
 *    map, but confirm against yours before trusting readings.
 * 3. Most cheap sensors do NOT measure organic carbon directly —
 *    see the estimateOrganicCarbon() note below.
 *
 * Libraries required (Arduino IDE > Tools > Manage Libraries):
 *   - ModbusMaster (by Doc Walker)
 *   - ArduinoJson
 *   (WiFi.h and HTTPClient.h ship with the ESP32 board package)
 *
 * Wiring (typical RS485-to-TTL module, e.g. MAX485):
 *   ESP32 TX2 (GPIO17) -> MAX485 DI
 *   ESP32 RX2 (GPIO16) -> MAX485 RO
 *   ESP32 GPIO4        -> MAX485 DE + RE (tied together, driven HIGH to send)
 *   Sensor RS485 A/B    -> MAX485 A/B
 *   Sensor power: check datasheet, usually 12V (NOT powered from ESP32 5V)
 * ============================================================ */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ModbusMaster.h>

// ── 1. Network config ───────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// LAN IP of the machine running `npm start` (from Q&A: "same WiFi
// network as this dev machine"). Find it with `ipconfig` (Windows)
// or `ifconfig`/`ip addr` (Mac/Linux) — look for the WiFi adapter's
// IPv4 address, e.g. 192.168.1.42. localhost will NOT work here —
// the ESP32 is a different device on the network.
const char* SERVER_HOST = "10.243.107.129";
const int   SERVER_PORT = 3000;

// Must exactly match ESP32_DEVICE_KEY in backend/.env — copy the value from
// there (do NOT commit your real key into this file or version control).
const char* DEVICE_KEY = "b2cd3ba3dca8ce14d6da53f323b802f759111246836157dc";
const char* DEVICE_ID  = "esp32-field-01";

// Which farm this sensor belongs to (see /api/farms for valid ids)
const int FARM_ID = 101;

const unsigned long SEND_INTERVAL_MS = 5000; // 5s; raise to 30-60s for real deployments

// ── 2. RS485 / Modbus setup ──────────────────────────────────
#define RS485_DE_RE_PIN 4
#define MODBUS_SLAVE_ID 1

ModbusMaster node;

void preTransmission()  { digitalWrite(RS485_DE_RE_PIN, HIGH); }
void postTransmission() { digitalWrite(RS485_DE_RE_PIN, LOW); }

// ── 3. Sensor read ───────────────────────────────────────────
// Returns false if the Modbus read failed (bad wiring, wrong slave
// id, sensor not powered) — caller skips sending that cycle.
struct SoilReading {
  float nitrogen, phosphorus, potassium, ph, organic_carbon;
  float tds, moisture, temperature;
};

bool readSoilSensor(SoilReading &out) {
  // Common 7-in-1 sensor register map (CONFIRM against your datasheet):
  //   0x0000 moisture (%), 0x0001 temperature (°C), 0x0002 conductivity (us/cm)
  //   0x0003 pH (x10),     0x0004 nitrogen (mg/kg), 0x0005 phosphorus (mg/kg)
  //   0x0006 potassium (mg/kg)
  uint8_t result = node.readHoldingRegisters(0x0000, 7);
  if (result != node.ku8MBSuccess) {
    Serial.print("Modbus read failed, code: ");
    Serial.println(result);
    return false;
  }

  float moisture     = node.getResponseBuffer(0) / 10.0;
  float temperature  = node.getResponseBuffer(1) / 10.0;
  float conductivity = node.getResponseBuffer(2);
  float ph           = node.getResponseBuffer(3) / 10.0;
  float nitrogen     = node.getResponseBuffer(4);
  float phosphorus   = node.getResponseBuffer(5);
  float potassium    = node.getResponseBuffer(6);

  out.nitrogen   = nitrogen;
  out.phosphorus = phosphorus;
  out.potassium  = potassium;
  out.ph         = ph;
  out.moisture   = moisture;
  out.temperature= temperature;
  out.tds        = conductivity * 0.5; // EC (µS/cm) converted to TDS (ppm)

  // NOTE: this class of sensor does NOT measure organic carbon
  // directly. This is a rough proxy from conductivity + moisture,
  // NOT a real lab measurement — good enough for a live demo, not
  // for agronomic decisions. Replace with a real OC sensor reading
  // if you have one, or just hardcode a manual estimate here.
  out.organic_carbon = estimateOrganicCarbon(conductivity, moisture);

  Serial.printf("N=%.0f P=%.0f K=%.0f pH=%.1f OC(est)=%.2f TDS=%.0fppm moisture=%.1f%% temp=%.1fC\n",
    out.nitrogen, out.phosphorus, out.potassium, out.ph, out.organic_carbon, out.tds, moisture, temperature);

  return true;
}

float estimateOrganicCarbon(float conductivity, float moisture) {
  float estimate = 0.3 + (conductivity / 1000.0) * 0.4 + (moisture / 100.0) * 0.3;
  if (estimate < 0.1) estimate = 0.1;
  if (estimate > 2.0) estimate = 2.0;
  return estimate;
}

// ── 4. WiFi + HTTP POST ───────────────────────────────────────
void connectWiFi() {
  Serial.printf("Connecting to WiFi \"%s\"", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.printf("\nConnected. IP: %s\n", WiFi.localIP().toString().c_str());
}

void sendReading(const SoilReading &r) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi dropped — reconnecting before send.");
    connectWiFi();
  }

  HTTPClient http;
  String url = String("http://") + SERVER_HOST + ":" + SERVER_PORT + "/api/soil-sensor/ingest";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_KEY);

  StaticJsonDocument<384> doc;
  doc["farm_id"]         = FARM_ID;
  doc["device_id"]       = DEVICE_ID;
  doc["nitrogen"]        = r.nitrogen;
  doc["phosphorus"]      = r.phosphorus;
  doc["potassium"]       = r.potassium;
  doc["ph"]              = r.ph;
  doc["organic_carbon"]  = r.organic_carbon;
  doc["tds"]             = r.tds;
  doc["soil_moisture"]   = r.moisture;
  doc["air_temperature"] = r.temperature;

  String body;
  serializeJson(doc, body);

  int statusCode = http.POST(body);
  if (statusCode > 0) {
    Serial.printf("POST %s -> %d: %s\n", url.c_str(), statusCode, http.getString().c_str());
  } else {
    Serial.printf("POST failed: %s\n", http.errorToString(statusCode).c_str());
  }
  http.end();
}

// ── 5. Arduino lifecycle ──────────────────────────────────────
unsigned long lastSendAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(RS485_DE_RE_PIN, OUTPUT);
  digitalWrite(RS485_DE_RE_PIN, LOW);

  Serial2.begin(4800, SERIAL_8N1, 16, 17); // RX2, TX2 — most of these sensors run 4800 baud
  node.begin(MODBUS_SLAVE_ID, Serial2);
  node.preTransmission(preTransmission);
  node.postTransmission(postTransmission);

  connectWiFi();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSendAt >= SEND_INTERVAL_MS) {
    lastSendAt = now;
    SoilReading reading;
    if (readSoilSensor(reading)) {
      sendReading(reading);
    }
  }
}
