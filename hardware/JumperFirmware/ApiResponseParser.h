#ifndef _APIRESPONSEPARSER_h
#define _APIRESPONSEPARSER_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif
#include "DataStructures.h"

class ApiResponseParserClass
{
 protected:


 public:
	static ApiResponse parse(String framedata);
	static void copy_to(image_identity& target, const ApiResponse& from);
};

extern ApiResponseParserClass ApiResponseParser;

#endif

