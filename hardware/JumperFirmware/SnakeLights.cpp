#include <Adafruit_NeoPixel.h>
#include "SnakeLights.h"

#define PIN 4
#define NUM_LIGHTS  256
Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LIGHTS, PIN, NEO_GRB + NEO_KHZ800);

void SnakeLightsClass::init()
{
	strip.begin();
	strip.show();
}

auto hex_for_position(const String palette, int palette_ref) -> String
{
	const auto palette_offset = (6 * palette_ref) + palette_ref;
	const auto hex_code = palette.substring(palette_offset, palette_offset + 6);
	return hex_code;
}


void SnakeLightsClass::update_lights(const String& palette, const String& pixels)
{
	const auto pixel_start_position = pixels.indexOf(',') + 1;

	auto pixel_offset = 0;
	auto buffer_offset = 0;
	char current_pixel_buffer[4];

	for (auto i = pixel_start_position; i < pixels.length(); i++) {

		if (pixels.charAt(i) != ',')
		{
			current_pixel_buffer[buffer_offset] = pixels.charAt(i);
			buffer_offset++;
			continue;
		}

		const auto palette_ref = atoi(current_pixel_buffer);
		const auto hex_code = hex_for_position(palette, palette_ref).c_str();

		int r, g, b;
		sscanf(hex_code, "%02x%02x%02x", &r, &g, &b);
		strip.setPixelColor(i, Adafruit_NeoPixel::Color(r, g, b));

		buffer_offset = 0;
		pixel_offset++;
	}

	strip.show();

	Serial.println(F("Lights set"));
}


void  SnakeLightsClass::error_lights()
{
	strip.setPixelColor(0, Adafruit_NeoPixel::Color(255, 0, 0));
	for (auto i = 1; i < NUM_LIGHTS; i++) { strip.setPixelColor(i, Adafruit_NeoPixel::Color(0, 0, 0)); }
}

SnakeLightsClass LightManager;