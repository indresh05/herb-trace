const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const channelName = 'mychannel';
const chaincodeName = 'traceability';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
async function getContract(userIdentity, userOrgMsp) {
    try {
        let orgName = 'org1';
        if (userOrgMsp === 'Org2MSP') orgName = 'org2';

        // load the dynamic network configuration
        const ccpPath = path.resolve(__dirname, `../fabric-samples/test-network/organizations/peerOrganizations/${orgName}.example.com/connection-${orgName}.json`);
        const fileExists = fs.existsSync(ccpPath);
        if (!fileExists) {
            console.error(`An error occurred: connection profile not found at ${ccpPath}`);
            return null;
        }
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(userIdentity);
        if (!identity) {
            console.warn(`An identity for the user "${userIdentity}" does not exist in the wallet for ${userOrgMsp}`);
            return null;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: userIdentity, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        return { contract, gateway, network };
    } catch (error) {
        console.error(`Failed to connect to gateway: ${error}`);
        return null; // Return null on failure so server can catch it
    }
}

async function invokeTransaction(userIdentity, userOrg, fnc, ...args) {
    let contractObj = null;
    try {
        contractObj = await getContract(userIdentity, userOrg);
        if (!contractObj) throw new Error(`Could not get Fabric Contract for ${userIdentity}`);

        const { contract, gateway, network } = contractObj;

        console.log(`Submitting transaction: ${fnc} for user ${userIdentity} with args: ${args.join(',')}`);
        const transaction = contract.createTransaction(fnc);
        const txId = transaction.getTransactionId();
        const resultBytes = await transaction.submit(...args);
        console.log('Transaction has been submitted. TxID:', txId);

        let blockchainProof = null;
        try {
            const qscc = network.getContract('qscc');
            const blockBuffer = await qscc.evaluateTransaction('GetBlockByTxID', channelName, txId);
            const { BlockDecoder } = require('fabric-common');
            const block = BlockDecoder.decode(blockBuffer);

            const txEnvelope = block.data.data.find(d => d.payload.header.channel_header.tx_id === txId);
            if (txEnvelope) {
                const action = txEnvelope.payload.data.actions[0].payload.action;
                blockchainProof = {
                    txId: txId,
                    blockNumber: block.header.number.toString(),
                    timestamp: txEnvelope.payload.header.channel_header.timestamp,
                    endorsingOrgs: action.endorsements.map(e => e.endorser.mspid),
                    chaincodeName: txEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.chaincode_id.name
                };

                // Store proof in world state (args[0] is the batchId)
                if (fnc !== 'UpdateBatchProof' && args[0]) {
                    console.log(`Submitting UpdateBatchProof for batch ${args[0]}...`);
                    await contract.submitTransaction('UpdateBatchProof', args[0], JSON.stringify(blockchainProof));
                    console.log(`UpdateBatchProof successful for batch ${args[0]}`);
                }
            }
        } catch (err) {
            console.error('Failed to extract or store blockchain proof:', err.message);
        }

        // Disconnect from the gateway
        gateway.disconnect();

        return {
            result: resultBytes.toString(),
            proof: blockchainProof
        };
    } catch (error) {
        if (contractObj && contractObj.gateway) contractObj.gateway.disconnect();
        console.error(`Failed to submit transaction: ${error}`);
        throw error;
    }
}

async function evaluateTransaction(userIdentity, userOrg, fnc, ...args) {
    let contractObj = null;
    try {
        contractObj = await getContract(userIdentity, userOrg);
        if (!contractObj) throw new Error(`Could not get Fabric Contract for ${userIdentity}`);

        const { contract, gateway } = contractObj;

        const result = await contract.evaluateTransaction(fnc, ...args);

        // Disconnect from the gateway
        gateway.disconnect();
        return result.toString();
    } catch (error) {
        if (contractObj && contractObj.gateway) contractObj.gateway.disconnect();
        console.error(`Failed to evaluate transaction: ${error}`);
        throw error;
    }
}

module.exports = {
    invokeTransaction,
    evaluateTransaction
};
