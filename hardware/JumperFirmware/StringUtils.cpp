#include "StringUtils.h"

void string_utils::split_string_into(const char separator, const String& raw, String* parts)
{
	auto start_at = 0;
	auto end_at = raw.indexOf(separator, start_at);

	if(end_at == -1)
	{
		parts[0] = raw;
		return;
	}

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