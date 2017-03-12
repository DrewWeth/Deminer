var redis = require("redis");

exports.handler = function(event, context) {

  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  console.log(" deviceId:" + event.deviceId +
  " temperature:" + event.gps +
  " deviceIP:" + event.deviceIP +
  " humidity:" + event.metalDetecter );

  client = redis.createClient("redis://romeo-v2.w80xjg.0001.use1.cache.amazonaws.com:6379");
  multi = client.multi();

  if (event.metalDetecter || event.gps) {
    multi.hmset(event.deviceId,
    "metalDetecter", event.metalDetecter,
    "gps", event.gps,
    "deviceIP", event.deviceIP,
    "timestamp", date,
    "awsRequestId", context.awsRequestId);

    multi.exec(function (err, replies) {
      if (err) {
        console.log('error updating event: ' + err);
        context.fail('error updating event: ' + err);
      } else {
        console.log('updated event ' + replies);
        context.succeed(replies);
        client.quit();
      }
    });
  }
}
