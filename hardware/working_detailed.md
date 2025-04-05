Below is a detailed, technical explanation of each function in your provided code for the IoT Bus Tracking System using ESP32, RFID, and Supabase. I'll break down each function line-by-line, explaining its purpose, technical details, and how it interacts with the hardware and software components.

---

### 1. `loadWiFiCredentials()`
**Purpose:** Loads WiFi credentials (SSID and password) stored in the EEPROM memory of the ESP32.

**Technical Explanation:**
- **Line:** `ssid = ""; password = "";`
  - Initializes the global `ssid` and `password` strings as empty to ensure no residual data remains before loading.
- **Line:** `for (int i = SSID_ADDR; i < SSID_ADDR + 50; i++) { char c = EEPROM.read(i); if (c == 0) break; ssid += c; }`
  - Iterates over EEPROM addresses starting at `SSID_ADDR` (0) up to 50 bytes (defined storage size for SSID).
  - `EEPROM.read(i)` retrieves a single byte (character) from the specified address.
  - If the character is `0` (null terminator), the loop breaks, assuming the end of the string.
  - Otherwise, appends the character to the `ssid` string.
- **Line:** `for (int i = PASS_ADDR; i < PASS_ADDR + 50; i++) { char c = EEPROM.read(i); if (c == 0) break; password += c; }`
  - Similar to the SSID loop but starts at `PASS_ADDR` (50) and reads up to 50 bytes for the password.
- **Line:** `Serial.println("Loaded SSID: " + ssid);`
  - Prints the loaded SSID to the serial monitor for debugging.
- **Line:** `Serial.println("Config status: " + String(EEPROM.read(WIFI_CONFIG_DONE)));`
  - Reads the byte at `WIFI_CONFIG_DONE` (150) to check if WiFi configuration is marked as complete (1 = done, 0 = not done) and prints it.

**Key Notes:**
- Uses EEPROM to persist WiFi credentials across reboots.
- Assumes strings are null-terminated in EEPROM.

---

### 2. `saveWiFiCredentials(String ssid, String password)`
**Purpose:** Saves WiFi credentials (SSID and password) to EEPROM.

**Technical Explanation:**
- **Line:** `for (int i = SSID_ADDR; i < SSID_ADDR + 50; i++) { EEPROM.write(i, 0); }`
  - Clears the SSID storage area (0 to 49) by writing `0` to each byte, ensuring no old data remains.
- **Line:** `for (int i = PASS_ADDR; i < PASS_ADDR + 50; i++) { EEPROM.write(i, 0); }`
  - Clears the password storage area (50 to 99) similarly.
- **Line:** `for (unsigned int i = 0; i < ssid.length(); i++) { EEPROM.write(SSID_ADDR + i, ssid[i]); }`
  - Writes each character of the `ssid` string to consecutive EEPROM addresses starting at `SSID_ADDR`.
  - `ssid[i]` accesses individual characters; no explicit null terminator is added (assumes string length is sufficient).
- **Line:** `for (unsigned int i = 0; i < password.length(); i++) { EEPROM.write(PASS_ADDR + i, password[i]); }`
  - Writes each character of the `password` string starting at `PASS_ADDR`.
- **Line:** `EEPROM.write(WIFI_CONFIG_DONE, 1);`
  - Writes `1` to `WIFI_CONFIG_DONE` (150) to mark WiFi configuration as complete.
- **Line:** `EEPROM.commit();`
  - Commits the changes to EEPROM, ensuring they are physically written to non-volatile memory (required for ESP32).
- **Line:** `Serial.println("Saved WiFi credentials");`
  - Logs the save operation for debugging.

**Key Notes:**
- Overwrites previous data to avoid corruption.
- Limited to 50 characters each for SSID and password due to EEPROM allocation.

---

### 3. `handleReset()`
**Purpose:** Resets WiFi configuration by clearing the configuration flag and restarting the ESP32.

**Technical Explanation:**
- **Line:** `EEPROM.write(WIFI_CONFIG_DONE, 0);`
  - Sets the `WIFI_CONFIG_DONE` flag to `0`, indicating no valid WiFi configuration.
- **Line:** `EEPROM.commit();`
  - Saves the change to EEPROM.
- **Line:** `Serial.println("WiFi configuration reset");`
  - Logs the reset action.
- **Line:** `for (int i = 0; i < 3; i++) { ... }`
  - Loops 3 times to provide visual and audio feedback:
    - `digitalWrite(RED_LED_PIN, HIGH); digitalWrite(GREEN_LED_PIN, HIGH); digitalWrite(BUZZER_PIN, HIGH); delay(200);`
      - Turns on both LEDs and buzzer for 200ms.
    - `digitalWrite(RED_LED_PIN, LOW); digitalWrite(GREEN_LED_PIN, LOW); digitalWrite(BUZZER_PIN, LOW); delay(200);`
      - Turns them off for 200ms, creating a blinking/beeping pattern.
- **Line:** `ESP.restart();`
  - Restarts the ESP32 to apply the reset and enter AP mode for reconfiguration.

**Key Notes:**
- Feedback loop enhances user interaction during reset.
- Restart ensures the system re-evaluates its state.

---

### 4. `setupAP()`
**Purpose:** Configures the ESP32 as a WiFi Access Point (AP) for initial WiFi setup.

**Technical Explanation:**
- **Line:** `WiFi.mode(WIFI_AP);`
  - Sets the ESP32 to Access Point mode.
- **Line:** `String apName = "CampusPro_" + String((uint32_t)ESP.getEfuseMac(), HEX);`
  - Creates a unique AP name using "CampusPro_" prefixed to the lower 32 bits of the ESP32’s MAC address in hexadecimal.
- **Line:** `WiFi.softAP(apName.c_str(), "12345678");`
  - Starts the AP with the generated name and password "12345678".
- **Line:** `IPAddress IP = WiFi.softAPIP();`
  - Retrieves the IP address assigned to the AP (typically 192.168.4.1).
- **Line:** `Serial.print("AP IP address: "); Serial.println(IP);`
  - Logs the AP’s IP for user reference.
- **Line:** `server.on("/", handleRoot); server.on("/save", HTTP_POST, handleSave); server.on("/reset", handleReset);`
  - Registers web server routes:
    - `/` → `handleRoot` (GET request for config page).
    - `/save` → `handleSave` (POST request to save credentials).
    - `/reset` → `handleReset` (GET request to reset).
- **Line:** `server.begin();`
  - Starts the web server.
- **Line:** `Serial.println("HTTP server started in AP mode"); ...`
  - Logs instructions for connecting to the AP and accessing the config page.
- **Line:** `apMode = true;`
  - Sets the global `apMode` flag to indicate AP mode is active.

**Key Notes:**
- Uses a fixed password for simplicity; consider enhancing security in production.
- MAC-based AP name ensures uniqueness.

---

### 5. `handleRoot()`
**Purpose:** Serves the configuration webpage when accessing the AP’s root URL.

**Technical Explanation:**
- **Line:** `String html = "<html><head>..." ... "</body></html>";`
  - Constructs an HTML string with:
    - **Meta tag:** Ensures mobile responsiveness (`viewport` settings).
    - **CSS:** Styles the page with a clean, centered layout, responsive design, and form elements.
    - **Body:** Displays a form with fields for SSID and password, styled with a submit button.
- **Line:** `server.send(200, "text/html", html);`
  - Sends the HTML content with a 200 OK status to the client’s browser.

**Key Notes:**
- Simple, user-friendly interface for WiFi setup.
- Responsive design adapts to different screen sizes.

---

### 6. `handleSave()`
**Purpose:** Handles the POST request to save WiFi credentials submitted via the web form.

**Technical Explanation:**
- **Line:** `String new_ssid = server.arg("ssid"); String new_password = server.arg("password");`
  - Retrieves the `ssid` and `password` values from the POST request.
- **Line:** `String html = "<html><head>..." ... "</body></html>";`
  - Prepares an HTML response with styling similar to `handleRoot`.
- **Line:** `if (new_ssid.length() > 0) { ... } else { ... }`
  - Checks if the SSID is non-empty:
    - **Success Case:**
      - `saveWiFiCredentials(new_ssid, new_password);`
        - Saves the credentials to EEPROM.
      - Constructs a success message indicating the device will connect and may restart.
      - `server.send(200, "text/html", html);`
        - Sends the success response.
      - `delay(3000); ESP.restart();`
        - Waits 3 seconds, then restarts to apply settings.
    - **Error Case:**
      - Constructs an error message for empty SSID with a "Go Back" link.
      - `server.send(400, "text/html", html);`
        - Sends a 400 Bad Request response.

**Key Notes:**
- Validates SSID to prevent empty submissions.
- Restart ensures immediate application of new settings.

---

### 7. `connectToWiFi()`
**Purpose:** Connects the ESP32 to a WiFi network using stored credentials.

**Technical Explanation:**
- **Line:** `Serial.println("Connecting to WiFi..."); Serial.println("SSID: " + ssid);`
  - Logs the connection attempt and SSID.
- **Line:** `WiFi.mode(WIFI_STA);`
  - Sets the ESP32 to Station mode (client connecting to an AP).
- **Line:** `WiFi.begin(ssid.c_str(), password.c_str());`
  - Initiates connection using the stored SSID and password (converted to C-strings).
- **Line:** `int attempts = 0; while (WiFi.status() != WL_CONNECTED && attempts < 20) { ... }`
  - Loops up to 20 times (10 seconds total with 500ms delays):
    - `delay(500); Serial.print("."); attempts++;`
      - Waits and prints dots for progress.
- **Line:** `if (WiFi.status() == WL_CONNECTED) { ... } else { ... }`
  - **Success:**
    - Logs successful connection and IP address.
  - **Failure:**
    - Logs failure and, if previously configured (`wifiConfigDone`), switches to AP mode via `setupAP()`.

**Key Notes:**
- Timeout prevents infinite loops.
- Fallback to AP mode allows reconfiguration if connection fails.

---

### 8. `soundBuzzer(int pattern)`
**Purpose:** Generates different buzzer sound patterns for feedback.

**Technical Explanation:**
- **Line:** `switch (pattern) { ... }`
  - Selects a pattern based on the input:
    - **Case 1 (WiFi connected):**
      - Two beeps: 200ms on, 100ms off, 200ms on.
    - **Case 2 (Success):**
      - Single short beep: 50ms on.
    - **Case 3 (Error):**
      - Three beeps: 100ms on, 100ms off each.
  - Uses `digitalWrite(BUZZER_PIN, HIGH/LOW)` to control the buzzer and `delay()` for timing.

**Key Notes:**
- Simple PWM-like control without actual PWM for basic feedback.
- Patterns are distinct for user recognition.

---

### 9. `syncTimeWithNTP()`
**Purpose:** Synchronizes the ESP32’s clock with an NTP server.

**Technical Explanation:**
- **Line:** `if (WiFi.status() != WL_CONNECTED) { ... return false; }`
  - Checks WiFi connection; returns false if not connected.
- **Line:** `configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);`
  - Configures the ESP32’s time with IST offset (19800s = 5.5 hours) and no daylight saving.
- **Line:** `time_t now = 0; int attempts = 0; const int maxAttempts = 20;`
  - Initializes variables for time tracking and a 20-attempt limit (10 seconds).
- **Line:** `while (attempts < maxAttempts) { ... }`
  - Loops until time is synced or attempts are exhausted:
    - `time(&now);`
      - Fetches the current epoch time.
    - `if (now > (gmtOffset_sec + 1609459200)) { ... }`
      - Checks if time is after Jan 1, 2021 (1609459200s + offset), indicating a valid sync.
      - Formats and logs the time using `strftime`.
      - Returns true on success.
    - `delay(500); Serial.print("."); attempts++;`
      - Waits and logs progress.
- **Line:** `Serial.println("\nFailed to sync time with NTP"); return false;`
  - Logs failure if timeout occurs.

**Key Notes:**
- Ensures accurate timestamps for Supabase updates.
- Uses a sanity check to validate time.

---

### 10. `validateRFID(String rfidTag)`
**Purpose:** Validates an RFID tag (placeholder function).

**Technical Explanation:**
- **Line:** `return true;`
  - Always returns true, accepting all RFID tags (no actual validation implemented).

**Key Notes:**
- Intended for future enhancement (e.g., checking against a database or list).
- Current implementation is a stub for testing.

---

### 11. `openGate()`
**Purpose:** Opens the servo-controlled gate.

**Technical Explanation:**
- **Line:** `Serial.println("Opening gate");`
  - Logs the action.
- **Line:** `gateServo.write(90);`
  - Sets the servo to 90 degrees (assumed open position for MG996R servo).

**Key Notes:**
- Assumes 90° is fully open; adjust based on servo calibration.

---

### 12. `closeGate()`
**Purpose:** Closes the servo-controlled gate.

**Technical Explanation:**
- **Line:** `Serial.println("Closing gate");`
  - Logs the action.
- **Line:** `gateServo.write(0);`
  - Sets the servo to 0 degrees (assumed closed position).

**Key Notes:**
- Assumes 0° is fully closed; adjust as needed.

---

### 13. `getBusStatus(String rfidTag, bool& inCampus)`
**Purpose:** Queries Supabase to check if a bus (identified by RFID) is currently in campus.

**Technical Explanation:**
- **Line:** `if (WiFi.status() == WL_CONNECTED) { ... }`
  - Proceeds only if WiFi is connected.
- **Line:** `HTTPClient http; String url = String(supabaseStatusUrl) + "?rfid_id=" + rfidTag;`
  - Initializes an HTTP client and constructs a GET URL with the RFID tag as a query parameter.
- **Line:** `http.begin(url); http.addHeader("apikey", supabaseKey); http.addHeader("Authorization", "Bearer " + String(supabaseKey));`
  - Sets up the HTTP request with Supabase API key for authentication.
- **Line:** `int httpResponseCode = http.GET();`
  - Sends the GET request and stores the response code.
- **Line:** `if (httpResponseCode > 0) { ... } else { ... }`
  - **Success:**
    - `String response = http.getString();`
      - Retrieves the JSON response.
    - `DynamicJsonDocument doc(1024); DeserializationError error = deserializeJson(doc, response);`
      - Parses the JSON into a 1024-byte document.
    - `if (!error && doc.containsKey("in_campus")) { ... }`
      - Checks for parsing success and the presence of `in_campus`.
      - `inCampus = doc["in_campus"].as<bool>();`
        - Updates the reference parameter `inCampus` with the bus status.
      - Returns true.
    - Logs parsing errors if they occur.
  - **Failure:**
    - Logs the HTTP error code.
- **Line:** `http.end();`
  - Closes the HTTP connection.

**Key Notes:**
- Uses pass-by-reference to update `inCampus`.
- Relies on Supabase returning a JSON object with `in_campus`.

---

### 14. `updateBusStatus(String rfidTag, String eventType)`
**Purpose:** Updates the bus status (entry/exit) in Supabase.

**Technical Explanation:**
- **Line:** `if (WiFi.status() == WL_CONNECTED) { ... }`
  - Ensures WiFi is connected.
- **Line:** `HTTPClient http; http.begin(supabaseUrl);`
  - Initializes an HTTP client with the Supabase endpoint.
- **Line:** `http.addHeader("Content-Type", "application/json"); http.addHeader("apikey", supabaseKey); http.addHeader("Authorization", "Bearer " + String(supabaseKey));`
  - Sets headers for JSON content and authentication.
- **Line:** `time_t now; time(&now); struct tm* timeinfo = localtime(&now); char timeStr[30]; strftime(timeStr, sizeof(timeStr), "%Y-%m-%dT%H:%M:%S", timeinfo);`
  - Gets the current time, converts it to local time, and formats it as ISO 8601 (e.g., "2025-04-05T12:00:00").
- **Line:** `String jsonPayload = "{\"rfid_id\":\"" + rfidTag + "\",\"event_type\":\"" + eventType + "\",\"timestamp\":\"" + String(timeStr) + "\"}";`
  - Constructs a JSON payload with RFID tag, event type (entry/exit), and timestamp.
- **Line:** `int httpResponseCode = http.POST(jsonPayload);`
  - Sends the POST request with the JSON payload.
- **Line:** `if (httpResponseCode > 0) { ... } else { ... }`
  - **Success:**
    - `String response = http.getString();`
      - Retrieves the response.
    - `DynamicJsonDocument doc(1024); DeserializationError error = deserializeJson(doc, response);`
      - Parses the JSON response.
    - `if (!error && doc.containsKey("success") && doc["success"].as<bool>()) { ... }`
      - Checks for parsing success and a `success: true` field, indicating the update worked.
      - Returns true.
    - Logs errors if parsing fails or success is false.
  - **Failure:**
    - Logs the HTTP error code.
- **Line:** `http.end();`
  - Closes the connection.

**Key Notes:**
- Assumes Supabase returns `{ "success": true }` on success.
- Timestamp ensures accurate event logging.

---

### 15. `blinkLED(int pin, int times, int delayTime)`
**Purpose:** Blinks an LED for feedback.

**Technical Explanation:**
- **Line:** `for (int i = 0; i < times; i++) { ... }`
  - Loops `times` iterations:
    - `digitalWrite(pin, HIGH); delay(delayTime); digitalWrite(pin, LOW); delay(delayTime);`
      - Turns the LED on for `delayTime` ms, then off for the same duration.
- **Line:** `if (pin == RED_LED_PIN) { digitalWrite(RED_LED_PIN, HIGH); }`
  - If the red LED was blinked, turns it back on (standby state).

**Key Notes:**
- Used for error/success indication.
- Red LED defaults to on after blinking.

---

### Additional Notes on `setup()` and `loop()`
- **`setup()`:**
  - Initializes serial communication, pins, EEPROM, and hardware (RFID, servo).
  - Loads credentials and either connects to WiFi or starts AP mode.
  - Syncs time and sets initial states (e.g., gate closed, red LED on).
- **`loop()`:**
  - Handles AP mode (web server) or normal operation (RFID scanning).
  - Monitors reset button, syncs NTP periodically, and processes RFID tags when detected.
  - Manages gate, LEDs, and buzzer based on RFID validation and Supabase responses.

---

This detailed breakdown covers the technical functionality of each line, focusing on hardware interaction, network communication, and system logic. Let me know if you need further clarification on any part!