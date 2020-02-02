const SongDetector = require("../features/song-detection/SongDetector");

class WhatSongCommand {
    constructor(currentSongStorage, songDetector) {
        this._currentSongStorage = currentSongStorage;
        this._songDetector = songDetector || new SongDetector();
    }

    async execute(request, response) {        
        const byteArray = Buffer.from(request.body.bytes, 'base64');
        const potentialSong = await this._songDetector.execute(byteArray);
        
        if (potentialSong.hasOwnProperty("unrecognised")) {  
            const previous = this._currentSongStorage.get();       
            response.send({ status: 200, body: previous });
            return;
        }

        this._currentSongStorage.save(potentialSong);
        response.send({ status: 200, body: potentialSong });
    }
}

module.exports = WhatSongCommand;