const  {StorageSharedKeyCredential} = require("@azure/storage-blob");

const { TokenCredential } = require( "azure-storage");

var axios = require("axios");
var request = require("request");
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");
const uuidv1 = require('uuid/v1');

class SongDetector {
    constructor() {
    };

    async execute(bytes) {

        const bufferValue = Buffer.from(bytes);
        let base64data = bufferValue.toString('base64');

        const account = "jumperstorage";
        const key = "I9rBXWcRZYWBXzBNFoY0tEkAPAF46a9W5jIMoCrVTtThdISCq00iM28kMb3Ni2Zq2/CjbH+YhrOdKouwLGcp/A==";
        const defaultAzureCredential = new StorageSharedKeyCredential(account, key);

        const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net`, defaultAzureCredential);

        const unique = uuidv1();
        const containerClient = blobServiceClient.getContainerClient("jumper");
        const blockBlobClient = containerClient.getBlockBlobClient(unique);
        const uploadBlobResponse = await blockBlobClient.upload(bytes, bytes.length);
        console.log(uploadBlobResponse);

        const url = `https://jumperstorage.blob.core.windows.net/jumper/${unique}`;
        const token = "e559e284cffb189e3b3ab07f0446e2b9";

        const result = await axios.post(`https://api.audd.io/?api_token=${token}&return=timecode&url=${url}`);

        return this.ok(result);
    };

    ok(value) { return { status: 200, body: value } };
}

module.exports = SongDetector;