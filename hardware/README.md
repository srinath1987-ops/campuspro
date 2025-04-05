
# IoT Bus Tracking System

## Overview
This project implements an automated bus tracking system using ESP32, RFID technology, and Supabase backend. The system authenticates buses via RFID tags, controls a physical entry/exit gate, and maintains real-time records of bus locations.

## Hardware Requirements
- ESP32 Microcontroller
- RC522 RFID Reader
- MG996R Servo Motor (for gate control)
- Green and Red LEDs
- Buzzer
- Pushbutton (for WiFi reset)
- Breadboard and connection wires

## Pin Configuration
| Component | Pin |
|-----------|-----|
| RFID SS   | 22  |
| RFID RST  | 4   |
| RFID SCK  | 19  |
| RFID MOSI | 23  |
| RFID MISO | 25  |
| Green LED | 12  |
| Red LED   | 14  |
| Servo     | 13  |
| Buzzer    | 15  |
| Reset Button | 2 |

## Software Requirements
   - Arduino IDE
   - Required Libraries:
   - WiFi.h
   - HTTPClient.h
   - ArduinoJson.h
   - SPI.h
   - MFRC522.h
   - ESP32Servo.h
   - WebServer.h

## Installation & Setup

### Hardware Assembly
1. Connect the RFID reader to the ESP32 using the SPI pins
2. Connect the servo motor to pin 13
3. Connect LEDs to pins 12 (green) and 14 (red)
4. Connect the buzzer to pin 15
5. Connect the reset button to pin 2 with a pull-up resistor

### Software Setup
1. Install the Arduino IDE and ESP32 board support
2. Install all required libraries via the Arduino Library Manager
3. Clone this repository or download the code
4. Open the `.ino` file in Arduino IDE
5. Upload the code to your ESP32

## Initial Configuration
1. Power on the device - it will create a WiFi access point named "CampusPro_XXXX"
2. Connect to this network using password "12345678"
3. Open a browser and navigate to http://192.168.4.1
4. Enter your WiFi credentials and save
5. The device will restart and connect to your WiFi network

## Operation
- The system starts with the gate closed and red LED on
- When an authorized RFID tag is detected:
  - If it's an entry event, the gate opens
  - If it's an exit event, the gate opens
  - Status is updated in the Supabase database
  - The green LED turns on while the gate is open
- After 5 seconds, the gate closes automatically
- The red LED returns to on state (standby)

## Resetting WiFi Settings
- Press and hold the reset button for 3 seconds
- The device will restart in AP mode for reconfiguration

## Indicators
- **Red LED**: System standby or error
- **Green LED**: Valid RFID detected, gate open
- **Blinking Red LED**: In AP configuration mode
- **Buzzer Patterns**:
  - Single double-beep: WiFi connected
  - Single short beep: Successful RFID scan
  - Triple beep: Error

## Supabase Integration
The system uses Supabase for data storage and management:
- Each bus entry/exit is recorded with timestamp
- Bus status (in/out of campus) is maintained
- Data can be accessed via Supabase dashboard or API

## Troubleshooting
- If the device cannot connect to WiFi, it will revert to AP mode
- Check the serial monitor (115200 baud) for diagnostic information
- Blinking red LED indicates configuration mode
- Triple buzzer beep indicates an error condition

## Extending the System
- Modify the `validateRFID()` function to implement custom authentication rules
- Add more sensors for enhanced security
- Implement a display for status information
- Expand the Supabase functions for additional analytics

## Troubleshooting

- **System not connecting to WiFi**: Check SSID and password in the code
- **RFID not detecting tags**: Ensure proper wiring and check the tag is within range
- **Gate not opening**: Check servo connections and power supply
- **Database updates failing**: Verify Supabase API endpoint and key
