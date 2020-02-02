const { StorageSharedKeyCredential } = require("@azure/storage-blob");
const { BlobServiceClient } = require("@azure/storage-blob");
const os = require('os');

const uploadToAzureBlobStorage = async (config, bytes) => {
    // Create correctly authenticated Azure blob storage clients.
    const defaultAzureCredential = new StorageSharedKeyCredential(config["azure-account"], config["azure-key"]);
    const blobServiceClient = new BlobServiceClient(config["azure-blobStorage"], defaultAzureCredential);
    const containerClient = blobServiceClient.getContainerClient(config["azure-containerName"]);

    // Generate unique filename and upload    
    const unique = os.hostname() + "latestSongUpload";
    const blockBlobClient = containerClient.getBlockBlobClient(unique);
    const uploadBlobResponse = await blockBlobClient.upload(bytes, bytes.length || 0);

    // Return path, with extra "cacheBust" query string part so we can reuse urls without getting cached.
    return `${config["azure-blobStorage"]}/${config["azure-containerName"]}/${unique}?cacheBust=${Date.now()}`;
};

module.exports = uploadToAzureBlobStorage;