#include <ArduinoJson.h>
#include <DmxSimple.h>

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.println("ready");
  DmxSimple.usePin(3);
  DmxSimple.maxChannel(70);
}

void loop() {
  // put your main code here, to run repeatedly:
  while(Serial.available() > 0) {
    String serialLine = Serial.readString();
    if(!serialLine.startsWith("{")) {
      // then check if its a config message
      if(serialLine == "alive\n") {
        Serial.println("true");
      }
    }
    else {
      // then define the jsonDocument
      StaticJsonDocument<48> doc;
      DeserializationError error = deserializeJson(doc, serialLine);
      if(error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return;
      }

      // then write the channel
      DmxSimple.write(doc["channel"], doc["value"]);
      Serial.print("WRITTEN ");
      Serial.print(doc["value"]);
      Serial.print(" TO ");
      Serial.println(doc["channel"]);
    }
  }
}
