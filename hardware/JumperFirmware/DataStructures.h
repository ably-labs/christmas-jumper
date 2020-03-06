#ifndef _DATASTRUCTURES_h
#define _DATASTRUCTURES_h

constexpr auto default_delay = 1000;

typedef struct
{
	String image_key;
	int frame_index;
	int frame_duration;
} image_identity;


typedef struct
{
	bool loaded;
	String image_key;
	long total_frames;
	long frame_index;
	int frame_display_duration;
	String palette;
	String pixels;
} api_response;

typedef struct
{
	int status;
	String headers;
	String body;
} http_response;


#endif