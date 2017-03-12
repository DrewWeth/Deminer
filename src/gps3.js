var awsIot = require('aws-iot-device-sdk');
var GPSSensor = require('jsupm_ublox6');
// Instantiate a Ublox6 GPS device on uart 0.
var myGPSSensor = new GPSSensor.Ublox6(0);
var device = awsIot.device({
   keyPath: "$HOME/connection/",
  certPath: "$HOME/connection/",
    caPath: "$HOME/connection/",
  clientId: "arn:aws:iot:us-east-1:119289668576:thing/starfox",
    region: "us-east-1"
});

if (!myGPSSensor.setupTty(GPSSensor.int_B9600))
{
	console.log("Failed to setup tty port parameters");
	process.exit(0);
}
// Collect and output NMEA data.

// This device also supports numerous configuration options, which
// you can set with writeData().  Please refer to the Ublox-6 data
// sheet for further information on the formats of the data sent and
// received, and the various operating modes available.

var bufferLength = 256;
var nmeaBuffer  = new GPSSensor.charArray(bufferLength);

function getGPSInfo()
{
	// we don't want the read to block in this example, so always
	// check to see if data is available first.
	if (myGPSSensor.dataAvailable())
	{
		var rv = myGPSSensor.readData(nmeaBuffer, bufferLength);

		var GPSData, dataCharCode, isNewLine, lastNewLine;
		var numlines= 0;
		if (rv > 0)
		{
			GPSData = "";
			// read only the number of characters
			// specified by myGPSSensor.readData
			for (var x = 0; x < rv; x++)
				GPSData += nmeaBuffer.getitem(x);
			process.stdout.write(GPSData)
		}

		if (rv < 0) // some sort of read error occured
		{
			console.log("Port read error.");
			process.exit(0);
		}
	}
}

setInterval(getGPSInfo, 100);

// Print message when exiting
process.on('SIGINT', function()
{
	console.log("Exiting...");
	process.exit(0);
});

device.on('connect', function() {
    console.log('connect');
    device.subscribe('topic_1');
    device.publish('topic_2', JSON.stringify({ test_data: 1}));
    });

device.on('message', function(topic, payload) {
    console.log('message', topic, payload.toString());
  });
