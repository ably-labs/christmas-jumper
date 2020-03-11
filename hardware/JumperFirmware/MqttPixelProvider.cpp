#include "MqttPixelProvider.h"
#include "DataStructures.h"
#include "ApiResponseParser.h"

#if defined(ESP32)
#include <ssl_client.h>
#else
#include <ESP8266WiFi.h>
#endif

#include <WiFiClientSecure.h>
#include <PubSubClient.h>

WiFiClientSecure espClient;
PubSubClient client(espClient);

api_response lastMessage;

mqtt_pixel_provider::mqtt_pixel_provider() {
  lastMessage = no_data_loaded();
}

void callback(char* topic, byte* payload, unsigned int length) {
  String framedata = "";
  for (int i=0;i<length;i++) 
  {
    framedata += (char)payload[i];
  }
    
  Serial.println(framedata);
  
  if (framedata.equals("")) {
    return;
  }

  lastMessage = api_response_parser::parse(framedata);
}

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{
	if (!client.connected())
	{
    client.setServer(cfg_->mqttServer, cfg_->mqttPort);
    client.setCallback(callback);

    while (!client.connected()) 
    {    
      Serial.print("Attempting MQTT connection...");
  
      if (client.connect("arduinoClient", cfg_->mqttUser, cfg_->mqttPassword)) 
      {
        Serial.println("connected");
        client.subscribe("jumper");
      } 
      else 
      {
        Serial.print("failed, rc=");
        Serial.print(client.state());
        Serial.println(" try again in 5 seconds");
        delay(5000);
      }
    }
	}
 
  client.loop();

  const auto returnThis = lastMessage;
  lastMessage = no_data_loaded();
	return returnThis;
}
