const config = require("./config");
const InMemoryCurrentSongStorage = require("./features/state-management/InMemoryCurrentSongStorage");
const GetActiveImageCommand = require("./commands/ActiveImageCommand");
const GetActiveImageFramesCommand = require("./commands/ActiveImageFramesCommand");
const WhatSongCommand = require("./commands/WhatSongCommand");
const AblyPublish = require("./features/push-notifications/AblyPublish");


// This state object holds the last song. 
// Could be replaced with some other persistence (disk, distributed cache, etc)
const state = new InMemoryCurrentSongStorage();

// Create the three command handlers that all share the same state object
const getActiveImage = new GetActiveImageCommand(state);
const getActiveImageFrames =  new GetActiveImageFramesCommand(state);
const whatSong =  new WhatSongCommand(state);

// Wire up ably publish hook
if (config["enable-push"]) {

    let ablyClient, ablyPublish;
    whatSong.onSongChanged = async (newSongTitle) => {    
        if (config["ably-api-key"] == "") {
            return;
        }

        ablyClient = ablyClient || createMqttClient();
        ablyPublish = ablyPublish || new AblyPublish(state, ablyClient);
        await ablyPublish.publishToAbly(newSongTitle);
    }; 

}

function createMqttClient() {
    const mqtt = require("mqtt");
    const creds = config["ably-api-key"].split(':');        
    return mqtt.connect("mqtts://mqtt.ably.io", {
        username: creds[0],
        password: creds[1]
    }); 
}

module.exports = {
    state,
    getActiveImage, 
    getActiveImageFrames, 
    whatSong
};;