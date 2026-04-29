# HerbTrace Enterprise: Technical Architecture & Blockchain Workflow

This document provides a deep dive into the technical inner workings of the HerbTrace Enterprise platform, explaining how Hyperledger Fabric, the backend, and the frontend interact to provide immutable traceability.

## 1. Core Architecture Overview
HerbTrace is a **Decentralized Application (DApp)** built on an enterprise-grade blockchain stack.

*   **Frontend**: React (Vite) + Tailwind CSS 4 (Glassmorphic UI).
*   **Backend**: Node.js (Express) serving as a middle-tier "Client Application".
*   **Blockchain**: Hyperledger Fabric (v2.x) - A private, permissioned DLT.
*   **Database**: 
    *   **Off-chain (PostgreSQL)**: Stores user credentials, profiles, and facility metadata.
    *   **On-chain (LevelDB/CouchDB)**: The "World State" inside Hyperledger Fabric that stores the actual herbal batch history.

---

## 2. How Hyperledger Fabric Works Here
Unlike public blockchains (like Bitcoin or Ethereum), Hyperledger Fabric is designed for enterprise privacy.

### The Network Structure
1.  **Organizations**:
    *   **Org1 (Farmers/Cultivators)**: Manages the collection of raw herbs.
    *   **Org2 (Processors/Labs)**: Manages processing, packaging, and quality certification.
2.  **Peers**: Nodes that host the ledger and run smart contracts.
3.  **Orderer**: A central service that orders transactions into blocks and distributes them to peers.
4.  **Channel**: A private "subnet" (herbtrace-channel) where all batch transactions occur. Only authorized members of Org1 and Org2 can see this data.

### Smart Contracts (Chaincode)
The logic lives in `traceContract.js`. It defines four main functions:
*   `CreateBatch`: Initializes a new herbal batch on the ledger.
*   `ProcessBatch`: Adds a processing event (cleaning, drying, etc.) to an existing batch.
*   `AddLabTest`: Appends a quality certificate (Pass/Fail) and IPFS report link.
*   `GetBatchHistory`: Retrieves the entire "provenance" of a batch for the consumer view.

---

## 3. What Happens During a Transaction?
When you click "Register Harvest" or "Process Batch", here is the step-by-step flow:

1.  **Proposal**: The Node.js backend uses the `fabric-gateway` to send a "Transaction Proposal" to the peers.
2.  **Endorsement**: Peers run the smart contract logic and check if the user has the right permissions (e.g., only a Farmer can create a batch). If valid, they sign the proposal.
3.  **Submission**: The backend collects these endorsements and sends them to the **Orderer**.
4.  **Ordering & Blocking**: The Orderer packages multiple transactions into a **Block**.
5.  **Validation & Commitment**: The block is sent to all peers. They verify the signatures and then "commit" the changes to their local copy of the **Ledger**.

---

## 4. Understanding Blocks and Transactions
On the **Fabric Explorer**, you see the real-time health of the network:

### The Block
A block is a container for transactions.
*   **Block Height**: The current number of blocks in the chain (e.g., Block #42).
*   **Block Hash**: A unique fingerprint of all data inside that block. If even one character of a transaction changes, the hash breaks, ensuring immutability.
*   **Data**: Contains the list of transactions processed in that specific time window.

### The Transaction (Tx)
Inside a block, each transaction has:
*   **TxID**: A unique 64-character ID (e.g., `a7b2c9...`).
*   **Creator**: Which organization/user submitted it (e.g., `Org1MSP` / `farmer1`).
*   **Payload**: The actual data being written (e.g., `BatchID: B-101, Status: Harvested`).
*   **Writeset**: The specific key-value pairs being updated in the World State.

---

## 5. The Databases
The system uses two distinct databases to balance performance and trust:

1.  **Postgres (Off-Chain)**:
    *   Used for: Login, User Profiles, Passwords (hashed), Facility names.
    *   Reason: Blockchain is slow for "searching" user profiles or handling high-frequency login sessions.
2.  **World State (On-Chain - LevelDB)**:
    *   Used for: Batch status, GPS coordinates, Timestamps, Quality results.
    *   Reason: This data must be **legally verifiable** and **tamper-proof**. LevelDB stores the *current* state, while the blockchain log stores the *entire history* of how we got there.

---

## 6. What You See on the Explorer
*   **Dashboard**: Shows total blocks, transactions, and nodes.
*   **Network**: Shows which peers are currently online (Org1 Peer, Org2 Peer).
*   **Blocks**: A list of every block generated. You can click one to see the transactions inside.
*   **Transactions**: A searchable list of every action taken in the system. Each "Harvest" or "Process" step you perform in the dashboard creates a new row here.
*   **Chaincode**: Shows that `traceability` contract version 1.0 is currently running.

---

**HerbTrace Enterprise ensures that "What you see is what was recorded"—backed by the mathematical certainty of the blockchain.**
