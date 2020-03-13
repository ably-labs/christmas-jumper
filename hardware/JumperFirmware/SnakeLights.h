#ifndef _SNAKELIGHTS_h
#define _SNAKELIGHTS_h

#if defined(ARDUINO) && ARDUINO >= 100
#include "arduino.h"
#else
#include "WProgram.h"
#endif

class snake_lights
{
public:
	static void init();
	static void update_lights(const String& palette, const String& pixels);
  static void set_first_pixel(const String& hex_color);
	static void error_lights();
};

#endif
