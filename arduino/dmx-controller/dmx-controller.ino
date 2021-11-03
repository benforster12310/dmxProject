#include <ArduinoJson.h>
#include <DmxSimple.h>

void setup() {
  // put your setup code here, to run once:
  Serial.begin(19200);
  Serial.setTimeout(100000);
  Serial.println("ready");
  DmxSimple.usePin(3);
  DmxSimple.maxChannel(70);
}

void loop() {
  // put your main code here, to run repeatedly:
  while(Serial.available() > 0) {
      // then define the jsonDocument
      StaticJsonDocument<48> doc;
      DeserializationError error = deserializeJson(doc, Serial);
      if(error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return;
      }

      // then write the channel
      DmxSimple.write(doc["channel"].as<int>(), doc["value"].as<int>());
    }
}
