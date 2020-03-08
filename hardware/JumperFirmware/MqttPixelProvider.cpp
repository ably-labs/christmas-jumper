//#define MQTTEnabled
#include "MqttPixelProvider.h"

#if defined(MQTTEnabled)

#include <PubSubClient.h>

PubSubClient client;
String lastMessage;

const char* mqttServer = "test.mosquitto.org";
const int mqttPort = 1883;
const char* mqttUser = "";
const char* mqttPassword = "";

mqtt_pixel_provider::mqtt_pixel_provider() {

}

void reconnect()
{
	client.setServer(mqttServer, mqttPort);
	// Loop until we're reconnected
	while (!client.connected()) {
		Serial.print("Attempting MQTT connection...");
		// Create a random client ID
		String client_id = "ESP32Client-";
		client_id += String(random(0xffff), HEX);
		// Attempt to connect
		if (client.connect(client_id.c_str(), mqttUser, mqttPassword)) {
			Serial.println("connected");
			client.publish("/icircuit/presence/ESP32/", "hello world");
			// ... and resubscribe
			//client.subscribe(MQTT_SERIAL_RECEIVER_CH);
		}
		else {
			Serial.print("failed, rc=");
			Serial.print(client.state());
			Serial.println(" try again in 5 seconds");
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
	lastMessage = "something arrived";
}
#endif

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{

#if defined(MQTTEnabled)
	if (!client.connected())
	{
		client.setServer(mqttServer, mqttPort);
		client.setCallback(callback);
		reconnect();
	}
#endif

	
	return invalid_api_response();
}
