// #define MQTTEnabled
#include "MqttPixelProvider.h"

#if defined(MQTTEnabled)
void reconnect() {
	// Loop until we're reconnected
	while (!client.connected()) {
		Serial.print("Attempting MQTT connection...");
		// Create a random client ID
		String clientId = "ESP32Client-";
		clientId += String(random(0xffff), HEX);
		// Attempt to connect
		if (client.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD)) {
			Serial.println("connected");
			//Once connected, publish an announcement...
			client.publish("/icircuit/presence/ESP32/", "hello world");
			// ... and resubscribe
			client.subscribe(MQTT_SERIAL_RECEIVER_CH);
		}
		else {
			Serial.print("failed, rc=");
			Serial.print(client.state());
			Serial.println(" try again in 5 seconds");
			// Wait 5 seconds before retrying
			delay(5000);
		}
	}
}

void callback(char* topic, byte* payload, unsigned int length) {
	Serial.println("-------new message from broker-----");
	Serial.print("channel:");
	Serial.println(topic);
	Serial.print("data:");
	Serial.write(payload, length);
	Serial.println();
}
#endif

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{

#if defined(MQTTEnabled)
	const char* mqttServer = "m16.cloudmqtt.com";
	const int mqttPort = 12595;
	const char* mqttUser = "eapcfltj";
	const char* mqttPassword = "3EjMIy89qzVn";
	
	client.setServer(mqttServer, mqttPort);
	client.setCallback(callback);
	reconnect();
#endif
	
	return invalid_api_response();
}
