require('dotenv').config();
const { getContract } = require('./fabricGateway'); // getContract is not exported by default, wait! invokeTransaction does what we need. Let me just test via getContract manually by modifying exports or writing a custom getContract script here.
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const { BlockDecoder } = require('fabric-common');

async function test() {
    const channelName = 'mychannel';
    const ccpPath = path.resolve(__dirname, `../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json`);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'farmer1', discovery: { enabled: true, asLocalhost: true } });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract('traceability');

    const transaction = contract.createTransaction('CreateBatch');
    const txId = transaction.getTransactionId();
    console.log('TxId:', txId);

    const eventJSON = JSON.stringify({ species: 'TestMint', timestamp: new Date().toISOString() });
    await transaction.submit('TEST-BlockInfo', eventJSON);

    const qscc = network.getContract('qscc');
    const blockBuffer = await qscc.evaluateTransaction('GetBlockByTxID', channelName, txId);

    const block = BlockDecoder.decode(blockBuffer);
    console.log('Block Number:', block.header.number.toString());

    // Find our tx
    const txEnvelope = block.data.data.find(d =>
        d.payload.header.channel_header.tx_id === txId
    );
    if (txEnvelope) {
        const timestamp = txEnvelope.payload.header.channel_header.timestamp;
        console.log('Timestamp:', timestamp);
        const action = txEnvelope.payload.data.actions[0].payload.action;
        const endorsements = action.endorsements.map(e => e.endorser.mspid);
        console.log('Endorsing Orgs:', endorsements);
        const chaincodeName = txEnvelope.payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.chaincode_id.name;
        console.log('Chaincode:', chaincodeName);
    }

    gateway.disconnect();
}
test().catch(console.error);
