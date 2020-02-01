#ifndef _STRINGUTILS_h
#define _STRINGUTILS_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif


class string_utils
{
public:
	static void split_string_into(const char separator, const String& raw, String* parts);
};

#endif

