#include "MqttPixelProvider.h"
#include "DataStructures.h"
#include "ApiResponseParser.h"
#include <WiFiClientSecure.h>
#include <MQTT.h>

WiFiClientSecure espClient;
MQTTClient client(4096);

api_response lastMessage;

void messageReceived(String &topic, String &framedata) {
  Serial.println("incoming: " + topic + " - " + framedata);
  
  if (framedata.equals("")) {
    return;
  }
  
  lastMessage = api_response_parser::parse(framedata);
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

void ensureConnected(configuration* cfg_) 
{
  if (!client.connected())
  {    
    espClient.setFingerprint(cfg_->mqtt.certificate);
    client.begin(cfg_->mqtt.server, cfg_->mqtt.port, espClient);
    client.onMessage(messageReceived);

    while (!client.connected()) 
    {    
      Serial.print("Attempting MQTT connection...");
  
      if (client.connect("arduinoClient", cfg_->mqtt.user, cfg_->mqtt.password)) 
      {
        Serial.println("connected");
        client.subscribe("jumper");
      } 
      else 
      {
        Serial.print("failed");
        Serial.println(" try again in 5 seconds");
        delay(5000);
      }
    }
  }
}

mqtt_pixel_provider::mqtt_pixel_provider() {
  lastMessage = no_data_loaded();
}

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{    
  ensureConnected(cfg_);
  client.loop();
  
  const auto returnThis = lastMessage;
  lastMessage = no_data_loaded();
  return returnThis;
}
