# Firmware

Two PlatformIO projects:

| Project | Board | Job |
|---|---|---|
| `sensor-node/` | `esp32dev` (Arduino) | Reads pH, moisture, temperature and colour, shows the result on the OLED, uploads to the backend |
| `cam-node/` | `esp32cam` (AI-Thinker) | Photographs the sample when the sensor node sends a `sample_id` over UART |

**Status:** structure only. Sensor node code arrives in Phase 3, offline queue in Phase 4, camera node in Phase 5.

## Before flashing

1. Install [PlatformIO](https://platformio.org/install) (VS Code extension or CLI).
2. In each project, copy `include/secrets.example.h` to `include/secrets.h` and fill it in.
3. Wiring: `../docs/wiring.md`. Calibration: `../docs/calibration.md`.

**Rule:** never use ADC2 pins (GPIO 0, 2, 4, 12–15, 25–27) for analog reads; they stop working
while Wi-Fi is on. Use ADC1 (GPIO 32–39) or the ADS1115.
