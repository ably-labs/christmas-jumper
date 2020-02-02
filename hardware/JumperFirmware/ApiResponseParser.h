#ifndef _APIRESPONSEPARSER_h
#define _APIRESPONSEPARSER_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif
#include "DataStructures.h"

class api_response_parser
{
public:
	static api_response parse(const String& framedata);
	static void copy_to(image_identity& target, const api_response& from);
};

extern api_response_parser apiResponseParser;

#endif

