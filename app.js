const JumperApi = require("./commands/JumperApi");
const FrameSerializer = require("./commands/FrameSerializer");
const express = require("express");
const bodyParser = require('body-parser');

const app = express();

// Configure express to support parsing base64 chunks of audio in json
// The default message body that can be parsed is ~100kb, and our audio
// snippets are going to be a little bit longer than that (200-300kb)
// 50mb is probably... somewhat gracious, but ¯\_(ツ)_/¯

app.use(bodyParser.json({limit: '50mb'}));

// Serve our front-end HTML for audio recording

app.use(express.static("public"));
app.use("/", express.static(__dirname + "/public", { index: "index.html" }));

// Create instance of the Jumper API and wire it up to our Urls
// /active-image maps to getActiveImageKey() - returns the most recently identified image-key.
// /what-song accepts a json wrapped base64 encoded ogg-opus audio snippet from the MediaRecorder browser API

const jumperApiSingleton = new JumperApi();

app.get("/active-image", async (request, response) => {
    const result = await jumperApiSingleton.getActiveImageKey();
    response.send(result.body);
});

app.get("/active-image-frames", async (request, response) => {    
    const result = await jumperApiSingleton.getActiveImageFrame(request.query.currentImageKey, parseInt(request.query.currentFrameIndex));
    let output = result.body;

    if (request.query.shrink && request.query.shrink == "true") {
        const serializer = new FrameSerializer();
        
        response.set("Content-Type", "text/led-bytes");
        response.set("Content-Encoding", "packed-rgb");
        output = serializer.serialize(output, true);
    }

    response.send(output + "\r");
});

app.post("/what-song", async (request, response) => {
    const result = await jumperApiSingleton.detectSongFromClip(request.body.bytes);
    response.send(result);
});

app["setMostRecentSong"] = (song) => { // Testing hook.
    jumperApiSingleton._mostRecentSong = song;
};

module.exports = app;
