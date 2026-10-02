// Runs on the PC: pio test -e native
#include <string.h>
#include <unity.h>

#include "logic.h"

void setUp() {}
void tearDown() {}

void test_ph_two_point_line() {
    // Typical PH-4502C after a 2/3 divider: ~1.67 V at pH 7, ~2.03 V at pH 4 (acid = higher voltage).
    float v7 = 1.67f, v4 = 2.03f;
    TEST_ASSERT_FLOAT_WITHIN(0.001f, 7.0f, phFromVoltage(v7, v7, v4));
    TEST_ASSERT_FLOAT_WITHIN(0.001f, 4.0f, phFromVoltage(v4, v7, v4));
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 5.5f, phFromVoltage(1.85f, v7, v4));  // halfway
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 3.7f, phFromVoltage(2.066f, v7, v4)); // beyond pH 4: extrapolates
}

void test_ph_calibration_rejects_flat_probe() {
    TEST_ASSERT_TRUE(phCalibrationValid(1.67f, 2.03f));
    TEST_ASSERT_TRUE(phCalibrationValid(2.03f, 1.67f));  // either direction of probe
    TEST_ASSERT_FALSE(phCalibrationValid(1.67f, 1.70f));
}

void test_moisture_two_point_and_clamp() {
    // Capacitive sensors read LOWER when wetter.
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 55.0f, moisturePctFromRaw(14000, 14000, 55.0f, 12000, 75.0f));
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 65.0f, moisturePctFromRaw(13000, 14000, 55.0f, 12000, 75.0f));
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 0.0f, moisturePctFromRaw(30000, 14000, 55.0f, 12000, 75.0f));
    TEST_ASSERT_FLOAT_WITHIN(0.01f, 100.0f, moisturePctFromRaw(0, 14000, 55.0f, 12000, 75.0f));
    TEST_ASSERT_FALSE(moistureCalibrationValid(14000, 55.0f, 14000, 75.0f));
    TEST_ASSERT_FALSE(moistureCalibrationValid(14000, 55.0f, 12000, 55.0f));
}

void test_colour_scaling() {
    TEST_ASSERT_EQUAL_INT(0, colourTo255(1000, 1000, 11000));
    TEST_ASSERT_EQUAL_INT(255, colourTo255(11000, 1000, 11000));
    TEST_ASSERT_EQUAL_INT(128, colourTo255(6000, 1000, 11000));
    TEST_ASSERT_EQUAL_INT(0, colourTo255(500, 1000, 11000));      // darker than black card
    TEST_ASSERT_EQUAL_INT(255, colourTo255(20000, 1000, 11000));  // brighter than white card
    TEST_ASSERT_EQUAL_INT(0, colourTo255(5000, 1000, 1000));      // not calibrated
}

void test_sample_id_formats() {
    char id[48];
    formatSampleId(id, sizeof(id), "DF01", true, 2026, 10, 2, 10, 30, 15, 0, 7);
    TEST_ASSERT_EQUAL_STRING("DF01-20261002T103015-0007", id);
    formatSampleId(id, sizeof(id), "DF01", false, 0, 0, 0, 0, 0, 0, 0x1a2b3c4d, 7);
    TEST_ASSERT_EQUAL_STRING("DF01-R1a2b3c4d-0007", id);
    formatSampleId(id, sizeof(id), "DF01", true, 2026, 10, 2, 10, 30, 15, 0, 12345);
    TEST_ASSERT_EQUAL_STRING("DF01-20261002T103015-2345", id);  // counter wraps at 10000
}

int main() {
    UNITY_BEGIN();
    RUN_TEST(test_ph_two_point_line);
    RUN_TEST(test_ph_calibration_rejects_flat_probe);
    RUN_TEST(test_moisture_two_point_and_clamp);
    RUN_TEST(test_colour_scaling);
    RUN_TEST(test_sample_id_formats);
    return UNITY_END();
}
