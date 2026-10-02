# Calibration

Calibration values are stored in the ESP32's NVS (`Preferences`) so they survive a reboot.

## Silage pH method

1. Mix about **25 g silage** with about **100 mL distilled water**.
2. Wait about **10 minutes**.
3. Dip the probe in the liquid. **Do not push the probe into dry silage.**

## pH probe: two-point calibration

Use pH **4.0** and pH **7.0** buffer solutions. Exact steps on the device arrive in Phase 3.

## Moisture sensor

The capacitive sensor gives a raw number, not a percentage. It must be calibrated against
oven-dry dry matter of real samples. Procedure arrives in Phase 3.

## Colour sensor (TCS3200)

Readings are only comparable inside the closed box with the fixed white LED. Procedure arrives in Phase 3.
