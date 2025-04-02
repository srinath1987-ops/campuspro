
# IoT Bus Tracking System Hardware Components

This folder contains the required code for the ESP32-based RFID gate control system for bus entry and exit points.

## Hardware Components Required

1. **ESP32 Development Board**
   - WiFi & Bluetooth capable microcontroller
   - Connects to Supabase to update bus status

2. **RFID-RC522 Reader**
   - Reads RFID tags mounted on buses
   - Connected to ESP32 via SPI interface

3. **Servo Motor MG996R**
   - Controls the gate opening/closing
   - Triggered when valid RFID is detected

4. **LEDs**
   - Green LED: Indicates successful authentication
   - Red LED: Indicates standby mode or errors

5. **Miscellaneous**
   - Breadboard and jumper wires
   - Power supply (5V for servo, 3.3V for ESP32)
   - RFID tags for each bus

## Wiring Diagram

### ESP32 to RFID-RC522 Connections
- RST_PIN: GPIO4
- SS_PIN: GPIO22 (SDA)
- MOSI_PIN: GPIO23
- MISO_PIN: GPIO25
- SCK_PIN: GPIO19

### ESP32 to Servo Connections
- SERVO_PIN: GPIO13

### ESP32 to LED Connections
- GREEN_LED_PIN: GPIO12
- RED_LED_PIN: GPIO14

## Installation Instructions

1. **Hardware Setup**
   - Connect all components according to the wiring diagram
   - Ensure proper power supply to all components

2. **Software Setup**
   - Install the Arduino IDE
   - Add ESP32 board support to Arduino IDE
   - Install the required libraries:
     - WiFi.h
     - HTTPClient.h
     - Arduino_JSON.h
     - SPI.h
     - MFRC522.h
     - ESP32Servo.h

3. **Configuration**
   - Open the ESP32_RFID_Gate_Controller.ino file
   - Update the WiFi credentials (SSID and password)
   - Set the correct GATE_MODE ("entry" or "exit") depending on installation location
   - Upload the code to the ESP32

## Operation

1. When powered on, the system connects to WiFi and initializes the RFID reader and servo
2. The red LED stays on in standby mode
3. When a bus with a valid RFID tag approaches:
   - The RFID reader detects the tag
   - The system validates the tag with Supabase
   - Upon successful validation, the green LED turns on and the gate opens
   - The gate remains open for 5 seconds, then closes
   - The system returns to standby mode (red LED on)
4. If there's an error or invalid tag, the red LED blinks to indicate the issue

## Troubleshooting

- **System not connecting to WiFi**: Check SSID and password in the code
- **RFID not detecting tags**: Ensure proper wiring and check the tag is within range
- **Gate not opening**: Check servo connections and power supply
- **Database updates failing**: Verify Supabase API endpoint and key
