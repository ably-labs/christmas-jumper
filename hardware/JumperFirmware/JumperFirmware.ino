#define DEBUG // Uncomment this line to enable diagnostic debug
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

configuration cfg = {
  { "asgard_router1", "godhatesfangs" },
  { "http://5f184016.ngrok.io:80" },
  { "mqtt.ably.io", 8883, "3SwaWA.eWNKzg", "iDGSDjPS1oSrYmXR", "3b b1 e6 46 12 f9 f4 ac 53 59 f4 97 99 ee 35 c9 3b 3b 46 11" },  
  "mqtt"
};

pixel_provider* provider;
image_identity current_image = { "_", -1, default_delay };

auto setup() -> void
{
	if (cfg.connection_mode == "http")
		provider = new http_api_pixel_provider();
	else
		provider = new mqtt_pixel_provider();
	
	provider->set_config(&cfg);
	
	snake_lights::init();
  snake_lights::set_first_pixel("ff0000");

	Serial.begin(115200);
	delay(1000);

	networking::ensure_wifi_connected(cfg.wifi.ssid, cfg.wifi.password);  
  snake_lights::set_first_pixel("00ff00");
}

auto loop() -> void
{
	// console::log(F("Loop()"));
	networking::ensure_wifi_connected(cfg.wifi.ssid, cfg.wifi.password);

	const auto response = provider->get_image_data(&current_image);
	if (!response.loaded)
	{
		delay(default_delay);
		return;
	}
	
	api_response_parser::copy_to(current_image, response);	
	console::log("Displaying " + response.image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);
  
	snake_lights::update_lights(response.palette, response.pixels);
	delay(current_image.frame_duration);
}
