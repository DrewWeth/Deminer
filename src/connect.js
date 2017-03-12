var awsIot = require('aws-iot-device-sdk');


var device = awsIot.device({
  keyPath: "/home/root/connection/starfox.private.key",
  certPath: "/home/root/connection/starfox.cert.pem",
  caPath: "/home/root/connection/root-CA.crt",
  clientId: "arn:aws:iot:us-east-1:119289668576:thing/starfox",
  region: "us-east-1"
});


device.on('connect', function() {
  console.log('connect');
  device.subscribe('topic_1');
  device.publish('topic_2', JSON.stringify({ test_data: 1}));
});

device.on('message', function(topic, payload) {
  console.log('message', topic, payload.toString());
});
