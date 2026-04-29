# HerbTrace Enterprise Platform

HerbTrace is a premium, blockchain-powered traceability platform for the Ayurvedic supply chain. It provides an immutable record of herbal batches from harvest to consumer, secured by **Hyperledger Fabric**.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed on your system:
*   **Node.js** (v18 or higher)
*   **Docker & Docker Compose** (for Hyperledger Fabric)
*   **Hyperledger Fabric Samples** (Installed in the parent directory or configured in the backend)

### 2. Setup the Blockchain Network
Before running the application, the Fabric network must be active.
```bash
# Navigate to your fabric-samples test-network directory
cd ../fabric-samples/test-network

# Start the network with CAs and create the channel
./network.sh up createChannel -c herbtrace-channel -ca

# Deploy the traceability chaincode
./network.sh deployCC -ccn traceability -ccp ../../herb-trace-enterprise/chaincode/traceability -ccl javascript
```

### 3. Setup Backend (Node.js)
The backend manages user identity, IPFS uploads, and acts as the Fabric Gateway.
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Initialize the database and seed default users
node seedUsers.js

# Start the server
npm start
```
*The server will run on [http://localhost:3000](http://localhost:3000)*

### 4. Setup Frontend (React)
The frontend is a modern SPA with glassmorphic design.
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Run in Development Mode
npm run dev
# (or) Build for Production
npm run build
```
*In Production mode, the backend automatically serves the frontend at [http://localhost:3000](http://localhost:3000).*

---

## 🛠 Project Structure
*   `backend/`: Express server, Fabric Gateway, and Sequelize models.
*   `frontend/`: React + Vite + Tailwind CSS application.
*   `chaincode/`: Hyperledger Fabric smart contract logic.
*   `wallet/`: Local Fabric identity storage (generated automatically).

---

## 🖥 Using the Platform
1.  **Farmer Dashboard**: Register new harvests with GPS and time verification.
2.  **Processor Dashboard**: Record processing steps (Cleaning, Drying, Packaging).
3.  **Lab Dashboard**: Upload IPFS-backed quality reports and verify batches.
4.  **Consumer View**: Scan a Batch ID (or visit `/consumer`) to see the full journey.
5.  **Audit Report**: Download a data-driven PDF of all supply chain activity.

---

## 🔍 Blockchain Explorer
To view the network activity visually:
1.  Start the **Hyperledger Explorer** (usually at `localhost:8080`).
2.  Monitor real-time Blocks, Transactions, and Node health.

---

**Secured by Hyperledger Fabric & Enterprise Grade Encryption.**
