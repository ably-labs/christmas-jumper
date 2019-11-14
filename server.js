const ActiveImageSelector = require("./commands/ActiveImageSelector");
const SongDetector = require("./commands/SongDetector");

const express = require("express");
const bodyParser = require('body-parser');
const app = express();

app.use(express.static("public"));
app.use(bodyParser.json({limit: '50mb'}));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/active-image", async (request, response) => {
  const selector = new ActiveImageSelector();
  const result = await selector.execute();
  response.send(result.body);
});

app.post("/what-song", async (request, response) => {
  const byteArray = Buffer.from(request.body.bytes, 'base64');
  const selector = new SongDetector();
  const result = await selector.execute(byteArray);
  response.send(result.body);
});

const port = process.env.PORT | 12271;
const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
