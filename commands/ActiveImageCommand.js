const ImageSelector = require("../features/image-selection/ImageSelector");

class ActiveImageCommand {
    constructor(currentSongStorage, imageSelector) {
        this._currentSongStorage = currentSongStorage;
        this._imageSelector = imageSelector || new ImageSelector();
    }

    async execute(request, response) {
        const songOrDefault = this._currentSongStorage.getOrDefault();
        const imageKey = this._imageSelector.getImageKeyForSong(songOrDefault);
        response.send(imageKey + "\r");
    }
}

module.exports = ActiveImageCommand;