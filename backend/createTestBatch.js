require('dotenv').config();
const fabricGateway = require('./fabricGateway');
const crypto = require('crypto');

async function createTestBatch() {
    const batchId = `BATCH-TEST-${Date.now().toString(36).toUpperCase()}`;
    const event = {
        type: 'collection',
        batchId,
        collector: 'Test Farmer',
        farmLocation: 'Test Location',
        species: 'Tulsi',
        quality: 'A',
        lat: 27.5219,
        long: 77.6553,
        imageLink: null,
        farmer: 'farmer1',
        status: 'pending'
    };

    try {
        event.payloadHash = crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex');
        console.log(`Creating test batch ${batchId} as farmer1...`);
        const txResponse = await fabricGateway.invokeTransaction('farmer1', 'Org1MSP', 'CreateBatch', batchId, JSON.stringify(event));
        console.log(`✅ Success! Batch ${batchId} created on Fabric.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create test batch:', err);
        process.exit(1);
    }
}

createTestBatch();
