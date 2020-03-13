#include "MqttPixelProvider.h"
#include "DataStructures.h"
#include "ApiResponseParser.h"
#include <WiFiClientSecure.h>

// This doesn't work in the Arduino IDE
// You have to override the value defined in PubSubClient.h
// But once you do, this implementation is fine.
// Gonna try another libary to avoid this.

#define MQTT_MAX_PACKET_SIZE 4096

#include <PubSubClient.h>

mqttConfiguration mqttConf = {
  "mqtt.ably.io",
  8883,
  "3SwaWA.eWNKzg",
  "iDGSDjPS1oSrYmXR",
  "3b b1 e6 46 12 f9 f4 ac 53 59 f4 97 99 ee 35 c9 3b 3b 46 11"
};

WiFiClientSecure espClient;
PubSubClient client(espClient);

api_response lastMessage;

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

void ensureConnected() 
{
  if (!client.connected())
  {    
    espClient.setFingerprint(mqttConf.certificate);
    client.setServer(mqttConf.server, mqttConf.port);
    client.setCallback(callback);

    while (!client.connected()) 
    {    
      Serial.print("Attempting MQTT connection...");
  
      if (client.connect("arduinoClient", mqttConf.user, mqttConf.password)) 
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
}

mqtt_pixel_provider::mqtt_pixel_provider() {
  lastMessage = no_data_loaded();
}

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{    
  ensureConnected();
  client.loop();
  
  const auto returnThis = lastMessage;
  lastMessage = no_data_loaded();
  return returnThis;
}
