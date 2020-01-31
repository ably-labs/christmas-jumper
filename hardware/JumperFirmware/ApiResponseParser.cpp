#include "ApiResponseParser.h"

auto split_string_into(const char separator, const String& raw, String* parts) -> void
{
	auto start_at = 0;
	auto end_at = raw.indexOf(separator, start_at);
	auto i = 0;

	while (end_at != -1)
	{
		parts[i] = raw.substring(start_at, end_at);

		start_at = end_at + 1;
		end_at = raw.indexOf('`', start_at);

		i++;

		if (start_at >= raw.length())
		{
			end_at = -1;
		}
	}
}

ApiResponse ApiResponseParserClass::parse(String framedata)
{
	String parts[20]; // sure whatever.
	split_string_into('`', framedata, parts);
	const ApiResponse response = {
		parts[0],
		parts[1].substring(2).toInt(),
		parts[2].substring(2).toInt(),
		parts[4].substring(0, parts[4].indexOf(',')).toInt(),
		parts[3],
		parts[4]
	};	
	return response;
}

void ApiResponseParserClass::copy_to(image_identity& target, const ApiResponse& from)
{
	target.image_key = from.image_key;
	target.frame_index = from.frame_index;
	target.frame_duration = from.total_frames == 1 ? default_delay : from.frame_display_duration;
}

ApiResponseParserClass ApiResponseParser;