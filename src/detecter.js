var b = require('bonescript');
var inputPin = 2;
b.pinMode(inputPin, b.INPUT, function(resp,pin){
    setTimeout(detach, 12000);
});

// Frequency counter sketch, for measuring frequencies low enough to execute an interrupt for each cycle
// Connect the frequency source to the INT0 pin (digital pin 2 on an Arduino Uno)
var BASELINE =  60
var firstPulseTime;
var lastPulseTime;
var numPulses;

function isr() {
  // unsigned long now = micros();
  var now = process.hrtime()
  if (numPulses == 1)
  {
    firstPulseTime = now[1] / 1000.0;
  }
  else
  {
    lastPulseTime = now[1] / 1000.0;
  }
  ++numPulses;
}

// Measure the frequency over the specified sample time in milliseconds, returning the frequency in Hz
function readFrequency(sampleTime)
{
  numPulses = 0;                      // prime the system to start a new reading
  // attachInterrupt(0, isr, RISING);    // enable the interrupt
  b.attachInterrupt(inputPin, true, b.CHANGE, isr);

  sleep(sampleTime);
  detach();
  return (numPulses < 3) ? 0 : (1000000.0 * (numPulses - 2))/(lastPulseTime - firstPulseTime);
  //return (1000000.0 * (float)(numPulses - 2))/(float)(lastPulseTime - firstPulseTime);
  //return(numPulses);
}

while (true){
  var freq = readFrequency(500);
  var  freqDif = Math.abs(freq - BASELINE);
  if(freqDif > 25)
    freqDif = 25;
  console.log(freqDif);
}

function detach() {
    b.detachInterrupt(inputPin);
}

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}
