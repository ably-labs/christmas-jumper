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
	Serial.println("Requesting: " + urlToReq);
	
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

	Serial.println("Request read response.");
	
	const String delimiter = "\r\n\r\n";
	const auto index_of_close = response.lastIndexOf(delimiter);
	auto body = response.substring(index_of_close + delimiter.length());
	body.trim();

	Serial.println("Request completed, returned:");
	Serial.println(body);

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

	for (auto i = 0; i < NUM_LIGHTS; i++) {
		auto image_frame = doc["frame"]["b"];
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
	String image_key;
	int frame_index;
	int frame_duration;
} image_identity;

const int default_delay = 1000;
image_identity current_image = { "_", -1, default_delay };

auto loop() -> void
{
	ensure_wifi_connected(ssid, password);

	auto api_path = "http://192.168.1.75:12271/active-image-frames?currentImageKey=";
	auto url_to_req = api_path + current_image.image_key + "&currentFrameIndex=" + current_image.frame_index;
	const auto json = http_get(url_to_req);
	if (json.equals("")) {
		delay(default_delay);
		return;
	}
	
	DynamicJsonDocument doc(20000);
	const DeserializationError error = deserializeJson(doc, json);
	if (error) {
		delay(default_delay);
		return;
	}

	const auto total_frames = doc["frameCount"].as<int>();
	const auto image_key = doc["imageKey"].as<String>();
	const auto frame_index = doc["frameIndex"].as<int>();
	const auto frame_display_duration = doc["frame"]["duration"].as<int>();

	current_image.image_key = image_key;
	current_image.frame_index = frame_index;
	current_image.frame_duration = total_frames == 1 ? default_delay : frame_display_duration;
	
	Serial.println("Displaying " + image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);
	
	update_lights(doc);
	strip.show();

	delay(current_image.frame_duration);
	Serial.println("Looping...");
}
