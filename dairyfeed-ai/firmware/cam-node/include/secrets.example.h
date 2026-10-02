// Copy this file to secrets.h (same folder) and fill in your values.
// secrets.h is gitignored — never commit it.
#pragma once

#define WIFI_SSID        "your-wifi-name"
#define WIFI_PASSWORD    "your-wifi-password"

// Backend base URL, no trailing slash. On a LAN use the PC's IP, e.g. "http://192.168.1.20:8000".
#define BACKEND_URL      "http://192.168.1.20:8000"

// Must match DEVICE_API_KEY in backend/.env
#define DEVICE_API_KEY   "replace_with_the_same_key_as_the_backend"

// Unique short ID for this device; it starts every sample_id.
#define DEVICE_ID        "DF01"
