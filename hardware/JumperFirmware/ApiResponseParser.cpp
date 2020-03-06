#include "ApiResponseParser.h"
#include "StringUtils.h"

api_response api_response_parser::parse(const String& framedata)
{
	String parts[20]; // sure whatever.
	string_utils::split_string_into('`', framedata, parts);
	const api_response response = {
		true,
		parts[0], 												// image_key
		parts[1].substring(2).toInt(), 							// total_frames
		parts[2].substring(2).toInt(), 							// frame_index
		parts[4].substring(0, parts[4].indexOf(',')).toInt(), 	// frame_display_duration
		parts[3], 												// palette
		parts[4]  												// first frame pixels
	};	
	return response;
}

api_response api_response_parser::invalid_response()
{
	return { false,"", -1, -1, -1, "", "" };
}

void api_response_parser::copy_to(image_identity& target, const api_response& from)
{
	target.image_key = from.image_key;
	target.frame_index = from.frame_index;
	target.frame_duration = from.total_frames == 1 ? default_delay : from.frame_display_duration;
}
