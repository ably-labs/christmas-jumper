// Console.h

#ifndef _CONSOLE_h
#define _CONSOLE_h

#if defined(ARDUINO) && ARDUINO >= 100
#include "arduino.h"
#else
#include "WProgram.h"
#endif

class console
{
public:
	static void log(const String& data);
	static void log(int data);
	static void debug(const String& data);
	static void debug(int data);
};

extern console Console;

#endif

