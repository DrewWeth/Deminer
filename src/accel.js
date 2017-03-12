var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});



board.on("ready", function() {
  board.info("Starting", "Starting");

  // Create a standard `led` component instance
  var led = new five.Led(13);

  // "blink" the led in 500ms
  // on-off phase periods
  led.blink(300);

  var acceleration = new five.Accelerometer({
    controller: "MMA7660"
  });

  acceleration.on("change", function() {
    // console.log("accelerometer");
    // console.log("  x            : ", this.x);
    // console.log("  y            : ", this.y);
    // console.log("  z            : ", this.z);
    // console.log("  pitch        : ", this.pitch);
    // console.log("  roll         : ", this.roll);
    // console.log("  acceleration : ", this.acceleration);
    // console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    // console.log("--------------------------------------");
  });
});
