# Herb Trace - Enterprise Startup Guide

This guide provides the step-by-step terminal commands required to start the entire Enterprise Hyperledger Fabric application from a completely stopped state.

Since the application relies on multiple independent systems (Docker, PostgreSQL, Fabric Test Network, and the Node.js Backend), they must be started in the correct order.

---

### Step 1: Start the Database
The backend relies on the PostgreSQL database to authenticate users and store their profiles. Open a new terminal window:

```bash
# Navigate to the project root
cd "/Users/indreshagrawal/Downloads/herb-trace-main 2"

# Start the PostgreSQL Docker container in detached mode
docker-compose up -d
```

---

### Step 2: Start the Hyperledger Fabric Network
Next, initialize the blockchain network along with the Certificate Authorities (CA) required for identity management. Open a new terminal window:

```bash
# Navigate to the test-network directory
cd "/Users/indreshagrawal/Downloads/herb-trace-main 2/fabric-samples/test-network"

# Bring down any old network state to ensure a clean slate
./network.sh down

# Bring up the network with Certificate Authorities
./network.sh up createChannel -ca

# Deploy our custom V1.5 Enterprise Chaincode with the explicit Multi-Org Endorsement Policy
./network.sh deployCC -ccn traceability -ccp ../../chaincode/traceability -ccl javascript -ccv 1.5 -ccs 1 -ccep "AND('Org1MSP.peer','Org2MSP.peer')"
```
*Note: The deployment step (`deployCC`) can take a couple of minutes as it installs the chaincode on all the peers.*

---

### Step 3: Initialize the Enterprise Wallets
Because the Fabric network restarted, the Certificate Authorities are reset. You need to clear old wallets and generate the `admin` certificates again for Org1 and Org2 so they can register new users. Open a new terminal window:

```bash
# Navigate to the backend directory
cd "/Users/indreshagrawal/Downloads/herb-trace-main 2/backend"

# Clear out the old invalid wallets from the previous run
rm -rf wallet/*

# Enroll the Admin Identities for both Org1 and Org2
node enrollAdmins.js
```

---

### Step 4: Start the Node.js Backend Server
Finally, start your Express application so it can serve the Frontend UI and handle API calls:

```bash
# Ensure you are in the backend directory
cd "/Users/indreshagrawal/Downloads/herb-trace-main 2/backend"

# Start the Node server
node server.js
```

**Verify Success:** Check the terminal output. You should see:
> `Server running at http://localhost:3000`
> `Enterprise Database synced successfully.`

---

### Step 5 (Optional): Seed Default Users
If you want to immediately use the original test accounts (`farmer1`, `processor1`, `lab1`) without manually registering them via the Web UI, you can run the seeder script.

Open a new terminal window:

```bash
# Navigate to the backend directory
cd "/Users/indreshagrawal/Downloads/herb-trace-main 2/backend"

# Run the seeding script
node seedUsers.js
```

---

### You are ready!
The Enterprise supply chain is fully operational. Open your web browser and navigate to:
**http://localhost:3000/login**
