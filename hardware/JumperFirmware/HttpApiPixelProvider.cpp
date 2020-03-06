#include "HttpApiPixelProvider.h"
#include "Networking.h"

api_response http_api_pixel_provider::get_image_data(image_identity& current_image)
{
	const String server_proto_and_host = "http://192.168.1.75:12271";
	const auto api_path = server_proto_and_host + "/active-image-frames?currentImageKey=";
	const auto url_to_req = api_path + current_image.image_key + "&currentFrameIndex=" + current_image.frame_index;

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
