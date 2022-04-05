 #include <ArduinoJson.h>
#include <DmxSimple.h>

const int function1ButtonPin = 4;
const int function2ButtonPin = 5;
const int function3ButtonPin = 6;
const int function4ButtonPin = 7;
const int function5ButtonPin = 8;
bool function1ButtonToggled = false;
bool function2ButtonToggled = false;
bool function3ButtonToggled = false;
bool function4ButtonToggled = false;
bool function5ButtonToggled = false;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(19200);
  Serial.setTimeout( 000);
  Serial.println("ready");
  DmxSimple.usePin(3);
  DmxSimple.maxChannel(70);
  pinMode(function1ButtonPin, INPUT_PULLUP);
  pinMode(function2ButtonPin, INPUT_PULLUP);
  pinMode(function3ButtonPin, INPUT_PULLUP);
  pinMode(function4ButtonPin, INPUT_PULLUP);
  pinMode(function5ButtonPin, INPUT_PULLUP);
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
      DmxSimple.write(doc["c"].as<int>(), doc["v"].as<int>());
  }
  // then check for any button presses
  if(digitalRead(function1ButtonPin) == LOW) {
    if(function1ButtonToggled == false) {
      // then do function 1 - dim uplights
      Serial.println("Doing Function 1");
      DmxSimple.write(1,255);
      DmxSimple.write(2,40);
      DmxSimple.write(3,40);
      DmxSimple.write(4,40);
      DmxSimple.write(5,255);
      DmxSimple.write(6,40);
      DmxSimple.write(7,40);
      DmxSimple.write(8,40);
      DmxSimple.write(9,255);
      DmxSimple.write(10,40);
      DmxSimple.write(11,40);
      DmxSimple.write(12,40);
      DmxSimple.write(13,255);
      DmxSimple.write(14,40);
      DmxSimple.write(15,40);
      DmxSimple.write(16,40);
      function1ButtonToggled = true;
      delay(500);
    }
    else {
      DmxSimple.write(1,0);
      DmxSimple.write(2,0);
      DmxSimple.write(3,0);
      DmxSimple.write(4,0);
      DmxSimple.write(5,0);
      DmxSimple.write(6,0);
      DmxSimple.write(7,0);
      DmxSimple.write(8,0);
      DmxSimple.write(9,0);
      DmxSimple.write(10,0);
      DmxSimple.write(11,0);
      DmxSimple.write(12,0);
      DmxSimple.write(13,0);
      DmxSimple.write(14,0);
      DmxSimple.write(15,0);
      DmxSimple.write(16,0);
      function1ButtonToggled = false;
      function2ButtonToggled = false;
      delay(500);
    }
  }
  if(digitalRead(function2ButtonPin) == LOW) {
    if(function2ButtonToggled == false) {
      // then do function 2 - bright uplights
      DmxSimple.write(1,255);
      DmxSimple.write(2,255);
      DmxSimple.write(3,255);
      DmxSimple.write(4,255);
      DmxSimple.write(5,255);
      DmxSimple.write(6,255);
      DmxSimple.write(7,255);
      DmxSimple.write(8,255);
      DmxSimple.write(9,255);
      DmxSimple.write(10,255);
      DmxSimple.write(11,255);
      DmxSimple.write(12,255);
      DmxSimple.write(13,255);
      DmxSimple.write(14,255);
      DmxSimple.write(15,255);
      DmxSimple.write(16,255);
      function2ButtonToggled = true;
      delay(500);
    }
    else {
      DmxSimple.write(1,0);
      DmxSimple.write(2,0);
      DmxSimple.write(3,0);
      DmxSimple.write(4,0);
      DmxSimple.write(5,0);
      DmxSimple.write(6,0);
      DmxSimple.write(7,0);
      DmxSimple.write(8,0);
      DmxSimple.write(9,0);
      DmxSimple.write(10,0);
      DmxSimple.write(11,0);
      DmxSimple.write(12,0);
      DmxSimple.write(13,0);
      DmxSimple.write(14,0);
      DmxSimple.write(15,0);
      DmxSimple.write(16,0);
      function1ButtonToggled = false;
      function2ButtonToggled = false;
      delay(500);
    }
  }
  if(digitalRead(function3ButtonPin) == LOW) {
    if(function3ButtonToggled == false) {
      // then do function 3 - dim downlights
      DmxSimple.write(17,255);
      DmxSimple.write(18,40);
      DmxSimple.write(19,40);
      DmxSimple.write(20,40);
      DmxSimple.write(21,255);
      DmxSimple.write(22,40);
      DmxSimple.write(23,40);
      DmxSimple.write(24,40);
      DmxSimple.write(25,255);
      DmxSimple.write(26,40);
      DmxSimple.write(27,40);
      DmxSimple.write(28,40);
      DmxSimple.write(29,255);
      DmxSimple.write(30,40);
      DmxSimple.write(31,40);
      DmxSimple.write(32,40);
      DmxSimple.write(33,255);
      DmxSimple.write(34,40);
      DmxSimple.write(35,40);
      DmxSimple.write(36,40);
      DmxSimple.write(37,40);
      function3ButtonToggled = true;
      delay(500);
    }
    else {
      DmxSimple.write(17,0);
      DmxSimple.write(18,0);
      DmxSimple.write(19,0);
      DmxSimple.write(20,0);
      DmxSimple.write(21,0);
      DmxSimple.write(22,0);
      DmxSimple.write(23,0);
      DmxSimple.write(24,0);
      DmxSimple.write(25,0);
      DmxSimple.write(26,0);
      DmxSimple.write(27,0);
      DmxSimple.write(28,0);
      DmxSimple.write(29,0);
      DmxSimple.write(30,0);
      DmxSimple.write(31,0);
      DmxSimple.write(32,0);
      DmxSimple.write(33,0);
      DmxSimple.write(34,0);
      DmxSimple.write(35,0);
      DmxSimple.write(36,0);
      DmxSimple.write(37,0);
      function3ButtonToggled = false;
      function4ButtonToggled = false;
      delay(500);
    }
  }
  if(digitalRead(function4ButtonPin) == LOW) {
    if(function4ButtonToggled == false) {
      // then do function 4 - bright downlights
      DmxSimple.write(17,255);
      DmxSimple.write(18,255);
      DmxSimple.write(19,255);
      DmxSimple.write(20,255);
      DmxSimple.write(21,255);
      DmxSimple.write(22,255);
      DmxSimple.write(23,255);
      DmxSimple.write(24,255);
      DmxSimple.write(25,255);
      DmxSimple.write(26,255);
      DmxSimple.write(27,255);
      DmxSimple.write(28,255);
      DmxSimple.write(29,255);
      DmxSimple.write(30,255);
      DmxSimple.write(31,255);
      DmxSimple.write(32,255);
      DmxSimple.write(33,255);
      DmxSimple.write(34,255);
      DmxSimple.write(35,255);
      DmxSimple.write(36,255);
      DmxSimple.write(37,255);
      function4ButtonToggled = true;
      delay(500);
    }
    else {
      DmxSimple.write(17,0);
      DmxSimple.write(18,0);
      DmxSimple.write(19,0);
      DmxSimple.write(20,0);
      DmxSimple.write(21,0);
      DmxSimple.write(22,0);
      DmxSimple.write(23,0);
      DmxSimple.write(24,0);
      DmxSimple.write(25,0);
      DmxSimple.write(26,0);
      DmxSimple.write(27,0);
      DmxSimple.write(28,0);
      DmxSimple.write(29,0);
      DmxSimple.write(30,0);
      DmxSimple.write(31,0);
      DmxSimple.write(32,0);
      DmxSimple.write(33,0);
      DmxSimple.write(34,0);
      DmxSimple.write(35,0);
      DmxSimple.write(36,0);
      DmxSimple.write(37,0);
      function3ButtonToggled = false;
      function4ButtonToggled = false;
      delay(500);
    }
  }
  if(digitalRead(function5ButtonPin) == LOW) {
    if(function5ButtonToggled == false) {
      // then do function 5 - emergency lighs
      DmxSimple.write(1,255);
      DmxSimple.write(2,255);
      DmxSimple.write(3,255);
      DmxSimple.write(4,255);
      DmxSimple.write(5,255);
      DmxSimple.write(6,255);
      DmxSimple.write(7,255);
      DmxSimple.write(8,255);
      DmxSimple.write(9,255);
      DmxSimple.write(10,255);
      DmxSimple.write(11,255);
      DmxSimple.write(12,255);
      DmxSimple.write(13,255);
      DmxSimple.write(14,255);
      DmxSimple.write(15,255);
      DmxSimple.write(16,255);
      DmxSimple.write(17,255);
      DmxSimple.write(18,255);
      DmxSimple.write(19,255);
      DmxSimple.write(20,255);
      DmxSimple.write(21,255);
      DmxSimple.write(22,255);
      DmxSimple.write(23,255);
      DmxSimple.write(24,255);
      DmxSimple.write(25,255);
      DmxSimple.write(26,255);
      DmxSimple.write(27,255);
      DmxSimple.write(28,255);
      DmxSimple.write(29,255);
      DmxSimple.write(30,255);
      DmxSimple.write(31,255);
      DmxSimple.write(32,255);
      DmxSimple.write(33,255);
      DmxSimple.write(34,255);
      DmxSimple.write(35,255);
      DmxSimple.write(36,255);
      DmxSimple.write(37,255);
      DmxSimple.write(41,255);
      DmxSimple.write(45,255);
      DmxSimple.write(46,255);
      DmxSimple.write(47,255);
      DmxSimple.write(48,255);
      DmxSimple.write(49,255);
      DmxSimple.write(53,255);
      DmxSimple.write(54,255);
      DmxSimple.write(55,255);
      DmxSimple.write(56,255);
      function5ButtonToggled = true;
      delay(500);
    }
    else {
      DmxSimple.write(1,0);
      DmxSimple.write(2,0);
      DmxSimple.write(3,0);
      DmxSimple.write(4,0);
      DmxSimple.write(5,0);
      DmxSimple.write(6,0);
      DmxSimple.write(7,0);
      DmxSimple.write(8,0);
      DmxSimple.write(9,0);
      DmxSimple.write(10,0);
      DmxSimple.write(11,0);
      DmxSimple.write(12,0);
      DmxSimple.write(13,0);
      DmxSimple.write(14,0);
      DmxSimple.write(15,0);
      DmxSimple.write(16,0);
      DmxSimple.write(17,0);
      DmxSimple.write(18,0);
      DmxSimple.write(19,0);
      DmxSimple.write(20,0);
      DmxSimple.write(21,0);
      DmxSimple.write(22,0);
      DmxSimple.write(23,0);
      DmxSimple.write(24,0);
      DmxSimple.write(25,0);
      DmxSimple.write(26,0);
      DmxSimple.write(27,0);
      DmxSimple.write(28,0);
      DmxSimple.write(29,0);
      DmxSimple.write(30,0);
      DmxSimple.write(31,0);
      DmxSimple.write(32,0);
      DmxSimple.write(33,0);
      DmxSimple.write(34,0);
      DmxSimple.write(35,0);
      DmxSimple.write(36,0);
      DmxSimple.write(37,0);
      DmxSimple.write(41,0);
      DmxSimple.write(45,0);
      DmxSimple.write(46,0);
      DmxSimple.write(47,0);
      DmxSimple.write(48,0);
      DmxSimple.write(49,0);
      DmxSimple.write(53,0);
      DmxSimple.write(54,0);
      DmxSimple.write(55,0);
      DmxSimple.write(56,0);
      function1ButtonToggled = false;
      function2ButtonToggled = false;
      function3ButtonToggled = false;
      function4ButtonToggled = false;
      function5ButtonToggled = false;
      delay(500);
    }
  }
}
