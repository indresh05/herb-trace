'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function enrollAdmin(org, mspId) {
    const ccpPath = path.resolve(__dirname, `../fabric-samples/test-network/organizations/peerOrganizations/${org}.example.com/connection-${org}.json`);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const caURL = ccp.certificateAuthorities[`ca.${org}.example.com`].url;
    const ca = new FabricCAServices(caURL);

    const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));

    const adminExists = await wallet.get(`admin_${org}`);
    if (adminExists) {
        console.log(`An identity for the admin user "admin_${org}" already exists in the wallet`);
        return;
    }

    const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });

    await wallet.put(`admin_${org}`, {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: mspId,
        type: 'X.509'
    });

    console.log(`Admin for ${org} enrolled as admin_${org}!`);
}

async function main() {
    try {
        await enrollAdmin('org1', 'Org1MSP');
        await enrollAdmin('org2', 'Org2MSP');
    } catch (error) {
        console.error(`Failed to enroll admin users: ${error}`);
        process.exit(1);
    }
}

main();
