
/**
 * CampusPro - ESP32 RFID Gate Controller
 * 
 * This code handles RFID scanning for buses entering/exiting campus
 * and communicates with the Supabase backend.
 */

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Pin definitions
#define SS_PIN 22        // SDA
#define RST_PIN 4        // Reset
#define SCK_PIN 19       // SPI Clock
#define MOSI_PIN 23      // SPI MOSI
#define MISO_PIN 25      // SPI MISO
#define SERVO_PIN 13     // Servo motor pin
#define GREEN_LED_PIN 12 // Green LED
#define RED_LED_PIN 14   // Red LED

// Wi-Fi and API settings
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Supabase settings
const char* supabaseUrl = "https://imhfvwavskweneysqrof.supabase.co";
const char* supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGZ2d2F2c2t3ZW5leXNxcm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1ODU4NDUsImV4cCI6MjA1OTE2MTg0NX0.x0zkA41Bqk0I6lDp5Uo3EYUSyil2KNPOt9iqnuKW7sI";
const char* apiEndpoint = "/rest/v1/rpc/update_bus_status";

// Gate settings
const int GATE_OPEN_ANGLE = 90;
const int GATE_CLOSED_ANGLE = 0;
const int GATE_OPEN_TIME = 5000; // Time gate stays open (ms)

// RFID instance
MFRC522 rfid(SS_PIN, RST_PIN);

// Servo instance
Servo gateServo;

// Flag to track gate status
bool isGateOpen = false;
unsigned long gateOpenTime = 0;

// Gate location (entry or exit)
// Change this based on where this ESP32 is installed
const char* GATE_LOCATION = "entry"; // or "exit"

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Initialize SPI bus and RFID reader
  SPI.begin(SCK_PIN, MISO_PIN, MOSI_PIN, SS_PIN);
  rfid.PCD_Init();
  
  // Initialize servo
  gateServo.attach(SERVO_PIN);
  gateServo.write(GATE_CLOSED_ANGLE);
  
  // Initialize LEDs
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  
  // Red LED on during setup
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, LOW);
  
  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.print("Connected to WiFi with IP: ");
  Serial.println(WiFi.localIP());
  
  // Indicate ready
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
  delay(1000);
  digitalWrite(GREEN_LED_PIN, LOW);
  
  Serial.println("RFID Gate Controller Ready");
  Serial.print("Gate Location: ");
  Serial.println(GATE_LOCATION);
  
  // Print RFID reader details
  rfid.PCD_DumpVersionToSerial();
}

void loop() {
  // Check if gate needs to be closed after timeout
  if (isGateOpen && millis() - gateOpenTime > GATE_OPEN_TIME) {
    closeGate();
  }
  
  // Check for WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    WiFi.reconnect();
    delay(5000); // Wait for reconnection
    return;
  }
  
  // Default LED state - Red when no card is being read
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, LOW);
  
  // Check if a new card is present
  if (!rfid.PICC_IsNewCardPresent()) {
    return;
  }
  
  // Select one of the cards
  if (!rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Read RFID tag
  String rfidTag = getRfidTag();
  Serial.print("RFID Tag detected: ");
  Serial.println(rfidTag);
  
  // Green LED on when reading card
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
  
  // Send data to Supabase
  if (sendToSupabase(rfidTag)) {
    // Open gate on successful API call
    openGate();
  } else {
    // Flash red LED on error
    for (int i = 0; i < 5; i++) {
      digitalWrite(RED_LED_PIN, HIGH);
      delay(100);
      digitalWrite(RED_LED_PIN, LOW);
      delay(100);
    }
  }
  
  // Reset RFID for next read
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  
  delay(500);
}

String getRfidTag() {
  String tag = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    tag += (rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    tag += String(rfid.uid.uidByte[i], HEX);
  }
  tag.toUpperCase();
  return tag;
}

bool sendToSupabase(const String &rfidTag) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Setup HTTP request
    String url = String(supabaseUrl) + apiEndpoint;
    http.begin(url);
    
    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", String("Bearer ") + supabaseKey);
    
    // Prepare JSON payload
    DynamicJsonDocument doc(200);
    doc["rfid_id"] = rfidTag;
    doc["event_type"] = GATE_LOCATION; // "entry" or "exit"
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    // Send POST request
    int httpResponseCode = http.POST(requestBody);
    
    // Process response
    if (httpResponseCode == 200 || httpResponseCode == 201) {
      String response = http.getString();
      Serial.println("API Response: " + response);
      
      // Parse response
      DynamicJsonDocument responseDoc(512);
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (!error && responseDoc["success"]) {
        Serial.println("Bus status updated successfully!");
        return true;
      } else {
        Serial.println("API returned error: " + response);
      }
    } else {
      Serial.print("HTTP Error code: ");
      Serial.println(httpResponseCode);
      Serial.println(http.getString());
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
  
  return false;
}

void openGate() {
  Serial.println("Opening gate");
  gateServo.write(GATE_OPEN_ANGLE);
  isGateOpen = true;
  gateOpenTime = millis();
  
  // Green LED stays on while gate is open
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, HIGH);
}

void closeGate() {
  Serial.println("Closing gate");
  gateServo.write(GATE_CLOSED_ANGLE);
  isGateOpen = false;
  
  // Reset LED state
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH);
}
