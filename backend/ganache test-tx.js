// ganache-test-tx.js
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  console.log('--- Ganache Test TX ---');

  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:7545';
  const pk = process.env.GANACHE_PK;

  if (!pk) {
    console.error('❌ GANACHE_PK is missing in .env');
    process.exit(1);
  }

  console.log('RPC_URL:', rpcUrl);

  // Connect to Ganache
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(pk, provider);

  const addr = await signer.getAddress();
  console.log('Using address:', addr);

  // Create a simple tx with data so you can see it clearly in Ganache
  const payload = 'HerbTrace / HerbTraceability demo tx';

  console.log('Sending transaction to self with data:', payload);

  const tx = await signer.sendTransaction({
    to: addr,                                // self-transfer
    value: 0,                                // no ETH
    data: ethers.utils.toUtf8Bytes(payload)  // store message in tx data
  });

  console.log('Tx sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('Tx mined in block:', receipt.blockNumber);

  console.log('✅ Done. Check Ganache → Transactions tab.');
}

main().catch((err) => {
  console.error('❌ Error in ganache-test-tx:', err);
});
