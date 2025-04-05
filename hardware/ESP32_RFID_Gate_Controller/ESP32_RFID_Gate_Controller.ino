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
 * - RESET_BUTTON_PIN(external button) (reset the wifi hold for 3second to reset the wifi)
 * - INBUILT RESET (used for reseting the device)

 
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ESP32Servo.h>
#include <time.h>
#include <EEPROM.h>
#include <WebServer.h>

// EEPROM settings
#define EEPROM_SIZE 512
#define SSID_ADDR 0
#define PASS_ADDR 50
#define WIFI_CONFIG_DONE 150

// Network credentials (will be stored in EEPROM)
String ssid = "";
String password = "";

// Supabase API endpoints
const char* supabaseUrl = "https://imhfvwavskweneysqrof.supabase.co/functions/v1/http_bus_entry_exit";
const char* supabaseStatusUrl = "https://imhfvwavskweneysqrof.supabase.co/functions/v1/http_bus_status";
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

// Reset button pin
#define RESET_BUTTON_PIN 2

// Web server for WiFi configuration
WebServer server(80);
bool apMode = false;
bool wifiConfigDone = false;

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
void setupAP();
void handleRoot();
void handleSave();
void handleReset();
void soundBuzzer(int pattern);
void loadWiFiCredentials();
void saveWiFiCredentials(String ssid, String password);

void setup() {
  Serial.begin(115200);
  EEPROM.begin(EEPROM_SIZE);
  
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RESET_BUTTON_PIN, INPUT_PULLUP);
  
  // Turn on red LED initially (standby mode)
  digitalWrite(RED_LED_PIN, HIGH);
  digitalWrite(GREEN_LED_PIN, LOW);
  
  // Check if WiFi credentials exist or reset button is pressed
  loadWiFiCredentials();
  
  // Reset WiFi settings if button is pressed during startup
  if (digitalRead(RESET_BUTTON_PIN) == LOW) {
    Serial.println("Reset button pressed, clearing WiFi settings");
    handleReset();
    delay(1000); // Debounce
  }
  
  // If we have saved credentials, try to connect
  if (ssid.length() > 0 && EEPROM.read(WIFI_CONFIG_DONE) == 1) {
    Serial.println("Found saved WiFi credentials");
    wifiConfigDone = true;
    connectToWiFi();
    
    // Signal successful WiFi connection with buzzer
    if (WiFi.status() == WL_CONNECTED) {
      soundBuzzer(1); // 1 = connected pattern
      
      if (syncTimeWithNTP()) {
        Serial.println("NTP time synchronized successfully");
      } else {
        Serial.println("Failed to sync with NTP. Using default time.");
      }
    }
  } else {
    Serial.println("No WiFi credentials found or not configured");
    setupAP();
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
  // Handle web server requests in AP mode
  if (apMode) {
    server.handleClient();
    
    // Blink LED to indicate AP mode
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > 500) {
      digitalWrite(RED_LED_PIN, !digitalRead(RED_LED_PIN));
      lastBlink = millis();
    }
    return;
  }

  // Check if reset button is pressed (hold for 3 seconds to reset)
  if (digitalRead(RESET_BUTTON_PIN) == LOW) {
    Serial.println("Reset button pressed, waiting to confirm...");
    delay(3000); // Wait 3 seconds
    if (digitalRead(RESET_BUTTON_PIN) == LOW) {
      handleReset();
      return;
    }
  }

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
  if (WiFi.status() != WL_CONNECTED && wifiConfigDone) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
    
    if (WiFi.status() == WL_CONNECTED) {
      soundBuzzer(1); // Signal reconnection
      syncTimeWithNTP();
    }
  }
  
  // Look for new RFID cards only if WiFi is connected
  if (WiFi.status() == WL_CONNECTED) {
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
          soundBuzzer(2); // Success pattern
          openGate();
          delay(5000); // Keep gate open for 5 seconds
          closeGate();
          digitalWrite(GREEN_LED_PIN, LOW);
          digitalWrite(RED_LED_PIN, HIGH);
        } else {
          Serial.println("Failed to update bus status");
          blinkLED(RED_LED_PIN, 5, 200);
          soundBuzzer(3); // Error pattern
        }
      } else {
        Serial.println("Invalid RFID tag");
        blinkLED(RED_LED_PIN, 3, 300);
        soundBuzzer(3); // Error pattern
      }
      
      rfid.PICC_HaltA();
      rfid.PCD_StopCrypto1();
      delay(1000); // Delay before next read
    }
  }
}

// Load WiFi credentials from EEPROM
void loadWiFiCredentials() {
  ssid = "";
  password = "";
  
  for (int i = SSID_ADDR; i < SSID_ADDR + 50; i++) {
    char c = EEPROM.read(i);
    if (c == 0) break;
    ssid += c;
  }
  
  for (int i = PASS_ADDR; i < PASS_ADDR + 50; i++) {
    char c = EEPROM.read(i);
    if (c == 0) break;
    password += c;
  }
  
  Serial.println("Loaded SSID: " + ssid);
  Serial.println("Config status: " + String(EEPROM.read(WIFI_CONFIG_DONE)));
}

// Save WiFi credentials to EEPROM
void saveWiFiCredentials(String ssid, String password) {
  // Clear the area first
  for (int i = SSID_ADDR; i < SSID_ADDR + 50; i++) {
    EEPROM.write(i, 0);
  }
  for (int i = PASS_ADDR; i < PASS_ADDR + 50; i++) {
    EEPROM.write(i, 0);
  }
  
  // Write new values
  for (unsigned int i = 0; i < ssid.length(); i++) {
    EEPROM.write(SSID_ADDR + i, ssid[i]);
  }
  
  for (unsigned int i = 0; i < password.length(); i++) {
    EEPROM.write(PASS_ADDR + i, password[i]);
  }
  
  // Mark as configured
  EEPROM.write(WIFI_CONFIG_DONE, 1);
  EEPROM.commit();
  
  Serial.println("Saved WiFi credentials");
}

// Reset WiFi configuration
void handleReset() {
  EEPROM.write(WIFI_CONFIG_DONE, 0);
  EEPROM.commit();
  Serial.println("WiFi configuration reset");
  
  // Visual and audio feedback
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(GREEN_LED_PIN, HIGH);
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    delay(200);
  }
  
  ESP.restart(); // Restart the ESP32
}

// Set up Access Point for WiFi configuration
void setupAP() {
  WiFi.mode(WIFI_AP);
  String apName = "CampusPro_" + String((uint32_t)ESP.getEfuseMac(), HEX);
  WiFi.softAP(apName.c_str(), "12345678");
  
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/reset", handleReset);
  server.begin();
  
  Serial.println("HTTP server started in AP mode");
  Serial.println("Connect to " + apName + " with password 12345678");
  Serial.println("Then visit http://" + IP.toString() + " to configure WiFi");
  
  apMode = true;
}

// Handle root page request
void handleRoot() {
  String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>";
  html += "<style>";
  html += "* {box-sizing: border-box;}";
  html += "body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;line-height:1.6;max-width:600px;margin:0 auto;}";
  html += "h1{color:#0066CC;font-size:24px;margin-bottom:20px}";
  html += ".form-container{background:#f9f9f9;border-radius:8px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}";
  html += "label{display:block;text-align:left;margin:8px 0 4px;font-weight:bold;}";
  html += "input{width:100%;padding:12px;margin:4px 0 16px;box-sizing:border-box;border:1px solid #ddd;border-radius:4px;font-size:16px;}";
  html += "button{background-color:#4CAF50;color:white;padding:14px 20px;margin:8px 0;border:none;border-radius:4px;cursor:pointer;width:100%;font-size:16px;font-weight:bold;}";
  html += "button:hover{background-color:#45a049;}";
  html += "@media screen and (max-width: 480px) {body{padding:10px;}h1{font-size:20px;}}";
  html += "</style>";
  html += "</head><body><h1>Bus Tracker WiFi Setup</h1>";
  html += "<div class='form-container'>";
  html += "<form action='/save' method='POST'>";
  html += "<label for='ssid'>WiFi Name (SSID):</label>";
  html += "<input type='text' id='ssid' name='ssid' placeholder='Enter your WiFi name'>";
  html += "<label for='password'>WiFi Password:</label>";
  html += "<input type='password' id='password' name='password' placeholder='Enter your WiFi password'>";
  html += "<button type='submit'>Save and Connect</button></form>";
  html += "</div>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// Handle saving WiFi credentials
void handleSave() {
  String new_ssid = server.arg("ssid");
  String new_password = server.arg("password");
  
  String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>";
  html += "<style>";
  html += "* {box-sizing: border-box;}";
  html += "body{font-family:Arial,sans-serif;margin:0;padding:20px;text-align:center;line-height:1.6;max-width:600px;margin:0 auto;}";
  html += "h1{color:#0066CC;font-size:24px;margin-bottom:20px}";
  html += ".message-container{background:#f9f9f9;border-radius:8px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}";
  html += ".success{border-left:4px solid #4CAF50;}";
  html += ".error{border-left:4px solid #f44336;}";
  html += "p{margin:8px 0;}";
  html += "a{color:#0066CC;text-decoration:none;display:inline-block;margin-top:15px;font-weight:bold;}";
  html += "a:hover{text-decoration:underline;}";
  html += "@media screen and (max-width: 480px) {body{padding:10px;}h1{font-size:20px;}}";
  html += "</style></head><body>";
  
  if (new_ssid.length() > 0) {
    saveWiFiCredentials(new_ssid, new_password);
    
    html += "<h1>Settings Saved</h1>";
    html += "<div class='message-container success'>";
    html += "<p>Device will now connect to your WiFi network.</p>";
    html += "<p>If connection fails, the device will restart in setup mode.</p>";
    html += "</div>";
    
    server.send(200, "text/html", html);
    delay(3000);
    
    // Restart ESP to apply new settings
    ESP.restart();
  } else {
    html += "<h1>Error</h1>";
    html += "<div class='message-container error'>";
    html += "<p>SSID cannot be empty</p>";
    html += "<a href='/'>Go Back</a>";
    html += "</div>";
    server.send(400, "text/html", html);
  }
}

// Connect to WiFi
void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  Serial.println("SSID: " + ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), password.c_str());
  
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
    // If we can't connect after configured, go back to AP mode
    if (wifiConfigDone) {
      Serial.println("Going back to AP mode for reconfiguration");
      setupAP();
    }
  }
}

// Sound patterns on buzzer
void soundBuzzer(int pattern) {
  switch (pattern) {
    case 1: // WiFi connected pattern
      digitalWrite(BUZZER_PIN, HIGH);
      delay(200);
      digitalWrite(BUZZER_PIN, LOW);
      delay(100);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(200);
      digitalWrite(BUZZER_PIN, LOW);
      break;
    case 2: // Success pattern
      digitalWrite(BUZZER_PIN, HIGH);
      delay(50);
      digitalWrite(BUZZER_PIN, LOW);
      break;
    case 3: // Error pattern
      for (int i = 0; i < 3; i++) {
        digitalWrite(BUZZER_PIN, HIGH);
        delay(100);
        digitalWrite(BUZZER_PIN, LOW);
        delay(100);
      }
      break;
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