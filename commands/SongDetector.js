const cfg = require('../config');
const azureUpload = require("./AzureUploader");
const axios = require("axios");

class SongDetector {
    constructor(config = cfg, httpClient = axios, azureUploader = azureUpload) {
        this._config = config;
        this._httpClient = httpClient;
        this._upload = azureUploader;
    };

    async execute(bytes) {
        const url = await this._upload(this._config, bytes);
        const result = await this.pushToRecognitionApi(url);
        return this.ok(result.data.result.title);
    };

    async pushToRecognitionApi(url) {
        const token =  this._config["audd-token"];
        return await this._httpClient.post(`https://api.audd.io/?api_token=${token}&return=timecode&url=${url}`);
    }

    ok(value) { return { status: 200, body: value } };
}

module.exports = SongDetector;
