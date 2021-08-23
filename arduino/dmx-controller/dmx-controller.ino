void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.println("ready");
}

void loop() {
  // put your main code here, to run repeatedly:
  while(Serial.available() > 0) {
    String str = Serial.readString();
    if(str == "alive\n") {
      Serial.println("true");
    }
    else {
      // then it must be a value to set the dmx to so handle that here
    }
  }
}
