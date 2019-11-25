#include <ESP8266WiFi.h>
#include "Networking.h"

constexpr auto ssid = "asgard_router1";;
constexpr auto password = "godhatesfangs";

auto Networking::ensure_wifi_connected() -> void
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

auto Networking::http_get(const String urlToReq) -> String
{
	Serial.println("Requesting: " + urlToReq);

	const auto index_of_protocol = urlToReq.indexOf("://") + 3;
	const auto without_protocol = urlToReq.substring(index_of_protocol);
	const auto index_of_port = without_protocol.indexOf(":");
	const auto index_of_path = without_protocol.indexOf("/");
	const auto url = without_protocol.substring(index_of_path);
	const auto port = index_of_port != 1 ? without_protocol.substring(index_of_port + 1, index_of_path).toInt() : 80;
	const auto host = index_of_port == -1 ? without_protocol.substring(0, index_of_path) : without_protocol.substring(0, index_of_port);

	WiFiClient client;

	if (!client.connect(host, port)) {
		Serial.println(F("connection failed."));
		return "";
	}

	client.println("GET " + url + " HTTP/1.0");
	client.println("Host: " + host);
	client.println(F("Connection: close"));
	if (client.println() == 0) {
		Serial.println(F("Failed to send request"));
		return "";
	}

	char status[32] = { 0 };
	client.readBytesUntil('\r', status, sizeof(status));
	if (strcmp(status + 9, "200 OK") != 0) {
		Serial.println(F("Status code wasn't 200."));
		return "";
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
	return body;
}

Networking networking;