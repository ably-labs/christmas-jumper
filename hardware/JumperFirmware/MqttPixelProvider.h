#ifndef _MQTTPIXELPROVIDER_h
#define _MQTTPIXELPROVIDER_h

#include "PixelProvider.h"

class mqtt_pixel_provider final : public pixel_provider {
public:
	mqtt_pixel_provider();
	api_response get_image_data(image_identity* current_image_ptr) override;
};


#endif
