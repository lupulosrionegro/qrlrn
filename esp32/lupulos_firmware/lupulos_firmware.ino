/*
  LUPULOS RIO NEGRO — ESP32 Firmware
  ====================================
  Hardware:
    - ESP32 DevKit
    - Sensor de humedad: DHT22 o capacitivo (pin A0)
    - 3 botones: BTN_VARIEDAD (pin 12), BTN_MEDIR (pin 13), BTN_IMPRIMIR (pin 14)
    - Impresora térmica: TX→pin 17, RX→pin 16 (Serial2)
    - RTC DS3231 (I2C: SDA=21, SCL=22)
    - MicroSD (SPI: CS=5, MOSI=23, MISO=19, SCK=18)

  Flujo:
    1. Al encender: leer variedades.json de la SD
    2. BTN_VARIEDAD: cicla entre variedades
    3. BTN_MEDIR: toma lectura del sensor y la muestra en serial
    4. BTN_IMPRIMIR: POST a la API, recibe QR en base64, envía a impresora térmica
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SD.h>
#include <SPI.h>
#include <Wire.h>
// #include <DHT.h>         // Descomenta si usas DHT22
// #include <RTClib.h>      // Descomenta si usas DS3231

// ——— CONFIGURACIÓN — MODIFICAR ANTES DE FLASHEAR ———
const char* WIFI_SSID     = "Claro-190";
const char* WIFI_PASS     = "20304050";
const char* API_URL       = "https://qr.lupulosrionegro.com.ar/api/lotes";
const char* SENSOR_ID     = "ESP32-01";

// Pines
#define BTN_VARIEDAD  12
#define BTN_MEDIR     13
#define BTN_IMPRIMIR  14
#define PIN_SENSOR    34  // Analógico para sensor capacitivo
#define SD_CS         5



// ——— VARIABLES GLOBALES ———
struct Variedad { int id; String nombre; };
Variedad variedades[20];
int numVariedades = 0;
int variedadActual = 0;

float humedadActual  = 0.0;
float tempActual     = 0.0;
bool  hayLectura     = false;

// ——— SETUP ———
void setup() {
  Serial.begin(115200);
  Serial2.begin(9600);  // Impresora térmica

  pinMode(BTN_VARIEDAD, INPUT_PULLUP);
  pinMode(BTN_MEDIR, INPUT_PULLUP);
  pinMode(BTN_IMPRIMIR, INPUT_PULLUP);

  // =========================
  // WIFI
  // =========================
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.print("Conectando WiFi");

  unsigned long start = millis();
  bool wifi_ok = false;

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");

    if (millis() - start > 15000) {
      Serial.println("\nERROR: WiFi timeout");
      wifi_ok = false;
      break;
    }
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi OK: " + WiFi.localIP().toString());
    wifi_ok = true;
  }

  // =========================
  // SD CARD
  // =========================
  if (!SD.begin(SD_CS)) {
    Serial.println("ERROR: No se pudo inicializar la SD");
  } else {
    Serial.println("SD OK");
    cargarVariedades();
  }

  Serial.println("Sistema listo");
}

// ——— LOOP ———
void loop() {
  if (digitalRead(BTN_VARIEDAD) == LOW) {
    delay(200);  // debounce
    variedadActual = (variedadActual + 1) % numVariedades;
    Serial.println("Variedad: " + variedades[variedadActual].nombre);
  }

  if (digitalRead(BTN_MEDIR) == LOW) {
    delay(200);
    tomarLectura();
  }

  if (digitalRead(BTN_IMPRIMIR) == LOW) {
    delay(200);
    if (!hayLectura) {
      Serial.println("ERROR: Tomá una lectura primero");
      return;
    }
    enviarYImprimir();
  }

  delay(50);
}

// ——— FUNCIONES ———

void cargarVariedades() {
  // Lee variedades.json de la SD
  // Formato: [{"id":1,"nombre":"Victoria"},{"id":2,"nombre":"Cascade"}]
  File f = SD.open("/variedades.json");
  if (!f) { Serial.println("No se encontró variedades.json en SD"); return; }

  String json = f.readString();
  f.close();

  StaticJsonDocument<2048> doc;
  deserializeJson(doc, json);
  JsonArray arr = doc.as<JsonArray>();

  numVariedades = 0;
  for (JsonObject v : arr) {
    variedades[numVariedades].id     = v["id"];
    variedades[numVariedades].nombre = v["nombre"].as<String>();
    numVariedades++;
  }
  Serial.println("Variedades cargadas: " + String(numVariedades));
}

void tomarLectura() {
  // Sensor capacitivo analógico (0-4095 en ESP32)
  int raw = analogRead(PIN_SENSOR);
  // Convertir raw a % — calibrar según tu sensor
  // Valores típicos: seco ~3000, húmedo ~1000
  humedadActual = map(raw, 3000, 1000, 0, 100);
  humedadActual = constrain(humedadActual, 0, 100);
  humedadActual = humedadActual / 10.0;  // Escala a 0-10%

  // Para DHT22 descomenta:
  // humedadActual = dht.readHumidity();
  // tempActual    = dht.readTemperature();

  hayLectura = true;
  Serial.printf("Lectura: Humedad=%.1f%% Temp=%.1f°C\n", humedadActual, tempActual);
}

void enviarYImprimir() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Sin WiFi — no se puede enviar");
    return;
  }

  // Construir JSON para la API
  StaticJsonDocument<256> doc;
  doc["variedad_id"] = variedades[variedadActual].id;
  doc["humedad"]     = humedadActual;
  doc["temperatura"] = tempActual;
  doc["sensor_id"]   = SENSOR_ID;
  doc["peso_gramos"] = 500;  // Ajustar si hay balanza

  String payload;
  serializeJson(doc, payload);

  // POST a la API
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(payload);
  Serial.println("HTTP response: " + String(code));

  if (code == 201) {
    String response = http.getString();
    StaticJsonDocument<1024> resp;
    deserializeJson(resp, response);

    String numeroLote = resp["lote"]["numero_lote"];
    String urlLote    = resp["lote"]["url"];
    float  humedad    = resp["lote"]["humedad"];
    String variedad   = resp["lote"]["variedad"];

    Serial.println("Lote creado: #" + numeroLote);
    Serial.println("URL: " + urlLote);

    // Imprimir en impresora térmica
    imprimirEtiqueta(variedad, numeroLote, humedad, urlLote);
  } else {
    Serial.println("Error API: " + http.getString());
  }

  http.end();
}

void imprimirEtiqueta(String variedad, String lote, float humedad, String url) {
  // Comandos ESC/POS básicos para impresora térmica
  // Centrar
  Serial2.write(0x1B); Serial2.write(0x61); Serial2.write(0x01);

  // Negrita ON
  Serial2.write(0x1B); Serial2.write(0x45); Serial2.write(0x01);
  Serial2.println("LUPULOS RIO NEGRO");

  // Negrita OFF
  Serial2.write(0x1B); Serial2.write(0x45); Serial2.write(0x00);
  Serial2.println(variedad);
  Serial2.println("Lote #" + lote);
  Serial2.printf("Humedad: %.1f%%\n", humedad);
  Serial2.println("");

  // El QR lo genera la impresora desde la URL (comandos QR ESC/POS)
  imprimirQR(url);

  Serial2.println("");
  Serial2.println(url);
  Serial2.println("");

  // Avance y corte
  Serial2.write(0x1B); Serial2.write(0x64); Serial2.write(0x04);
  Serial2.write(0x1D); Serial2.write(0x56); Serial2.write(0x41); Serial2.write(0x10);
}

void imprimirQR(String data) {
  // Comando QR Code ESC/POS (funciona en la mayoría de impresoras térmicas)
  int dataLen = data.length();

  Serial2.write(0x1D); Serial2.write(0x28); Serial2.write(0x6B);  // GS ( k
  Serial2.write(0x04); Serial2.write(0x00);                        // pL pH
  Serial2.write(0x31); Serial2.write(0x41);                        // cn fn (modelo QR)
  Serial2.write(0x32); Serial2.write(0x00);                        // modelo 2

  // Tamaño del módulo
  Serial2.write(0x1D); Serial2.write(0x28); Serial2.write(0x6B);
  Serial2.write(0x03); Serial2.write(0x00);
  Serial2.write(0x31); Serial2.write(0x43); Serial2.write(0x06);  // tamaño 6

  // Nivel de corrección de errores
  Serial2.write(0x1D); Serial2.write(0x28); Serial2.write(0x6B);
  Serial2.write(0x03); Serial2.write(0x00);
  Serial2.write(0x31); Serial2.write(0x45); Serial2.write(0x31);  // nivel M

  // Datos del QR
  Serial2.write(0x1D); Serial2.write(0x28); Serial2.write(0x6B);
  Serial2.write((dataLen + 3) & 0xFF);
  Serial2.write(((dataLen + 3) >> 8) & 0xFF);
  Serial2.write(0x31); Serial2.write(0x50); Serial2.write(0x30);
  Serial2.print(data);

  // Imprimir QR
  Serial2.write(0x1D); Serial2.write(0x28); Serial2.write(0x6B);
  Serial2.write(0x03); Serial2.write(0x00);
  Serial2.write(0x31); Serial2.write(0x51); Serial2.write(0x30);
}
