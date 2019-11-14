const { StorageSharedKeyCredential } = require("@azure/storage-blob");
const { BlobServiceClient } = require("@azure/storage-blob");
const uuid = require('uuid/v1');

module.exports = async (config, bytes) => {
    const account = config["azure-account"];
    const containerName = config["azure-containerName"];
    const blobStorage = config["azure-blobStorage"];
    const key = config["azure-key"];

    const defaultAzureCredential = new StorageSharedKeyCredential(account, key);
    const blobServiceClient = new BlobServiceClient(blobStorage, defaultAzureCredential);

    const unique = uuid();
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(unique);
    const uploadBlobResponse = await blockBlobClient.upload(bytes, bytes.length || 0);
    return `${blobStorage}/${containerName}/${unique}`;
};;
