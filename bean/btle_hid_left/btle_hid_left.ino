//https://punchthrough.com/bean/docs/guides/features/hid/


void setup() {

  //Serial.begin(57600);
  ///Serial.println("ok!");
  BeanHid.enable();
  Bean.enableMotionEvent(FLAT_EVENT);
  
}

void loop() {
  AccelerationReading accel = Bean.getAcceleration();
  
    
  int x = abs(accel.xAxis) / 2;
  int y = abs(accel.yAxis) / 2;
  int z = abs(accel.zAxis) / 2;

  int a = x + y + z;
  //Serial.println("a");
  //Serial.println(a);
//https://punchthrough.com/files/bean/arduino-core-docs/1.8.0-beta2/class_bean_hid__.html#acf1c04f167558c6d9c11c40e1a2d1cf7

  if (Bean.checkMotionEvent(FLAT_EVENT)){
    int k = BeanHid.sendKey('b'); 
    delay(2.0);
  }else{
    if(a > 400){
//    Serial.println("space!");l
  //  Serial.println(a);
    //Serial.println("");
      int k = BeanHid.sendKey('l');    
    }
  }  
  delay(0.1);
}
