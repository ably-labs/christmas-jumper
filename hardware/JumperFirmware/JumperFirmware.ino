#include "Networking.h"
#include <Adafruit_NeoPixel.h>
#include <ESP8266WiFi.h>
#include <cstring>
#ifdef __AVR__
#include <avr/power.h>
#endif

#define PIN 4
#define NUM_LIGHTS  256
constexpr auto default_delay = 1000;

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LIGHTS, PIN, NEO_GRB + NEO_KHZ800);

typedef struct { String key; int value[256][3]; } key_value_pair;
typedef struct { String image_key; int frame_index; int frame_duration; } image_identity;

const Networking net = Networking();

auto setup() -> void
{
	strip.begin();
	strip.show();
	Serial.begin(115200);
	delay(100);

	Networking::ensure_wifi_connected();
}


auto error_lights() -> void
{
	strip.setPixelColor(0, Adafruit_NeoPixel::Color(255, 0, 0));	
	for (auto i = 1; i < NUM_LIGHTS; i++) { strip.setPixelColor(i, Adafruit_NeoPixel::Color(0, 0, 0)); }
}

auto split_string_into(const char separator, const String& raw, String* parts) -> void
{
	auto start_at = 0;
	auto end_at = raw.indexOf(separator, start_at);
	auto i = 0;

	while (end_at != -1)
	{
		parts[i] = raw.substring(start_at, end_at);

		start_at = end_at + 1;
		end_at = raw.indexOf('`', start_at);

		i++;

		if (start_at >= raw.length())
		{
			end_at = -1;
		}
	}
}

image_identity current_image = { "_", -1, default_delay };

void update_lights(const String& palette, const String& pixels)
{
	const auto pixel_start_position = pixels.indexOf(',') + 1;

	auto pixelOffset = 0;
	auto buffer_offset = 0;
	char current_pixel_buffer[4];
	
	for (auto i = pixel_start_position; i < pixels.length(); i++) {

		if(pixels.charAt(i) != ',')
		{
			current_pixel_buffer[buffer_offset] = pixels.charAt(i);
			buffer_offset++;
			continue;
		}

		const auto palette_ref = atoi(current_pixel_buffer);
		const auto palette_offset = (6 * palette_ref) + palette_ref;
		const auto hex_code = palette.substring(palette_offset, palette_offset + 6).c_str();

		int r, g, b;
		sscanf(hex_code, "%02x%02x%02x", &r, &g, &b);
		strip.setPixelColor(i, Adafruit_NeoPixel::Color(r, g, b));

		buffer_offset = 0;
		pixelOffset++;
	}

	strip.show();

	Serial.println(F("Lights set"));
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

	String parts[20]; // sure whatever.
	split_string_into('`', framedata, parts);
	
	const auto image_key = parts[0];
	const auto total_frames = parts[1].substring(6).toInt();
	const auto frame_index = parts[2].substring(6).toInt();
	const auto frame_display_duration = parts[4].substring(0, parts[4].indexOf(',')).toInt();
	
	current_image.image_key = image_key;
	current_image.frame_index = frame_index;
	current_image.frame_duration = total_frames == 1 ? default_delay : frame_display_duration;
	
	Serial.println("Displaying " + image_key + " at frame " + current_image.frame_index + " wth a delay of " + current_image.frame_duration);

	const auto palette = parts[3];
	const auto pixels = parts[4];

	update_lights(palette, pixels);

	delay(current_image.frame_duration);
	Serial.println(F("Finished waiting."));
}

