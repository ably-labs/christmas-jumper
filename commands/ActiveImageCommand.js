const ImageSelector = require("../features/image-selection/ImageSelector");

class ActiveImageCommand {
    constructor(currentSongStorage, imageSelector) {
        this._currentSongStorage = currentSongStorage;
        this._imageSelector = imageSelector || new ImageSelector();
    }

    async execute(request, response) {
        const songOrDefault = this._currentSongStorage.getOrDefault();
        const result = this._imageSelector.execute(songOrDefault);
        response.send(result + "\r");
    }
}

module.exports = ActiveImageCommand;