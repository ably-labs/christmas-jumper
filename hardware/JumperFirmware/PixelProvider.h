// PixelProvider.h

#ifndef _PIXELPROVIDER_h
#define _PIXELPROVIDER_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif
#include "ApiResponseParser.h"


class pixel_provider {
public:
	virtual api_response get_image_data(image_identity& current_image) = 0;

	static api_response invalid_api_response();
};

#endif

