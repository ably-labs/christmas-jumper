#include "Console.h"

auto console::log(const String& data) -> void
{
	Serial.println(data);
}

auto console::log(int data) -> void
{
	Serial.println(data);
}

auto console::debug(const String& data) -> void
{
#if defined(DEBUG)	
	Serial.print(data);
#endif
}

auto console::debug(int data) -> void
{
#if defined(DEBUG)	
	Serial.print(data);
#endif
}