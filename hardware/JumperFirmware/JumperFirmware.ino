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

auto update_lights(const DynamicJsonDocument& doc, int frame) -> void
{
	Serial.println("Updating lights");

	for (auto i = 0; i < NUM_LIGHTS; i++) {
		auto image_frame = doc["rgbFrames"][frame]["b"];
		const auto palette_ref = image_frame[i].as<int>();
		const auto hex_code = doc["palette"][palette_ref].as<const char*>();
				
		int r, g, b;
		sscanf(hex_code, "%02x%02x%02x", &r, &g, &b);
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

typedef struct
{
	char* image_key;
	int frame_index;
	int frame_duration;
} image_identity;

bool are_equal(const char* first, const char* second) {	return strcmp(first, second) == 0; }

const int default_delay = 1000;
int current_delay = default_delay;
image_identity current_image = { "", -1, default_delay };


auto loop() -> void
{
	Serial.println("Tick");

	ensure_wifi_connected(ssid, password);

	const auto json = http_get("http://192.168.1.75:12271/active-image-frames");
	if (json.equals("")) {
		delay(current_delay);
		return;
	}

	Serial.println(json);
	DynamicJsonDocument doc(20000); // This will support ~10 frames
	const DeserializationError error = deserializeJson(doc, json);
	if (error) {
		delay(current_delay);
		return;
	}

	char* this_image_key = doc["imageKey"];
	auto total_frames = doc["rgbFrames"].size();

	if (are_equal(current_image.image_key, this_image_key) == 0 && total_frames > 1)
	{	
		Serial.println("Image is part of an animation, stepping forwards");
		current_image.frame_index = total_frames > 1 ? current_image.frame_index + 1 : current_image.frame_index;
		current_image.frame_index = current_image.frame_index >= total_frames ? 0 : current_image.frame_index;
		current_image.frame_duration = doc["rgbFrames"][current_image.frame_index]["duration"].as<int>();				
	}
	else
	{
		Serial.println("Image has changed");
		current_image.image_key = this_image_key;
		current_image.frame_index = 0;
		current_image.frame_duration = default_delay;
	}
	   
	const auto frame_to_show = current_image.frame_index == -1 ? 0 : current_image.frame_index;
	const auto show_duration = current_image.frame_duration == -1 ? default_delay : current_image.frame_duration;

	Serial.print("Displaying ");
	Serial.print(current_image.image_key);
	Serial.print(" at frame ");
	Serial.print(current_image.frame_index);
	Serial.print(" wth a delay of ");
	Serial.print(current_image.frame_duration);
	Serial.println();
	
	update_lights(doc, frame_to_show);
	strip.show();

	delay(show_duration);
}
