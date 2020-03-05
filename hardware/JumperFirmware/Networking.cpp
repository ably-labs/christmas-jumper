#if defined(ESP32)
#include <WiFi.h>
#else
#include <ESP8266WiFi.h>
#endif

#include "DataStructures.h"
#include "Networking.h"

auto networking::ensure_wifi_connected(const char* const ssid, const char* const password) -> void
{
	if (WiFi.status() == WL_CONNECTED)
	{
		Serial.println(F("WiFi already connected."));
		return;
	}

	Serial.print(F("Connecting to "));
	Serial.print(ssid);
	Serial.println();

	WiFi.begin(ssid, password);

	while (WiFi.status() != WL_CONNECTED) {
		delay(100);
		Serial.print(".");
	}

	Serial.println(F("WiFi connected"));
}

auto networking::http_get(const String& url_to_req, const String headers[], const int header_count) -> http_response
{
	Serial.println("Requesting: " + url_to_req);

	const auto index_of_protocol = url_to_req.indexOf("://") + 3;
	const auto without_protocol = url_to_req.substring(index_of_protocol);
	const auto index_of_port = without_protocol.indexOf(":");
	const auto index_of_path = without_protocol.indexOf("/");
	const auto url = without_protocol.substring(index_of_path);
	const auto port = index_of_port != 1 ? without_protocol.substring(index_of_port + 1, index_of_path).toInt() : 80;
	const auto host = index_of_port == -1 ? without_protocol.substring(0, index_of_path) : without_protocol.substring(0, index_of_port);
	const auto _ = String("");

#if defined(ESP32)
	const auto hostStr = host.c_str();
#else
	const auto hostStr = host;
#endif

	WiFiClient client;

	if (!client.connect(hostStr, port)) {
		Serial.println(F("connection failed."));
		return { 500, _, _ };;
	}

	Serial.println(F("Connected."));

	client.println("GET " + url + " HTTP/1.0");
	client.println("Host: " + host);

	for (auto i = 0; i < header_count; i++)
	{
		client.println(headers[i].c_str());
	}

	client.println(F("Connection: close"));
	if (client.println() == 0) {
		Serial.println(F("Failed to send request"));
		return { 400, _, _ };
	}

	char status[32] = { 0 };
	client.readBytesUntil('\r', status, sizeof(status));

	Serial.println(status);

	if (strcmp(status + 9, "200 OK") != 0) {
		Serial.println(F("Status code wasn't 200."));
		return { 500, _, _ };;
	}

	String response;
	while (client.available())
	{
		response += client.readStringUntil('\r');
	}

	const String delimiter = F("Connection: close");
	const auto index_of_close = response.lastIndexOf(delimiter);
	auto body = response.substring(index_of_close + delimiter.length());
	body.trim();

	Serial.println(F("Request completed, returned:"));
	Serial.println(body);

	return { 200, _, body };
}