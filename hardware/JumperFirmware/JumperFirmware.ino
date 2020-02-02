#include "StringUtils.h"
#include "DataStructures.h"
#include "ApiResponseParser.h"
#include "SnakeLights.h"
#include "Networking.h"
#include <ESP8266WiFi.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

const char* ssid = "asgard_router1";
const char* password = "godhatesfangs";
const String server_proto_and_host = "http://192.168.1.75:12271";

image_identity current_image = { "_", -1, default_delay };

auto setup() -> void
{
	snake_lights::init();

	Serial.begin(115200);
	delay(1000);

	networking::ensure_wifi_connected(ssid, password);
}

auto loop() -> void
{
	Serial.println(F("Loop()"));

	networking::ensure_wifi_connected(ssid, password);

	const auto api_path = server_proto_and_host + "/active-image-frames?currentImageKey=";
	const auto url_to_req = api_path + current_image.image_key + "&currentFrameIndex=" + current_image.frame_index;

	const String headers[2] = {
		F("Accept: text/led-bytes"),
		F("Accept-Encoding: packed-rgb")
	};
	
	const auto framedata = networking::http_get(url_to_req, headers, 2);
	
	if (framedata.body.equals("")) {
		delay(default_delay);
		return;
	}

	const auto response = api_response_parser::parse(framedata.body);
	api_response_parser::copy_to(current_image, response);
	
	Serial.println("Displaying " + response.image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);
			
	snake_lights::update_lights(response.palette, response.pixels);
	
	delay(current_image.frame_duration);
	Serial.println(F("Finished waiting."));
}
