const express = require("express");
const bodyParser = require('body-parser');

const InMemoryCurrentSongStorage = require("./features/state-management/InMemoryCurrentSongStorage");
const GetActiveImageCommand = require("./commands/ActiveImageCommand");
const GetActiveImageFramesCommand = require("./commands/ActiveImageFramesCommand");
const WhatSongCommand = require("./commands/WhatSongCommand");

const state = new InMemoryCurrentSongStorage();
const getActiveImage = new GetActiveImageCommand(state);
const getActiveImageFrames =  new GetActiveImageFramesCommand(state);
const whatSong =  new WhatSongCommand(state);

const app = express();

// Configure express to support parsing base64 chunks of audio in json
// The default message body that can be parsed is ~100kb, and our audio
// snippets are going to be a little bit longer than that (200-300kb)
// 50mb is probably... somewhat gracious, but ¯\_(ツ)_/¯

app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static("public"));
app.use("/", express.static(__dirname + "/public", { index: "index.html" }));

app.get("/active-image", async (req, res) => await getActiveImage.execute(req, res));
app.get("/active-image-frames", async (req, res) => await getActiveImageFrames.execute(req, res));
app.post("/what-song", async  (req, res) => await whatSong.execute(req, res));

app["setMostRecentSong"] = (song) => { // Testing hook.
    state.save(song);
};

module.exports = app;
