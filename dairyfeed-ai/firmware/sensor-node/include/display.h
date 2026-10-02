// OLED (SSD1306 128x64). Every message is also printed to Serial, so the node
// still works (and can be debugged) if the OLED is missing.
#pragma once

// Looks for the OLED at 0x3C, then 0x3D. Returns false if not found.
bool displayBegin();

// Title on the first line, then up to 4 short lines (about 21 characters each).
void showScreen(const char* title, const char* line1 = "", const char* line2 = "",
                const char* line3 = "", const char* line4 = "");
