require('dotenv').config();
const { getContract, invokeTransaction } = require('./fabricGateway');
async function test() {
  const { contract, gateway, network } = await require('./fabricGateway').getContractDetailed('farmer1', 'Org1MSP');
  
  const transaction = contract.createTransaction('CreateBatch');
  const txId = transaction.getTransactionId();
  console.log('TxID:', txId);
  const result = await transaction.submit('TEST-QB1', JSON.stringify({species: 'Basil'}));
  
  // Try querying QSCC
  const qscc = network.getContract('qscc');
  try {
    const blockBuffer = await qscc.evaluateTransaction('GetBlockByTxID', 'mychannel', txId);
    console.log('Got block buffer length:', blockBuffer.length);
  } catch (e) {
    console.error('QSCC GetBlockByTxID failed', e.message);
  }
  
  gateway.disconnect();
}
test().catch(console.error);
