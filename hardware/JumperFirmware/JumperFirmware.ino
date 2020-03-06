// #define DEBUG // Uncomment this line to enable diagnostic debug
#include "MqttPixelProvider.h"
#include "HttpApiPixelProvider.h"
#include "PixelProvider.h"
#include "Console.h"
#include "DataStructures.h"
#include "ApiResponseParser.h"
#include "SnakeLights.h"
#include "Networking.h"
#ifdef __AVR__
#include <avr/power.h>
#endif

const char* ssid = "asgard_router1"; //  "david"; // "ilikepie";
const char* password = "godhatesfangs"; // "stephens"; //"Goldfish54!";

image_identity current_image = { "_", -1, default_delay };

pixel_provider* provider;
mqtt_pixel_provider mqtt;
http_api_pixel_provider http;

auto setup() -> void
{
	provider = &http;
	snake_lights::init();

	Serial.begin(115200);
	delay(1000);

	networking::ensure_wifi_connected(ssid, password);
}

auto loop() -> void
{
	console::log(F("Loop()"));

	networking::ensure_wifi_connected(ssid, password);

	const auto response = provider->get_image_data(current_image);
	if (response.loaded == false)
	{
		console::log(F("No data loaded from provider."));
		delay(default_delay);
		return;
	}
	
	api_response_parser::copy_to(current_image, response);
	
	console::log("Displaying " + response.image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);

	snake_lights::update_lights(response.palette, response.pixels);

	console::log(F("Waiting for: "));
	console::log(current_image.frame_duration);
	
	delay(current_image.frame_duration);
}
