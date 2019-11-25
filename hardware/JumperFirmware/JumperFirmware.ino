#include "DataStructures.h"
#include "ApiResponseParser.h"
#include "SnakeLights.h"
#include "Networking.h"
#include <ESP8266WiFi.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

image_identity current_image = { "_", -1, default_delay };

auto setup() -> void
{
	SnakeLightsClass::init();
	
	Serial.begin(115200);
	delay(100);

	Networking::ensure_wifi_connected();
}

auto loop() -> void
{
	Serial.println(F("Loop()"));
	Networking::ensure_wifi_connected();

	auto api_path = "http://192.168.1.75:12271/active-image-frames?raw=true&currentImageKey=";
	auto url_to_req = api_path + current_image.image_key + "&currentFrameIndex=" + current_image.frame_index;
	
	const auto framedata = Networking::http_get(url_to_req);
	if (framedata.equals("")) {
		delay(default_delay);
		return;
	}

	const auto response = ApiResponseParserClass::parse(framedata);
	ApiResponseParserClass::copy_to(current_image, response);
	
	Serial.println("Displaying " + response.image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);
			
	SnakeLightsClass::update_lights(response.palette, response.pixels);
	
	delay(current_image.frame_duration);
	Serial.println(F("Finished waiting."));
}