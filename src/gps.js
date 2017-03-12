/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
* Author: Jon Trulson <jtrulson@ics.com>
* Copyright (c) 2016 Intel Corporation.
*
* Permission is hereby granted, free of charge, to any person obtaining
* a copy of this software and associated documentation files (the
* "Software"), to deal in the Software without restriction, including
* without limitation the rights to use, copy, modify, merge, publish,
* distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so, subject to
* the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
* LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
* WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var b = require('bonescript');
var request = require('request');
var sensorObj = require('jsupm_nmea_gps');
var hallEffectSensor = require('jsupm_a110x');
var PubNub = require('pubnub');
var awsIot = require('aws-iot-device-sdk');
var nmea = require('nmea');
var util = require('util');

// Instantiate a Hall Effect magnet sensor on digital pin D2
var myHallEffectSensor = new hallEffectSensor.A110X(2);
var inputPin = 2;
b.pinMode(inputPin, b.INPUT, function(resp,pin){
    setTimeout(detach, 12000);
});

var BASELINE =  60
var firstPulseTime;
var lastPulseTime;
var numPulses;

// Instantiate a NMEAGPS sensor on uart 0 at 9600 baud with enable
// pin on D3
var device = awsIot.device({
  keyPath: "/home/root/connection/starfox.private.key",
  certPath: "/home/root/connection/starfox.cert.pem",
  caPath: "/home/root/connection/root-CA.crt",
  clientId: "arn:aws:iot:us-east-1:119289668576:thing/starfox",
  region: "us-east-1"
});
pubnub = new PubNub({
  publishKey : 'pub-c-e0aa4c43-9956-4417-9712-23d86e32d42a',
  subscribeKey: "sub-c-af496354-fc01-11e6-afcf-02ee2ddab7fe"
});
var sensor = new sensorObj.NMEAGPS(0, 9600, -1);
var dataPoints = [];

// exit on ^C
process.on('SIGINT', function()
{
  sensor = null;
  sensorObj.cleanUp();
  sensorObj = null;
  console.log("Exiting.");
  process.exit(0);
});

device.on('connect', function() {
  console.log('connect');
  device.publish('data-in', JSON.stringify({ save: true}));
});

device.on('message', function(topic, payload) {
  console.log('message', topic, payload.toString());
});

// loop, dumping NMEA data out as fast as it comes in
var readGPSData = function(){
  if (sensor.dataAvailable(5000))
  {
    var gga = nmea.parse(sensor.readStr(256));

    dataPoints.push({
      timestamp: gga.timestamp,
      lat: gga.lat,
      latPole: gga.latPole,
      lon: gga.lon,
      lonPole: gga.lonPole,
      numSat: gga.numSat
    });
    console.log(gga);
  }
}

var readMetalDetecter = function(){
  if (myHallEffectSensor.magnetDetected())
  dataPoints.push({mag:true});
  else
  dataPoints.push({mag:false});
}

var sendData = function(){
  if(dataPoints.length <= 0)
  return;
  publish(dataPoints);
  dataPoints = [];
}

var gatherDetecterData = function(){
  var freq = readFrequency(500);
  var  freqDif = Math.abs(freq - BASELINE);
  if(freqDif > 25)
    freqDif = 25;
  console.log(freqDif);
}

setInterval(readMetalDetecter, 750);
setInterval(readGPSData, 500);
setInterval(gatherDetecterData, 500);
setInterval(sendData, 5000);

function publish(data) {
  var publishConfig = {
    channel : "hello_world",
    message : data,
  }

  pubnub.publish(publishConfig, function(status, response) {
    console.log(status, response);
  });
  request.post(
    'https://pure-stream-85099.herokuapp.com/data',
    { json: { dataPoints: data } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}

pubnub.addListener({
  status: function(statusEvent) {
    if (statusEvent.category === "PNConnectedCategory") {
      publishSampleMessage();
    }
  },
  message: function(message) {
    console.log("New Message: ", message);
  },
  presence: function(presenceEvent) {
    // handle presence
  }
});

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


function detach() {
    b.detachInterrupt(inputPin);
}

function sleep(miliseconds) {
   var currentTime = new Date().getTime();

   while (currentTime + miliseconds >= new Date().getTime()) {
   }
}
