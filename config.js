require('dotenv').config();

module.exports = {
    "enable-push": true,
    "azure-account": process.env.AZURE_ACCOUNT || "jumperstorage",
    "azure-containerName": process.env.AZURE_CONTAINERNAME || "jumper",
    "azure-blobStorage": process.env.AZURE_BLOBSTORAGE || "https://jumperstorage.blob.core.windows.net",
    "azure-key": process.env.AZURE_KEY,
    "audd-token": process.env.AUDD_TOKEN,
    "ably-api-key": process.env.ABLY_API_KEY
};
