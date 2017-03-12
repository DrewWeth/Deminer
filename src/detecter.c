// Frequency counter sketch, for measuring frequencies low enough to execute an interrupt for each cycle
// Connect the frequency source to the INT0 pin (digital pin 2 on an Arduino Uno)
#define tolerance 5
#define baseline 60
volatile unsigned long firstPulseTime;
volatile unsigned long lastPulseTime;
volatile unsigned long numPulses;

void isr()
{
 unsigned long now = micros();
 if (numPulses == 1)
 {
   firstPulseTime = now;
 }
 else
 {
   lastPulseTime = now;
 }
 ++numPulses;
}

void setup()
{
 Serial.begin(9600);    // this is here so that we can print the result
}

// Measure the frequency over the specified sample time in milliseconds, returning the frequency in Hz
float readFrequency(unsigned int sampleTime)
{
 numPulses = 0;                      // prime the system to start a new reading
 attachInterrupt(0, isr, RISING);    // enable the interrupt
 delay(sampleTime);
 detachInterrupt(0);
return (numPulses < 3) ? 0 : (1000000.0 * (float)(numPulses - 2))/(float)(lastPulseTime - firstPulseTime);
//return (1000000.0 * (float)(numPulses - 2))/(float)(lastPulseTime - firstPulseTime);
//return(numPulses);
}
void loop()
{
 float freq = readFrequency(500);
 float  freqDif = abs(freq - baseline);
  if(freqDif > 25) freqDif = 25;
  freqDif = freqDif;
Serial.println(freqDif);
 delay(1);
}
