# Wiring — sensor node

Pin numbers live in `firmware/sensor-node/include/pins.h`. Change this file in the same commit
as any wiring change.

```
              ┌─────────── ESP32 DevKit ───────────┐
              │  3V3  GND  VIN(5V)                 │
              │  GPIO21 SDA ──┬──────────┐         │
              │  GPIO22 SCL ──┼──┬───────┼──┐      │
              │               │  │       │  │      │
              │           ADS1115     OLED (0x3C/0x3D)
              │           A0 ← pH (through divider)
              │           A1 ← moisture
              │  GPIO4  ── DS18B20 ×2 (one 4.7k pull-up)
              │  GPIO25,26,32,33,34,14 ── TCS3200
              │  GPIO27 ── button ── GND
              │  GPIO17 TX ──► ESP32-CAM RX
              │  GPIO16 RX ◄── ESP32-CAM TX
              └────────────────────────────────────┘
```

## Connections

| Part | Part pin | Connect to |
|---|---|---|
| **ADS1115** | VDD | ESP32 **3V3** (not 5 V: it shares the I²C wires with the ESP32) |
| | GND | GND |
| | SDA / SCL | GPIO21 / GPIO22 |
| | ADDR | GND (address 0x48) |
| | A0 | pH divider midpoint (see below) |
| | A1 | Moisture sensor AOUT |
| **OLED SSD1306** | VCC / GND | 3V3 / GND |
| | SDA / SCL | GPIO21 / GPIO22 (same wires as the ADS1115) |
| **pH module (PH-4502C)** | V+ | **5 V** (ESP32 VIN) |
| | G | GND |
| | Po | 10 kΩ resistor → A0 node (see divider) |
| | Do, To | Not connected |
| **Moisture sensor v1.2** | VCC | **3V3** (keeps its output below 3.3 V) |
| | GND | GND |
| | AOUT | ADS1115 A1 |
| **DS18B20 ×2** | Red (VDD) | 3V3 |
| | Black (GND) | GND |
| | Yellow (data) | GPIO4 — both probes on the same wire |
| | 4.7 kΩ | Between GPIO4 and 3V3 (**one** resistor for both probes) |
| **TCS3200** | VCC / GND | 3V3 / GND |
| | S0 / S1 | GPIO25 / GPIO26 |
| | S2 / S3 | GPIO32 / GPIO33 |
| | OUT | GPIO34 |
| | LED (OE/LED pin on most modules) | GPIO14. If your module has no LED pin, its LEDs are always on: that's fine. |
| **Push button** | One leg | GPIO27 |
| | Other leg | GND (the internal pull-up is used, no resistor needed) |
| **ESP32-CAM** | RX | GPIO17 (exact camera pin chosen in Phase 5) |
| | TX | GPIO16 |
| | GND | GND — **the two boards must share ground** |

## pH voltage divider (required)

The pH module runs on 5 V and its output can go up to nearly 5 V. The ADS1115 runs on 3.3 V and
must never see more than about 3.6 V on an input. Two resistors scale the pH output to 2/3:

```
pH module Po ──[ 10 kΩ ]──┬── ADS1115 A0
                          │
                       [ 20 kΩ ]
                          │
                         GND
```

The firmware doesn't need to know the ratio: the two-point calibration (pH 7.0 and 4.0 buffers)
is done on the voltage the ADS1115 sees, so the ratio cancels out.

## Pins avoided and why

- **No analog reads on the ESP32 itself.** ADC2 pins (GPIO 0, 2, 4, 12–15, 25–27) stop working
  for analog while Wi-Fi is on. All analog goes through the ADS1115. GPIO4, 14, 25, 26 and 27 are
  ADC2 pins but are used here only as **digital** pins, which is fine.
- **Boot strapping pins** (GPIO 0, 2, 5, 12, 15) are left free so the board always boots.
- **GPIO34** is input-only, which suits the TCS3200 OUT signal.
- **GPIO1/3** are the USB serial, used for calibration commands.

## Bench test (do these in order)

Open the serial monitor at 115200 baud (`pio device monitor`).

1. **Power and I²C.** Reset the board. Expected on serial: `OLED found at 0x3C` (or 0x3D),
   `DS18B20 probes found: 2`, and no `ADS1115 not found` line. The OLED shows the idle screen.
   - "ADS1115 not found": check SDA/SCL are not swapped, VDD is 3V3, ADDR is to GND.
2. **Divider, with a multimeter, before connecting A0.** Probe in pH 7.0 buffer: Po ≈ 2.5 V and
   the divider midpoint ≈ 1.7 V. In pH 4.0 buffer: Po ≈ 3.0 V and midpoint ≈ 2.0 V. The midpoint
   must stay **below 3.3 V**. If Po at pH 7 is far from 2.5 V, turn the module's offset trimmer
   (the one near the BNC) until it is close.
3. **pH reading.** Type `status`. Move the probe between the two buffers and type `status` again:
   the pH voltage must change by at least 0.1 V.
4. **Moisture.** Type `raw` with the sensor in air, then in a glass of water. The raw value must be
   clearly **lower** in water.
5. **Temperature.** `status` shows two probes near room temperature. Type `probes` and hold only
   the sample probe in your hand for 30 s: it is saved as the sample probe.
6. **Colour.** In the closed box, type `black` with a black card, then `white` with a white card.
   Then `status` with a red object: R should be clearly the highest of R, G, B.
7. **Button.** Short press: "Step 1: prepare" screen. Hold 2 s: "pH calibration" wizard.
8. **Camera link (optional until Phase 5).** Connect a USB-TTL adapter's RX to GPIO17 and GND to
   GND. During a test it should print `SNAP DF01-...`.
9. **Full test with the backend.** On your PC run
   `uvicorn app.main:app --host 0.0.0.0 --port 8000` in `backend/`, and set
   `BACKEND_URL` in `secrets.h` to `http://<your PC's IP>:8000`. Run a test: the OLED shows the
   quality, score, spoilage and mould risk, and the sample appears at
   `http://localhost:8000/api/silage/history`.
