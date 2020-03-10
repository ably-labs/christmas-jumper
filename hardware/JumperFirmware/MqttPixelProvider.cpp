#include "MqttPixelProvider.h"
#include <ssl_client.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

WiFiClientSecure espClient;
PubSubClient client(espClient);

String lastMessage;

const char* mqttServer = "mqtt.ably.io";
const int mqttPort = 8883;
const char* mqttUser = "3SwaWA.eWNKzg";
const char* mqttPassword = "iDGSDjPS1oSrYmXR";


mqtt_pixel_provider::mqtt_pixel_provider() {

}

void reconnect()
{
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("arduinoClient", mqttUser, mqttPassword)) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("jumper","hello world");
      // ... and resubscribe
      client.subscribe("jumper");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
	lastMessage = "something arrived";
}

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{
	if (!client.connected())
	{
    client.setServer(mqttServer, mqttPort);
    client.setCallback(callback);
		reconnect();
	}
 
  client.loop();
 
	return invalid_api_response();
}
