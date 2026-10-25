#include <WiFi.h>
#include <FirebaseESP32.h>

#include <Wire.h>
#include <MAX30105.h>

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// ================= FIREBASE =================

#include "secrets.h" // WIFI_SSID, WIFI_PASSWORD, API_KEY (template: include/secrets.example.h)

#define DATABASE_URL "heartrock-5baf0-default-rtdb.asia-southeast1.firebasedatabase.app/"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
FirebaseJson json;

// ================= OLED =================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// ================= SENSOR =================

MAX30105 sensor;

// ================= SETTINGS =================

const unsigned long kFingerThreshold = 10000;
const unsigned int kFingerCooldownMs = 500;

const int kAveragingSamples = 5;

// ================= VARIABLES =================

float lastValue = 0;
float lastDiff = 0;

int bpmBuffer[kAveragingSamples];
int spo2Buffer[kAveragingSamples];

int bufferIndex = 0;
int sampleCount = 0;

long last_heartbeat = 0;
long finger_timestamp = 0;

bool finger_detected = false;

// ================= STATISTICS =================

float redMin = 999999;
float redMax = 0;
float redAvg = 0;

float irMin = 999999;
float irMax = 0;
float irAvg = 0;

int statCount = 0;

// ================= FUNCTION DECLARATIONS =================

void initDrawScreen(void);

void displayMeasuredValues(
  bool no_finger,
  int32_t beatAvg,
  int32_t spo2
);

// ================= SETUP =================

void setup()
{
  Serial.begin(115200);

  // ================= WIFI =================

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());

  // ================= FIREBASE =================

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", ""))
  {
    Serial.println("Firebase signUp OK");
  }
  else
  {
    Serial.printf(
      "SignUp Error: %s\n",
      config.signer.signupError.message.c_str()
    );
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase Ready");

  // ================= I2C =================

  Wire.begin();
  Wire.setClock(400000);

  // ================= OLED =================

  if (!display.begin(
        SSD1306_SWITCHCAPVCC,
        0x3C))
  {
    while (1);
  }

  display.clearDisplay();
  display.setTextColor(WHITE);

  // ================= SENSOR =================

  if (!sensor.begin(Wire, I2C_SPEED_FAST))
  {
    Serial.println("Sensor not found");

    while (1);
  }

  sensor.setup(
    60,
    4,
    2,
    100,
    411,
    4096
  );

  sensor.setPulseAmplitudeRed(0x2A);
  sensor.setPulseAmplitudeIR(0x2A);

  initDrawScreen();
}
// ================= LOOP =================

void loop()
{
  long redValue = sensor.getRed();
  long irValue = sensor.getIR();

  // ================= FINGER DETECTION =================

  if(redValue > kFingerThreshold)
  {
    if (millis() - finger_timestamp >
        kFingerCooldownMs)
    {
      finger_detected = true;
    }
  }
  else
  {
    finger_detected = false;

    finger_timestamp = millis();

    displayMeasuredValues(
      true,
      0,
      0
    );

    return;
  }

  // ================= HEART DETECTION =================

  float currentValue = redValue;

  float currentDiff =
    currentValue - lastValue;

  // ================= PEAK DETECTION =================

  if(lastDiff > 0 &&
      currentDiff < 0)
  {
    long currentBeat = millis();

    if (last_heartbeat != 0)
    {
      int bpm =
        60000 /
        (currentBeat -
         last_heartbeat);

      if (bpm > 45 &&
          bpm < 180)
      {
        bpmBuffer[bufferIndex] = bpm;

        // ================= SPO2 STATS =================

        if (redValue < redMin)
          redMin = redValue;

        if (redValue > redMax)
          redMax = redValue;

        if (irValue < irMin)
          irMin = irValue;

        if (irValue > irMax)
          irMax = irValue;

        redAvg += redValue;
        irAvg += irValue;

        statCount++;

        float spo2 = 98;

        if (statCount > 10)
        {
          float redAC =
            redMax - redMin;

          float irAC =
            irMax - irMin;

          float redDC =
            redAvg / statCount;

          float irDC =
            irAvg / statCount;

          float r =
            (redAC / redDC) /
            (irAC / irDC);

          spo2 =
            110 - (25 * r);

          if (spo2 > 100)
            spo2 = 100;

          if (spo2 < 80)
            spo2 = 80;
        }

        spo2Buffer[bufferIndex] =
          (int)spo2;

        bufferIndex++;

        if (bufferIndex >=
            kAveragingSamples)
        {
          bufferIndex = 0;
        }

        if (sampleCount <
            kAveragingSamples)
        {
          sampleCount++;
        }

        // ================= AVERAGING =================

        int average_bpm = 0;
        int average_spo2 = 0;

        for (int i = 0;
             i < sampleCount;
             i++)
        {
          average_bpm +=
            bpmBuffer[i];

          average_spo2 +=
            spo2Buffer[i];
        }

        average_bpm /=
          sampleCount;

        average_spo2 /=
          sampleCount;

        // ================= SERIAL =================

        Serial.print("BPM: ");
        Serial.println(
          average_bpm);

        Serial.print("SpO2: ");
        Serial.println(
          average_spo2);

        // ================= OLED =================

        displayMeasuredValues(
          false,
          average_bpm,
          average_spo2
        );

        // ================= FIREBASE =================

        json.clear();

        json.set(
          "bpm",
          average_bpm
        );

        json.set(
          "spo2",
          average_spo2
        );

        json.set(
          "timestamp",
          millis()
        );

        if (
          Firebase.updateNode(
            fbdo,
            "/healthData",
            json
          )
        )
        {
          Serial.println(
            "Firebase Upload OK"
          );
        }
        else
        {
          Serial.print(
            "Firebase Error: "
          );

          Serial.println(
            fbdo.errorReason()
          );
        }

        // ================= RESET =================

        redMin = 999999;
        redMax = 0;

        irMin = 999999;
        irMax = 0;

        redAvg = 0;
        irAvg = 0;

        statCount = 0;
      }
    }

    last_heartbeat =
      currentBeat;
  }

  lastDiff = currentDiff;
  lastValue = currentValue;

  delay(10);
}

// ================= OLED START =================

void initDrawScreen(void)
{
  display.clearDisplay();

  display.setTextSize(1);

  display.setCursor(15, 0);
  display.println("MAX30102 Monitor");

  display.setTextSize(2);

  display.setCursor(5, 18);
  display.println("BPM  SPO2");

  display.display();
}

// ================= OLED DISPLAY =================

void displayMeasuredValues(
  bool no_finger,
  int32_t beatAvg,
  int32_t spo2)
{
  display.fillRect(
    0,
    40,
    128,
    24,
    BLACK
  );

  display.setTextColor(
    WHITE
  );

  if (no_finger)
  {
    display.setTextSize(2);

    display.setCursor(0, 45);

    display.println(
      "No Finger"
    );

    display.display();
  }
  else
  {
    display.setCursor(0, 42);

    display.setTextSize(2);

    display.print(beatAvg);

    display.print(" ");

    if (spo2 >= 70 &&
        spo2 <= 100)
    {
      display.print(spo2);
    }
    else
    {
      display.print("--");
    }

    display.display();
  }
}

