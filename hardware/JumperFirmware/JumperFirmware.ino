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
	"asgard_router1", //  "david"; // "ilikepie";
	"godhatesfangs", // "stephens"; //"Goldfish54!";
	"http://192.168.1.75:12271",
	true
};

pixel_provider* provider;
image_identity current_image = { "_", -1, default_delay };

auto setup() -> void
{
	if (cfg.use_http)
	{
		provider = new http_api_pixel_provider();
	}
	else
	{
		provider = new mqtt_pixel_provider();
	}
	
	provider->set_config(&cfg);
	
	snake_lights::init();

	Serial.begin(115200);
	delay(1000);

	networking::ensure_wifi_connected(cfg.ssid, cfg.password);
}

auto loop() -> void
{
	console::log(F("Loop()"));

	networking::ensure_wifi_connected(cfg.ssid, cfg.password);

	const auto response = provider->get_image_data(&current_image);
	if (response.loaded == false)
	{
		console::log(F("No data loaded from provider."));
		delay(default_delay);
		return;
	}
	
	api_response_parser::copy_to(current_image, response);
	
	console::log("Displaying " + response.image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);

	snake_lights::update_lights(response.palette, response.pixels);
	delay(current_image.frame_duration);
}