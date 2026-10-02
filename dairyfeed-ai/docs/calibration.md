# Calibration

Calibration values are stored in the ESP32's NVS (flash) and survive a reboot or a re-flash of
the firmware (unless you erase flash). The node refuses to run a test until **pH, moisture and the
temperature probes** are calibrated. Colour is optional: without it, RGB is simply not sent.

Calibration commands are typed in the serial monitor (USB, 115200 baud). Type `help` for the
list, and `status` at any time to see what is calibrated and the live readings.

## Silage pH method

1. Mix about **25 g silage** with about **100 mL distilled water**.
2. Wait about **10 minutes** (the node runs a countdown; press to skip).
3. Dip the probe in the liquid. **Do not push the probe into dry silage.**

## pH probe: two-point calibration (pH 7.0 and pH 4.0 buffers)

Do this before each day of testing, and whenever results look wrong.

**With the button:** hold it for 2 seconds, then follow the screen:
rinse → pH 7.0 buffer → wait ~1 min → press → rinse → pH 4.0 buffer → wait ~1 min → press.

**With serial:** probe in pH 7.0 buffer, wait ~1 min, type `ph7`. Rinse, pH 4.0 buffer, wait, type `ph4`.

The calibration is rejected if the two buffers read almost the same voltage (less than 0.05 V
apart), which means the probe or wiring is faulty.

## Moisture sensor: two points from oven-dried samples

The capacitive sensor gives a raw number, not a moisture %. Its % is only meaningful after
comparing it with the oven-dry method on real silage.

1. Take **two silage samples with clearly different moisture** (for example one fresh, one
   partly air-dried).
2. For each: pack it into a container the same way you will in real tests, insert the sensor to
   the same depth, and type `raw`. Write down the raw value.
3. Weigh about 100 g of each sample (wet weight), dry it in an oven at 105 °C until its weight
   stops changing (or follow your lab's dry-matter method), and weigh it again (dry weight).
4. Moisture % = (wet − dry) ÷ wet × 100.
5. Type `moist <raw1> <%1> <raw2> <%2>`, for example `moist 14000 55 12000 75`.

Two points give a straight line. **This is provisional**: more samples would give a better fit.
Record every pair you measure; Phase 7 can use them.

## Temperature probes: which one is the sample probe

The two DS18B20 probes look the same to the node. Type `probes` and hold **only the sample probe**
in your hand for 30 seconds. The probe that warms up is saved as the sample probe; the other is
ambient.

## Colour sensor (TCS3200)

Readings are only comparable **inside the closed box with the fixed white LEDs**, the lid shut and
the sample at the same distance every time.

1. Put a **black** card in the box, close the lid, type `black`.
2. Put a **white** card in the box, close the lid, type `white`.

The calibration is saved when white is clearly brighter than black on all three channels.
Recalibrate if you change the LEDs, the box or the sensor height.

## Erasing calibration

Type `reset`. All calibration is erased; the test counter is kept.
