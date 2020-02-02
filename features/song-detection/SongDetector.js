const cfg = require('../../config');
const axios = require("axios");
const uploadToAzureBlobStorage = require("../azure-file-uploading/AzureFileUpload");

class SongDetector {
    constructor(config = cfg, httpClient = axios, uploadAndReturnUrl = uploadToAzureBlobStorage) {
        this._config = config;
        this._httpClient = httpClient;
        this._upload = uploadAndReturnUrl;
    }

    async execute(bytes) {
        const url = await this._upload(this._config, bytes);
        const result = await this.pushToRecognitionApi(url);
        
        if (resultDoesNotContainATitle(result)) {
            return { unrecognised: true };
        }

        return result.data.result.title;
    }

    async pushToRecognitionApi(url) {
        const token =  this._config["audd-token"];
        return await this._httpClient.post(`https://api.audd.io/?api_token=${token}&return=timecode&url=${url}`);
    }
}

const resultDoesNotContainATitle = (result) => {
    return  typeof result == 'undefined' || result == null || 
            typeof result.data == 'undefined' ||  result.data == null ||
            typeof result.data.result == 'undefined' || result.data.result == null ||
            typeof result.data.result.title == 'undefined' || result.data.result.title == null;
};

module.exports = SongDetector;
