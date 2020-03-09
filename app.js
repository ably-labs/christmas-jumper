const express = require("express");
const bodyParser = require('body-parser');
const commandHandlers = require("./handlerFactory");

const app = express();

// Configure express to support parsing base64 chunks of audio in json
// The default message body that can be parsed is ~100kb, and our audio
// snippets are going to be a little bit longer than that (200-300kb)
// 50mb is probably... somewhat gracious, but ¯\_(ツ)_/¯
app.use(bodyParser.json({limit: '50mb'}));

// Host static UI
app.use(express.static("public"));
app.use("/", express.static(__dirname + "/public", { index: "index.html" }));

// Map routes to handlers
app.get("/active-image", async (req, res) => await commandHandlers.getActiveImage.execute(req, res));
app.get("/active-image-frames", async (req, res) => await commandHandlers.getActiveImageFrames.execute(req, res));
app.post("/what-song", async  (req, res) => await commandHandlers.whatSong.execute(req, res));

app["setMostRecentSong"] = (song) => { // Testing hook.
    commandHandlers.state.save(song);
};

module.exports = app;