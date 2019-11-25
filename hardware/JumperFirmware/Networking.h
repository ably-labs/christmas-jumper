// Networking.h

#ifndef _NETWORKING_h
#define _NETWORKING_h

#if defined(ARDUINO) && ARDUINO >= 100
	#include "arduino.h"
#else
	#include "WProgram.h"
#endif

class Networking
{
 protected:


 public:
	static void ensure_wifi_connected();
	static String http_get(const String urlToReq);
};

extern Networking networking;

#endif

