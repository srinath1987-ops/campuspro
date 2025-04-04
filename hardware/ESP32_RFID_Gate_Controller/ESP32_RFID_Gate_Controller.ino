/*
 * IoT Bus Tracking System using ESP32, RFID and Supabase
 * 
 * Hardware Components:
 * - ESP32 Microcontroller
 * - RC522 RFID Reader
 * - MG996R Servo Motor for Gate
 * - LEDs (Green and Red)
 * - BUZZERs (Inicator)
 
 
 * IoT Bus Tracking System using ESP32, RFID, and Supabase
 * 
 * Hardware Components:
 * - ESP32 Microcontroller
 * - RC522 RFID Reader
 * - MG996R Servo Motor for Gate
 * - LEDs (Green and Red)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <time.h>

// Network credentials
const char* ssid = "adadro";
const char* password = "rose@2012";

// Supabase API endpoints
const char* supabaseUrl = "https://imhfvwavskweneysqrof.supabase.co/functions/v1/http_bus_entry_exit";
const char* supabaseStatusUrl = "https://imhfvwavskweneysqrof.supabase.co/functions/v1/http_bus_status"; // New endpoint for status
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGZ2d2F2c2t3ZW5leXNxcm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODU4NDUsImV4cCI6MjA1OTE2MTg0NX0.x0zkA41Bqk0I6lDp5Uo3EYUSyil2KNPOt9iqnuKW7sI";

// NTP settings
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800; // UTC+5:30 for IST
const int daylightOffset_sec = 0; // No daylight saving

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

// Buzzer pin 
#define BUZZER_PIN 15

// Initialize RFID and Servo
MFRC522 rfid(SS_PIN, RST_PIN);
Servo gateServo;

// Function declarations
void connectToWiFi();
bool validateRFID(String rfidTag);
void openGate();
void closeGate();
bool updateBusStatus(String rfidTag, String eventType);
bool getBusStatus(String rfidTag, bool& inCampus);
void blinkLED(int pin, int times, int delayTime);
bool syncTimeWithNTP();

void setup() {
  Serial.begin(115200);
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Turn on red LED initially (standby mode)
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, LOW);
  
  // Connect to WiFi and sync time
  connectToWiFi();
  if (syncTimeWithNTP()) {
    Serial.println("NTP time synchronized successfully");
  } else {
    Serial.println("Failed to sync with NTP. Using default time.");
  }
  
  // Initialize SPI bus and RFID
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  rfid.PCD_Init();
  Serial.println("RFID Reader initialized");
  
  // Initialize Servo
  gateServo.attach(SERVO_PIN);
  closeGate(); // Ensure gate is closed on startup
  
  Serial.println("Setup complete. Ready to scan RFID tags.");
}

void loop() {
  // Periodic NTP sync (every hour)
  static unsigned long lastSyncTime = 0;
  const unsigned long syncInterval = 3600000; // 1 hour in milliseconds
  if (millis() - lastSyncTime > syncInterval) {
    if (syncTimeWithNTP()) {
      Serial.println("Periodic NTP sync successful");
    }
    lastSyncTime = millis();
  }

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
    syncTimeWithNTP();
  }
  
  // Look for new RFID cards
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String rfidTag = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      rfidTag += (rfid.uid.uidByte[i] < 0x10 ? "0" : "") + String(rfid.uid.uidByte[i], HEX);
    }
    rfidTag.toUpperCase();
    
    Serial.println("RFID Tag detected: " + rfidTag);
    
    // Determine event type based on current status
    bool inCampus = false;
    String currentEventType;
    if (getBusStatus(rfidTag, inCampus)) {
      currentEventType = inCampus ? "exit" : "entry";
      Serial.println("Gate Mode: " + currentEventType);
    } else {
      Serial.println("Failed to fetch bus status, assuming entry");
      currentEventType = "entry"; // Fallback
    }
    
    // Process the RFID tag
    if (validateRFID(rfidTag)) {
      if (updateBusStatus(rfidTag, currentEventType)) {
        digitalWrite(GREEN_LED_PIN, HIGH);
        digitalWrite(RED_LED_PIN, LOW);
        digitalWrite(BUZZER_PIN,HIGH);
        delay(50);
        digitalWrite(BUZZER_PIN,LOW);
        openGate();
        delay(5000); // Keep gate open for 5 seconds
        closeGate();
        digitalWrite(GREEN_LED_PIN, LOW);
        digitalWrite(RED_LED_PIN, HIGH);
      } else {
        Serial.println("Failed to update bus status");
        blinkLED(RED_LED_PIN, 5, 200);
      }
    } else {
      Serial.println("Invalid RFID tag");
      blinkLED(RED_LED_PIN, 3, 300);
    }
    
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    delay(1000); // Delay before next read
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
    Serial.println("IP address: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nFailed to connect to WiFi. Check credentials or router.");
  }
}

// Sync time with NTP
bool syncTimeWithNTP() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot sync time: WiFi not connected");
    return false;
  }
  
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  Serial.println("Waiting for NTP time sync...");
  time_t now = 0;
  int attempts = 0;
  const int maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    time(&now);
    if (now > (gmtOffset_sec + 1609459200)) { // Check if time is after 2021-01-01
      struct tm* timeinfo = localtime(&now);
      char timeStr[25];
      strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", timeinfo);
      Serial.println("Current time: " + String(timeStr));
      return true;
    }
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println("\nFailed to sync time with NTP");
  return false;
}

// Validate RFID (placeholder, enhance as needed)
bool validateRFID(String rfidTag) {
  return true; // Accept all tags for now
}

// Open the gate
void openGate() {
  Serial.println("Opening gate");
  gateServo.write(90);
}

// Close the gate
void closeGate() {
  Serial.println("Closing gate");
  gateServo.write(0);
}

// Fetch current bus status from Supabase
bool getBusStatus(String rfidTag, bool& inCampus) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(supabaseStatusUrl) + "?rfid_id=" + rfidTag;
    http.begin(url);
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));

    int httpResponseCode = http.GET();
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Status Response: " + response);
      
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, response);
      if (!error && doc.containsKey("in_campus")) {
        inCampus = doc["in_campus"].as<bool>();
        http.end();
        return true;
      } else {
        Serial.println("JSON parsing failed or no in_campus field");
      }
    } else {
      Serial.println("Error on status request: " + String(httpResponseCode));
    }
    http.end();
  }
  return false;
}

// Update bus status in Supabase
bool updateBusStatus(String rfidTag, String eventType) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabaseUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", "Bearer " + String(supabaseKey));

    // Get current local time in ISO 8601 format
    time_t now;
    time(&now);
    struct tm* timeinfo = localtime(&now);
    char timeStr[30];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%dT%H:%M:%S", timeinfo);
    
    String jsonPayload = "{\"rfid_id\":\"" + rfidTag + "\",\"event_type\":\"" + eventType + "\",\"timestamp\":\"" + String(timeStr) + "\"}";
    Serial.println("Sending JSON: " + jsonPayload);
    
    int httpResponseCode = http.POST(jsonPayload);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
      
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, response);
      if (!error && doc.containsKey("success") && doc["success"].as<bool>()) {
        Serial.println("Bus status updated successfully");
        http.end();
        return true;
      } else {
        Serial.println("API returned error");
        serializeJson(doc, Serial);
        Serial.println();
      }
    } else {
      Serial.println("Error on HTTP request: " + String(httpResponseCode));
    }
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
  return false;
}

// Blink LED
void blinkLED(int pin, int times, int delayTime) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(delayTime);
    digitalWrite(pin, LOW);
    delay(delayTime);
  }
  if (pin == RED_LED_PIN) {
    digitalWrite(RED_LED_PIN, HIGH);
  }
}
