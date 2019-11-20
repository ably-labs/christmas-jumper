#include <ArduinoJson.hpp>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>

#include <ESP8266WiFi.h>
#include <cstring>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN 4
#define NUM_LIGHTS  256

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LIGHTS, PIN, NEO_GRB + NEO_KHZ800);
typedef struct { String key; int value[256][3]; } key_value_pair;

auto ensure_wifi_connected(const char* ssid, const char* password) -> void
{
	if (WiFi.status() == WL_CONNECTED)
	{
		Serial.println("WiFi already connected.");
		return;
	}
	
	Serial.print("Connecting to ");
	Serial.print(ssid);
	Serial.println();

	WiFi.begin(ssid, password);

	while (WiFi.status() != WL_CONNECTED) {
		delay(500);
		Serial.print(".");
	}
	Serial.println("");
	Serial.println("WiFi connected");
}

auto http_get(String urlToReq) -> String
{
	const auto index_of_protocol = urlToReq.indexOf("://") + 3;
	const auto without_protocol = urlToReq.substring(index_of_protocol);
	const auto index_of_port = without_protocol.indexOf(":");
	const auto index_of_path = without_protocol.indexOf("/");
	const auto url = without_protocol.substring(index_of_path);
	const auto port = index_of_port != 1 ? without_protocol.substring(index_of_port + 1, index_of_path).toInt() : 80;
	const auto host = index_of_port == -1 ? without_protocol.substring(0, index_of_path) : without_protocol.substring(0, index_of_port);
	
	WiFiClient client;

	if (!client.connect(host, port)) {
		Serial.println("connection failed");
		return "";
	}

	// This will send the request to the server
	client.print(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
	delay(500);

	String response;
	while (client.available()) { response = client.readString(); }

	const String delimiter = "\r\n\r\n";
	const auto index_of_close = response.lastIndexOf(delimiter);
	auto body = response.substring(index_of_close + delimiter.length());
	body.trim();

	return body;
}

auto error_lights() -> void
{
	strip.setPixelColor(0, strip.Color(255, 0, 0));	
	for (auto i = 1; i < NUM_LIGHTS; i++) { strip.setPixelColor(i, strip.Color(0, 0, 0)); }
}

auto update_lights(const DynamicJsonDocument& doc) -> void
{
	Serial.println("Updating lights");

	int r, g, b;	
	for (auto i = 0; i < NUM_LIGHTS; i++) {
		auto hex_code = doc["rgbFrames"][0]["data"][i].as<char*>();

		// Here are some dirty optimisations to reduce json payload sizes...		
		if(strcmp(hex_code, "x")) {
			hex_code = "000000"; // Shortened form for black
		}
		
		if(strcmp(hex_code, "w")) {
			hex_code = "ffffff"; // Shortened form for white
		}

		// Not the same as previous element
		if (!strcmp(hex_code, "")) {
			sscanf(hex_code, "%02x%02x%02x", &r, &g, &b);
		}

		strip.setPixelColor(i, strip.Color(r, g, b));
	}

	Serial.println("Colours set");
}

const auto ssid = "asgard_router1";
const auto password = "godhatesfangs";

auto setup() -> void
{
	strip.begin();
	strip.show();
	Serial.begin(115200);
	delay(100);
	
	ensure_wifi_connected(ssid, password);
}

const int default_delay = 1000;
int current_delay = default_delay;

auto loop() -> void
{
	Serial.println("Tick");
	
	ensure_wifi_connected(ssid, password);

	const auto json = http_get("http://192.168.1.75:12271/active-image-frames");
	Serial.println(json);
	
	if (json.equals("")) {
		delay(current_delay);
		return;
	}

	DynamicJsonDocument doc(16555); // This will support ~10 frames @ 170kb of memory
	DeserializationError error = deserializeJson(doc, json);
	if (error) {
		Serial.print(F("deserializeJson() failed: "));
		Serial.println(error.c_str());
		
		delay(1000);
		return;
	}

	const auto is_snaked = doc["snaked"].as<bool>();
	const auto frame_count = doc["frameCount"].as<int>();

	update_lights(doc);
	strip.show();

	delay(current_delay);
}
