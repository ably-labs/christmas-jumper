require('dotenv').config();

module.exports = {
    "enable-push": true,
    "azure-account": "jumperstorage",
    "azure-containerName": "jumper",
    "azure-blobStorage": `https://jumperstorage.blob.core.windows.net`,
    "azure-key": "I9rBXWcRZYWBXzBNFoY0tEkAPAF46a9W5jIMoCrVTtThdISCq00iM28kMb3Ni2Zq2/CjbH+YhrOdKouwLGcp/A==",
    "audd-token": "e559e284cffb189e3b3ab07f0446e2b9",
    "ably-api-key": process.env.ABLY_API_KEY
};
