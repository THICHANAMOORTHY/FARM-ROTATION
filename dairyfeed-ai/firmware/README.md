# Firmware

Two PlatformIO projects:

| Project | Board | Job |
|---|---|---|
| `sensor-node/` | `esp32dev` (Arduino) | Reads pH and moisture (via ADS1115), temperature (DS18B20 ×2) and colour (TCS3200), shows the result on the OLED, uploads to the backend, triggers the camera |
| `cam-node/` | `esp32cam` (AI-Thinker) | Photographs the sample when the sensor node sends `SNAP <sample_id>` over UART |

**Status:** sensor node done (Phase 3). Offline queue and on-device score: Phase 4.
Camera node: Phase 5.

## Sensor node: build and flash

1. Install [PlatformIO](https://platformio.org/install) (VS Code extension or `pip install platformio`).
2. Copy `sensor-node/include/secrets.example.h` to `sensor-node/include/secrets.h` and fill it in.
   `DEVICE_API_KEY` must match `DEVICE_API_KEY` in `backend/.env`.
3. Check `sensor-node/include/config.h` (feed type, farm ID, soak time).
4. Wire it up: `../docs/wiring.md`. Then calibrate: `../docs/calibration.md`.

```bash
cd dairyfeed-ai/firmware/sensor-node
pio run                  # build
pio run -t upload        # flash over USB
pio device monitor       # serial monitor, 115200 baud — type "help"
pio test -e native       # logic tests on your PC, no board needed
```

The first `pio run` downloads the ESP32 toolchain and the libraries (a few hundred MB).

## How a test works

1. Short press → screen: mix ~25 g silage with ~100 mL distilled water → press → 10-minute countdown (press to skip).
2. Insert the probes (pH in the liquid; moisture and sample temperature in the silage), put
   silage in the colour box, press.
3. The node measures, makes a `sample_id`, sends `SNAP <sample_id>` to the camera, and posts the
   readings to `/api/silage/test`.
4. The OLED shows quality, score, spoilage risk, mould risk, and "Rule-based" or "AI model".

Every reading is also printed as JSON on USB serial. Until Phase 4 adds the offline queue,
that printout is the only copy if the upload fails.

## Files

| File | Role |
|---|---|
| `include/pins.h` | Every pin number |
| `include/config.h` | Feed type, farm ID, timings, sample counts |
| `include/secrets.h` | Wi-Fi, backend URL, device key (gitignored) |
| `include/logic.h` | Calibration maths and sample_id format, tested in `test/` |
| `src/main.cpp` | Start-up, button, test flow, pH wizard |
| `src/sensors.cpp` | ADS1115, DS18B20, TCS3200 |
| `src/calibration.cpp` | Saving calibration in NVS |
| `src/commands.cpp` | Serial calibration commands |
| `src/display.cpp` | OLED (and the same text on serial) |
| `src/net.cpp` | Wi-Fi, NTP clock, upload |

## Known limits

- **HTTPS:** the node encrypts but does not verify the server certificate (`setInsecure()`).
  Fine for the demo; for deployment, load the server's root CA.
- **OLED text is English only:** the small screen font has no Tamil characters. The full Tamil
  advisory is shown on the web app.

**Rule:** never use ADC2 pins (GPIO 0, 2, 4, 12–15, 25–27) for analog reads; they stop working
while Wi-Fi is on. All analog goes through the ADS1115.
