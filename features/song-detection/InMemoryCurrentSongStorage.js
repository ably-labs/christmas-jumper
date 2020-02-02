class InMemoryCurrentSongStorage {
    constructor() {
        this._mostRecentSong = "";
    }

    get() {
        return this._mostRecentSong;
    }

    getOrDefault() {
        if (this.get() === "") {
            return "default";
        }

        return this.get();
    }

    save(key) {
        this._mostRecentSong = key;
    }
}

module.exports = InMemoryCurrentSongStorage;