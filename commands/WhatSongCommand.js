const SongDetector = require("../features/song-detection/SongDetector");
const nothing = () => {};

class WhatSongCommand {
    constructor(currentSongStorage, songDetector, onSongChanged) {
        this._currentSongStorage = currentSongStorage;
        this._songDetector = songDetector || new SongDetector();
        this.onSongChanged = onSongChanged || nothing;
    }

    async execute(request, response) {        
        const audioClipBytes = Buffer.from(request.body.bytes, 'base64');
        const detectionResponse = await this._songDetector.execute(audioClipBytes);
        
        if (detectionResponse.hasOwnProperty("unrecognised")) {  
            const lastDetectedSong = this._currentSongStorage.get();       
            response.send({ status: 200, body: lastDetectedSong });
            return;
        }

        const songChanged = detectionResponse !== this._currentSongStorage.get();
        this._currentSongStorage.save(detectionResponse);

        const repsonseBody = { status: 200, body: detectionResponse, songChanged: songChanged };

        response.send(repsonseBody);

        if (songChanged) {
            await this.onSongChanged(repsonseBody);
        }
    }
}

module.exports = WhatSongCommand;