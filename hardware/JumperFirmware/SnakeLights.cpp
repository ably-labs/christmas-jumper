#include <Adafruit_NeoPixel.h>
#include "SnakeLights.h"

#define PIN 4
#define NUM_LIGHTS  256

Adafruit_NeoPixel strip = Adafruit_NeoPixel(NUM_LIGHTS, PIN, NEO_GRB + NEO_KHZ800);

void snake_lights::init()
{
	strip.begin();
	strip.show();
}

auto hex_for_position(const String& palette, const int palette_ref) -> String
{
	const auto palette_offset = (6 * palette_ref) + palette_ref;
	return palette.substring(palette_offset, palette_offset + 6);
}

void snake_lights::update_lights(const String& palette, const String& pixels)
{
	auto pixel_start = pixels.indexOf(',') + 1;
	auto pixel_number = 0;
	bool at_end;

	do
	{
		const auto pixel_end = pixels.indexOf(',', pixel_start);
		at_end = pixel_end == -1;

		const auto pixel_data = at_end
			? pixels.substring(pixel_start)
			: pixels.substring(pixel_start, pixel_end);

		const auto index_of_multiplication_symbol = pixel_data.indexOf('x');

		const auto palette_ref = index_of_multiplication_symbol == -1
			? pixel_data.toInt()
			: pixel_data.substring(0, index_of_multiplication_symbol).toInt();

		const auto times = index_of_multiplication_symbol == -1
			? 1
			: pixel_data.substring(index_of_multiplication_symbol + 1).toInt();

		pixel_start = pixel_end + 1;

		char hex_code[6];
		int r, g, b = 0;
		
		hex_for_position(palette, palette_ref).toCharArray(hex_code, 6, 0);
		sscanf(hex_code, "%02x%02x%02x", &r, &g, &b);

		for (auto i = 0; i < times; i++)
		{			
			strip.setPixelColor(pixel_number, Adafruit_NeoPixel::Color(r, g, b));
			pixel_number++;
		}

	} while (!at_end);

	strip.show();

	Serial.println(F("Lights set"));
}

void snake_lights::error_lights()
{
	strip.setPixelColor(0, Adafruit_NeoPixel::Color(255, 0, 0));
	for (auto i = 1; i < NUM_LIGHTS; i++) { strip.setPixelColor(i, Adafruit_NeoPixel::Color(0, 0, 0)); }
}