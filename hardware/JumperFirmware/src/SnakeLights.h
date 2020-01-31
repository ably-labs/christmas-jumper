#ifndef _SNAKELIGHTS_h
#define _SNAKELIGHTS_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif

class SnakeLightsClass
{
 protected:


 public:
	static void init();
	static void update_lights(const String& palette, const String& pixels);
	static void error_lights();
};

extern SnakeLightsClass LightManager;

#endif

