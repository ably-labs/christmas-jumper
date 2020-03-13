#include "HttpApiPixelProvider.h"
#include "Networking.h"

api_response http_api_pixel_provider::get_image_data(image_identity* current_image_ptr)
{
	const auto server_proto_and_host = cfg_->http.root;
	const auto api_path = server_proto_and_host + "/active-image-frames?currentImageKey=";
	const auto url_to_req = api_path + current_image_ptr->image_key + "&currentFrameIndex=" + current_image_ptr->frame_index;

	const String headers[2] = {
		F("Accept: text/led-bytes"),
		F("Accept-Encoding: packed-rgb")
	};

	const auto framedata = networking::http_get(url_to_req, headers, 2);

	if (framedata.body.equals("")) {
		return invalid_api_response();
	}

	return api_response_parser::parse(framedata.body);
}
