// MqttPixelProvider.h

#ifndef _MQTTPIXELPROVIDER_h
#define _MQTTPIXELPROVIDER_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif

#include "PixelProvider.h"

class mqtt_pixel_provider final : public pixel_provider {
public:
	api_response get_image_data(image_identity& current_image) override;
};


#endif

