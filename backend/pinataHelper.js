const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

// Your Pinata keys from .env
const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

/**
 * Upload any file (PDF, image, etc.) to Pinata
 * @param {string} filePath - Local path of the file to upload
 * @returns {Promise<string>} - Returns the IPFS hash of the uploaded file
 */
async function uploadFile(filePath) {
    try {
        const readable = fs.createReadStream(filePath);
        const result = await pinata.pinFileToIPFS(readable);
        console.log('Uploaded to IPFS:', result.IpfsHash);
        return result.IpfsHash;
    } catch (err) {
        console.error('Error uploading file to IPFS:', err);
        throw err;
    }
}

/**
 * Optional: Upload specifically PDFs (can reuse the same function)
 */
async function uploadPDF(filePath) {
    return uploadFile(filePath);
}

module.exports = { uploadFile, uploadPDF };