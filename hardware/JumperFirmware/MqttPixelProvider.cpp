#include "MqttPixelProvider.h"
#include "DataStructures.h"
#include "ApiResponseParser.h"
#include <WiFiClientSecure.h>

mqttConfiguration mqttConf = {
  "mqtt.ably.io",
  8883,
  "3SwaWA.eWNKzg",
  "iDGSDjPS1oSrYmXR",
  "3b b1 e6 46 12 f9 f4 ac 53 59 f4 97 99 ee 35 c9 3b 3b 46 11"
};

boolean setupCalled = false;
WiFiClientSecure espClient;

api_response lastMessage;

#if defined(ESP32)
#include <ssl_client.h>
#include <PubSubClient.h>

PubSubClient client(espClient);

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

void setupMqtt() 
{
}

void checkForMessages()
{  
  client.loop();
}

void ensureConnected() 
{
  if (!client.connected())
  {
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

#else

// ESP8266 version.

#include <ESP8266WiFi.h>
#include "Adafruit_MQTT.h"
#include "Adafruit_MQTT_Client.h"

Adafruit_MQTT_Client mqtt(&espClient, mqttConf.server, mqttConf.port, mqttConf.user, mqttConf.user, mqttConf.password);
Adafruit_MQTT_Subscribe jumperfeed = Adafruit_MQTT_Subscribe(&mqtt, "jumper");

void callback(char* data, uint16_t len) 
{
  Serial.println("esp8266 callback");
  String framedata = String(data);
  Serial.println(framedata);
  
  if (framedata.equals("")) {
    return;
  }
  
  lastMessage = api_response_parser::parse(framedata);
}

void setupMqtt() 
{
  espClient.setFingerprint(mqttConf.certificate);
  jumperfeed.setCallback(callback);  
  mqtt.subscribe(&jumperfeed);
}

void ensureConnected() 
{
  if (mqtt.connected()) {
    return;
  }

  Serial.print("Connecting to MQTT... ");

  int8_t ret;
  while ((ret = mqtt.connect()) != 0) {
       Serial.println(mqtt.connectErrorString(ret));
       Serial.println("Retrying MQTT connection in 5 seconds...");
       mqtt.disconnect();
       delay(5000);
  }
  
  Serial.println("MQTT Connected!");
}

void checkForMessages()
{    
  mqtt.processPackets(10000);
  
  if(! mqtt.ping()) {
    mqtt.disconnect();
  }
}

#endif


mqtt_pixel_provider::mqtt_pixel_provider() {
  lastMessage = no_data_loaded();
}

api_response mqtt_pixel_provider::get_image_data(image_identity* current_image_ptr)
{  
  if(!setupCalled)
  {
    setupMqtt();
    setupCalled = true;
  }
  
  ensureConnected();
  checkForMessages();
  
  const auto returnThis = lastMessage;
  lastMessage = no_data_loaded();
  return returnThis;
}
