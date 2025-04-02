
/*
 * IoT Bus Tracking System using ESP32, RFID and Supabase
 * 
 * Hardware Components:
 * - ESP32 Microcontroller
 * - RC522 RFID Reader
 * - MG996R Servo Motor for Gate
 * - LEDs (Green and Red)
 * 
 * Functionality:
 * - Reads RFID tags from buses
 * - Controls gate entry/exit based on RFID validation
 * - Updates campus entry/exit status in Supabase
 * - Provides visual feedback via LEDs
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>

// Network credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Supabase API endpoint - replace with your endpoint
const char* supabaseUrl = "https://imhfvwavskweneysqrof.supabase.co/rest/v1/rpc/http_bus_entry_exit";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGZ2d2F2c2t3ZW5leXNxcm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODU4NDUsImV4cCI6MjA1OTE2MTg0NX0.x0zkA41Bqk0I6lDp5Uo3EYUSyil2KNPOt9iqnuKW7sI";

// RFID reader pins
#define SS_PIN 22
#define RST_PIN 4
#define SCK_PIN 19
#define MOSI_PIN 23
#define MISO_PIN 25

// LED pins
#define GREEN_LED_PIN 12
#define RED_LED_PIN 14

// Servo pin
#define SERVO_PIN 13

// Gate mode (entry or exit)
// Change this depending on which gate this ESP32 is installed at
#define GATE_MODE "entry"  // Options: "entry" or "exit"

// Initialize RFID and Servo
MFRC522 rfid(SS_PIN, RST_PIN);
Servo gateServo;

// Function declarations
void connectToWiFi();
bool validateRFID(String rfidTag);
void openGate();
void closeGate();
bool updateBusStatus(String rfidTag, String eventType);
void blinkLED(int pin, int times, int delayTime);

void setup() {
  // Serial and pins setup
  Serial.begin(115200);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  
  // Turn on red LED initially (standby mode)
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, LOW);
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize SPI bus
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  
  // Initialize RFID
  rfid.PCD_Init();
  Serial.println("RFID Reader initialized");
  
  // Initialize Servo
  gateServo.attach(SERVO_PIN);
  closeGate(); // Ensure gate is closed on startup
  
  Serial.println("Setup complete. Ready to scan RFID tags.");
  Serial.println("Gate Mode: " + String(GATE_MODE));
}

void loop() {
  // Check if WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }
  
  // Look for new RFID cards
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    // Read RFID tag
    String rfidTag = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      rfidTag += (rfid.uid.uidByte[i] < 0x10 ? "0" : "") + String(rfid.uid.uidByte[i], HEX);
    }
    rfidTag.toUpperCase();
    
    Serial.println("RFID Tag detected: " + rfidTag);
    
    // Process the RFID tag
    if (validateRFID(rfidTag)) {
      // Valid RFID, update status in Supabase
      if (updateBusStatus(rfidTag, GATE_MODE)) {
        // Success, open gate
        digitalWrite(GREEN_LED_PIN, HIGH);
        digitalWrite(RED_LED_PIN, LOW);
        
        openGate();
        delay(5000); // Keep gate open for 5 seconds
        closeGate();
        
        // Return to standby
        digitalWrite(GREEN_LED_PIN, LOW);
        digitalWrite(RED_LED_PIN, HIGH);
      } else {
        // API call failed
        Serial.println("Failed to update bus status");
        blinkLED(RED_LED_PIN, 5, 200); // Blink red LED to indicate error
      }
    } else {
      // Invalid RFID
      Serial.println("Invalid RFID tag");
      blinkLED(RED_LED_PIN, 3, 300); // Blink red LED to indicate invalid tag
    }
    
    // Halt PICC and stop encryption
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    
    delay(1000); // Short delay before next read
  }
}

// Connect to WiFi
void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi. Check credentials or router.");
  }
}

// Validate RFID against known tags (can be enhanced to check against a database)
bool validateRFID(String rfidTag) {
  // For now, accept all RFID tags and let the database function validate
  // You could add local validation logic here if needed
  return true;
}

// Open the gate
void openGate() {
  Serial.println("Opening gate");
  gateServo.write(90); // Set servo to 90 degrees to open gate
}

// Close the gate
void closeGate() {
  Serial.println("Closing gate");
  gateServo.write(0); // Set servo to 0 degrees to close gate
}

// Update bus status in Supabase
bool updateBusStatus(String rfidTag, String eventType) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Set up the HTTP client
    http.begin(supabaseUrl);
    
    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));
    
    // Create JSON payload
    String jsonPayload = "{\"rfid_id\":\"" + rfidTag + "\",\"event_type\":\"" + eventType + "\"}";
    Serial.println("Sending JSON: " + jsonPayload);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
      
      // Parse the JSON response
      JSONVar responseObj = JSON.parse(response);
      
      if (JSON.typeof(responseObj) == "undefined") {
        Serial.println("JSON parsing failed");
        http.end();
        return false;
      }
      
      // Check if operation was successful
      if (responseObj.hasOwnProperty("success") && responseObj["success"]) {
        Serial.println("Bus status updated successfully");
        http.end();
        return true;
      } else {
        Serial.println("API returned error: " + JSON.stringify(responseObj));
        http.end();
        return false;
      }
    } else {
      Serial.println("Error on HTTP request: " + String(httpResponseCode));
      http.end();
      return false;
    }
  } else {
    Serial.println("WiFi not connected");
    return false;
  }
}

// Blink LED
void blinkLED(int pin, int times, int delayTime) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(delayTime);
    digitalWrite(pin, LOW);
    delay(delayTime);
  }
  
  // Return to original state
  if (pin == RED_LED_PIN) {
    digitalWrite(RED_LED_PIN, HIGH);
  }
}
