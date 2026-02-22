'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function registerAndEnrollUser(username, role) {
    try {
        // Determine Org based on role
        let org, mspId, affiliation;
        if (role === 'farmer') {
            org = 'org1';
            mspId = 'Org1MSP';
            affiliation = 'org1.department1';
        } else if (role === 'processor' || role === 'lab') {
            org = 'org2';
            mspId = 'Org2MSP';
            affiliation = 'org2.department1';
        } else {
            throw new Error(`Unknown role: ${role}`);
        }

        const ccpPath = path.resolve(__dirname, `../fabric-samples/test-network/organizations/peerOrganizations/${org}.example.com/connection-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caURL = ccp.certificateAuthorities[`ca.${org}.example.com`].url;
        const ca = new FabricCAServices(caURL);

        const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));

        // Check if the user is already enrolled
        const userExists = await wallet.get(username);
        if (userExists) {
            console.log(`An identity for the user "${username}" already exists in the wallet`);
            return { org, mspId };
        }

        // Get the admin identity for this org
        const adminIdentity = await wallet.get(`admin_${org}`);
        if (!adminIdentity) {
            console.log(`An identity for the admin user "admin_${org}" does not exist in the wallet. Enrolling...`);
            throw new Error(`Admin for ${org} is not enrolled. Please run enrollAdmins.js first.`);
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, `admin_${org}`);

        // Register the user
        const secret = await ca.register({
            affiliation: affiliation,
            enrollmentID: username,
            role: 'client'
        }, adminUser);

        // Enroll the user
        const enrollment = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: secret
        });

        // Store the user identity in the wallet
        await wallet.put(username, {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: mspId,
            type: 'X.509'
        });

        console.log(`Successfully registered and enrolled user "${username}" and imported it into the wallet for ${org}`);
        return { org, mspId };

    } catch (error) {
        console.error(`Failed to register user "${username}": ${error}`);
        throw error;
    }
}

module.exports = {
    registerAndEnrollUser
};
