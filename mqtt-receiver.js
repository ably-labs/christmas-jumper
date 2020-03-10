// This is for dev-testing only.
const mqtt = require('mqtt')
const express = require("express");
const app = express();
const config = require("./config");

const creds = config["ably-api-key"].split(':');

var client  = mqtt.connect("mqtts://mqtt.ably.io", {
    username: creds[0],
    password: creds[1]
});

client.on('connect', function () {
  client.subscribe('jumper', function (err) {
    if (!err) {
      client.publish('jumper', 'Hello mqtt')
    }
  })
});

client.on('message', function (topic, message) {
  console.log(topic, message.toString())

});

app.get("/status", (req, res) => {
    res.write({status: "ok"});
});

const port = process.env.PORT || 12270;
const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
