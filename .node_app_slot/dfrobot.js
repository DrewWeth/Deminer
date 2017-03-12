/*
* Copyright (c) 2015 - 2016 Intel Corporation.
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

"use strict";

var exports = module.exports = {};

// The program is using the `mraa` module
// to communicate directly with the digital
// pin used to turn on/off the buzzer
var mraa = require("mraa");

var buzzer, air;

// Initialize the DFRobot hardware devices
exports.init = function(config) {
  if (config.platform == "firmata") {
    // open connection to firmata
    mraa.addSubplatform(mraa.GENERIC_FIRMATA, "/dev/ttyACM0");

    buzzer = new mraa.Gpio(15 + 512); // aka A1
    air = new (require("jsupm_gas").MQ2)(3 + 512); // aka A3
  } else {
    buzzer = new mraa.Gpio(15); // aka A1
    air = new (require("jsupm_gas").MQ2)(3); // aka A3
  }

  buzzer.dir(mraa.DIR_OUT);
  buzzer.write(0);

  return;
}

// Plays a sound using the buzzer
exports.chime = function() {
  buzzer.write(1);
  setTimeout(function() {
    buzzer.write(0);
  }, 1000)
}

// Returns the current value for the air quality sensor
exports.getAirSample = function() {
  return air.getSample()
}
