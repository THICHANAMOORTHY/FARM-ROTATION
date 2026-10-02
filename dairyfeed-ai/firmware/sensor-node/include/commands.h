// Calibration and diagnostics over USB serial (115200 baud). Type "help" in the serial monitor.
#pragma once

// Call often from loop(). Reads a command line when one is complete; never blocks.
void handleSerialCommands();

// Shared with the button pH wizard: measure and store one buffer point.
// isPh7 = true for the pH 7.0 buffer, false for pH 4.0. Returns the voltage measured.
float recordPhPoint(bool isPh7);

// After both pH points are recorded: checks them, saves if valid. Returns cal.phOk.
bool finishPhCalibration();
