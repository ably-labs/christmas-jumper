const JumperApi = require("./commands/JumperApi");
const express = require("express");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static("public"));
app.use("/", express.static(__dirname + "/public", { index: "index.html" }));

const jumperApiSingleton = new JumperApi();

app.get("/active-image", async (request, response) => {
  const result = await jumperApiSingleton.getActiveImageKey();
  response.send(result.body);
});

app.post("/what-song", async (request, response) => {
  const result = await jumperApiSingleton.detectSongFromClip(request.body.bytes);
  response.send(result.body);
});

const port = process.env.PORT | 12271;
const listener = app.listen(port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});