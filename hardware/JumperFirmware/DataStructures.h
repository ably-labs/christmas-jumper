#ifndef _DATASTRUCTURES_h
#define _DATASTRUCTURES_h

#if defined(ARDUINO) && ARDUINO >= 100
#include "arduino.h"
#else
#include "WProgram.h"
#endif

constexpr auto default_delay = 1000;

typedef struct
{
  const char* ssid;
  const char* password;  
} wifiCredentials;

typedef struct
{
  const char* server;
  const int port;
  const char* user;
  const char* password;
  const char* certificate;
} mqttConfiguration;

typedef struct
{  
  String root;
} httpConfiguration;

typedef struct
{
  wifiCredentials wifi;  
  httpConfiguration http;
  mqttConfiguration mqtt;  
  const char* connection_mode;
} configuration;

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
