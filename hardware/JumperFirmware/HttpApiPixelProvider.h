// HttpApiPixelProvider.h

#ifndef _HTTPAPIPIXELPROVIDER_h
#define _HTTPAPIPIXELPROVIDER_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif
#include "ApiResponseParser.h"
#include "PixelProvider.h"

class http_api_pixel_provider final : public pixel_provider {
public:
	api_response get_image_data(image_identity& current_image) override;
};

#endif

