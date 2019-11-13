const { StorageSharedKeyCredential } = require("@azure/storage-blob");
const { BlobServiceClient } = require("@azure/storage-blob");
const axios = require("axios");
const uuidv1 = require('uuid/v1');

class SongDetector {
    constructor() {
    };

    async execute(bytes) {
        const url = await this.uploadToBlobStorage(bytes);
        const result = await this.pushToRecognitionApi(url);
        return this.ok(result.data.result.title);
    };

    async uploadToBlobStorage(bytes) {
        const account = "jumperstorage";
        const key = "I9rBXWcRZYWBXzBNFoY0tEkAPAF46a9W5jIMoCrVTtThdISCq00iM28kMb3Ni2Zq2/CjbH+YhrOdKouwLGcp/A==";
        const defaultAzureCredential = new StorageSharedKeyCredential(account, key);
        const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, defaultAzureCredential);

        const unique = uuidv1();
        const containerClient = blobServiceClient.getContainerClient("jumper");
        const blockBlobClient = containerClient.getBlockBlobClient(unique);
        const uploadBlobResponse = await blockBlobClient.upload(bytes, bytes.length);
        return `https://jumperstorage.blob.core.windows.net/jumper/${unique}`;
    }

    async pushToRecognitionApi(url) {
        const token = "e559e284cffb189e3b3ab07f0446e2b9";
        const result = await axios.post(`https://api.audd.io/?api_token=${token}&return=timecode&url=${url}`);
        return result;
    }

    ok(value) { return { status: 200, body: value } };
}

module.exports = SongDetector;