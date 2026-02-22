'use strict';

const { Contract } = require('fabric-contract-api');

class TraceContract extends Contract {
    async InitLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('Ledger Initialized');
        console.info('============= END : Initialize Ledger ===========');
    }

    // Farmer creates a new batch
    async CreateBatch(ctx, batchId, eventStr) {
        console.info('============= START : CreateBatch ===========');
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org1MSP') {
            throw new Error(`Unauthorized. Only Org1MSP (Farmers) can create batches. Caller is ${clientMSPID}`);
        }

        const exists = await this.BatchExists(ctx, batchId);
        if (exists) {
            throw new Error(`The batch ${batchId} already exists`);
        }

        const event = JSON.parse(eventStr);

        // Ensure standard fields are present deterministically
        const txTimestamp = ctx.stub.getTxTimestamp();
        let date = new Date(txTimestamp.seconds.low * 1000);
        if (txTimestamp.seconds.toNumber) { // Handle int64 object if present
            date = new Date(txTimestamp.seconds.toNumber() * 1000);
        } else if (txTimestamp.seconds.low !== undefined) {
            date = new Date(txTimestamp.seconds.low * 1000);
        } else {
            date = new Date(txTimestamp.seconds * 1000);
        }
        event.timestamp = date.toISOString();

        const eventsList = [event];
        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(eventsList)));
        console.info('============= END : CreateBatch ===========');
        return JSON.stringify(eventsList);
    }

    // Processor adds a processing event
    async ProcessBatch(ctx, batchId, eventStr) {
        console.info('============= START : ProcessBatch ===========');
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org2MSP') {
            throw new Error(`Unauthorized. Only Org2MSP (Processors/Labs) can process batches. Caller is ${clientMSPID}`);
        }

        const exists = await this.BatchExists(ctx, batchId);
        if (!exists) {
            throw new Error(`The batch ${batchId} does not exist`);
        }

        const buffer = await ctx.stub.getState(batchId);
        const eventsList = JSON.parse(buffer.toString());

        const event = JSON.parse(eventStr);

        const txTimestamp = ctx.stub.getTxTimestamp();
        let date = new Date(txTimestamp.seconds.low * 1000);
        if (txTimestamp.seconds.toNumber) {
            date = new Date(txTimestamp.seconds.toNumber() * 1000);
        } else if (txTimestamp.seconds.low !== undefined) {
            date = new Date(txTimestamp.seconds.low * 1000);
        } else {
            date = new Date(txTimestamp.seconds * 1000);
        }
        event.timestamp = date.toISOString();

        // Update status of previous collection events if needed
        eventsList.forEach(e => {
            if (e.type === 'collection') e.status = 'processed';
        });

        eventsList.push(event);

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(eventsList)));
        console.info('============= END : ProcessBatch ===========');
        return JSON.stringify(eventsList);
    }

    // Lab adds a quality test event
    async AddLabTest(ctx, batchId, eventStr) {
        console.info('============= START : AddLabTest ===========');
        const clientMSPID = ctx.clientIdentity.getMSPID();
        if (clientMSPID !== 'Org2MSP') {
            throw new Error(`Unauthorized. Only Org2MSP (Processors/Labs) can add lab tests. Caller is ${clientMSPID}`);
        }

        const exists = await this.BatchExists(ctx, batchId);
        if (!exists) {
            throw new Error(`The batch ${batchId} does not exist`);
        }

        const buffer = await ctx.stub.getState(batchId);
        const eventsList = JSON.parse(buffer.toString());

        const event = JSON.parse(eventStr);

        const txTimestamp = ctx.stub.getTxTimestamp();
        let date = new Date(txTimestamp.seconds.low * 1000);
        if (txTimestamp.seconds.toNumber) {
            date = new Date(txTimestamp.seconds.toNumber() * 1000);
        } else if (txTimestamp.seconds.low !== undefined) {
            date = new Date(txTimestamp.seconds.low * 1000);
        } else {
            date = new Date(txTimestamp.seconds * 1000);
        }
        event.timestamp = date.toISOString();

        eventsList.push(event);

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(eventsList)));
        console.info('============= END : AddLabTest ===========');
        return JSON.stringify(eventsList);
    }

    // Consumer (or anyone) reads the batch history
    async GetBatchHistory(ctx, batchId) {
        const exists = await this.BatchExists(ctx, batchId);
        if (!exists) {
            throw new Error(`The batch ${batchId} does not exist`);
        }

        const buffer = await ctx.stub.getState(batchId);
        return buffer.toString();
    }

    // Helper function
    async BatchExists(ctx, batchId) {
        const buffer = await ctx.stub.getState(batchId);
        return (!!buffer && buffer.length > 0);
    }
}

module.exports = TraceContract;
