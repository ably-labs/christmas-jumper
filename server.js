const ActiveImageSelector = require("./commands/ActiveImageSelector");
const SongDetector = require("./commands/SongDetector");
const express = require("express");
const app = express();

app.use(express.static("public"));
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/icon.json", function(request, response) {
  response.sendFile(__dirname + "/views/icon.json");
});

app.get("/active-image", async (request, response) => {
  const selector = new ActiveImageSelector();
  const result = await selector.execute();
  response.send(result.body);
});

app.get("/what-song", async (request, response) => {
  const selector = new SongDetector();
  const result = await selector.execute();
  response.send(result.body);
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
