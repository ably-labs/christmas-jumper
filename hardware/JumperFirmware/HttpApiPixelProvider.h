#ifndef _HTTPAPIPIXELPROVIDER_h
#define _HTTPAPIPIXELPROVIDER_h

#include "DataStructures.h"
#include "PixelProvider.h"

class http_api_pixel_provider final : public pixel_provider {
public:
	api_response get_image_data(image_identity* current_image_ptr) override;
};

#endif