const SongDetector = require("../features/song-detection/SongDetector");

class WhatSongCommand {
    constructor(currentSongStorage, songDetector) {
        this._currentSongStorage = currentSongStorage;
        this._songDetector = songDetector || new SongDetector();
    }

    async execute(request, response) {        
        const imageBytes = Buffer.from(request.body.bytes, 'base64');
        const detectionResponse = await this._songDetector.execute(imageBytes);
        
        if (detectionResponse.hasOwnProperty("unrecognised")) {  
            const lastDetectedSong = this._currentSongStorage.get();       
            response.send({ status: 200, body: lastDetectedSong });
            return;
        }

        this._currentSongStorage.save(detectionResponse);
        response.send({ status: 200, body: detectionResponse });
    }
}

module.exports = WhatSongCommand;