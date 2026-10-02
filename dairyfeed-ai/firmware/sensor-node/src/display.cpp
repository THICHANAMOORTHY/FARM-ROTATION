#include "display.h"

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Arduino.h>
#include <Wire.h>

static Adafruit_SSD1306 oled(128, 64, &Wire, -1);
static bool oledFound = false;

static bool i2cDevicePresent(uint8_t address) {
    Wire.beginTransmission(address);
    return Wire.endTransmission() == 0;
}

bool displayBegin() {
    const uint8_t addresses[2] = {0x3C, 0x3D};
    for (uint8_t address : addresses) {
        if (i2cDevicePresent(address) && oled.begin(SSD1306_SWITCHCAPVCC, address)) {
            Serial.printf("OLED found at 0x%02X\n", address);
            oledFound = true;
            oled.setTextColor(SSD1306_WHITE);
            return true;
        }
    }
    Serial.println("OLED not found at 0x3C or 0x3D: messages go to Serial only");
    return false;
}

void showScreen(const char* title, const char* line1, const char* line2, const char* line3,
                const char* line4) {
    Serial.printf("[%s] %s | %s | %s | %s\n", title, line1, line2, line3, line4);
    if (!oledFound) return;

    oled.clearDisplay();
    oled.setTextSize(1);
    oled.setCursor(0, 0);
    oled.println(title);
    oled.drawFastHLine(0, 10, 128, SSD1306_WHITE);
    const char* lines[4] = {line1, line2, line3, line4};
    for (int i = 0; i < 4; i++) {
        oled.setCursor(0, 14 + i * 12);
        oled.print(lines[i]);
    }
    oled.display();
}
