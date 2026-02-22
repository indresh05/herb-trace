'use strict';
require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs'); // make sure to install via npm
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const cors = require('cors');

// NEW: Import the Fabric Gateway helper
const fabricGateway = require('./fabricGateway');

let pinataHelper = null;
try { pinataHelper = require('./pinataHelper'); } catch (e) { /* optional */ }

const app = express();
const upload = multer({ dest: 'uploads/' });

// Database initialization
const db = require('./models');
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Enterprise Database synced successfully.");
}).catch((err) => {
  console.error("Failed to sync DB: " + err.message);
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const SECRET_KEY = process.env.SECRET_KEY || 'supersecret'; // change in prod

function generateBatchId() {
  const ts = Date.now().toString(36);
  const rnd = Math.floor(Math.random() * 9000 + 1000).toString(36);
  return `BATCH-${ts}-${rnd}`.toUpperCase();
}

// ---- Geo helpers ----
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function hasGeo(e) {
  return e && toNum(e.lat) != null && toNum(e.long) != null;
}

// (Removed Hardcoded Profiles & Users)

// ---------- Serve Frontend ----------
const FRONTEND_PATH = path.join(__dirname, 'frontend');
app.use(express.static(FRONTEND_PATH));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_PATH, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(FRONTEND_PATH, 'login.html')));
app.get('/consumer', (req, res) => res.sendFile(path.join(FRONTEND_PATH, 'consumer.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(FRONTEND_PATH, 'qr.html')));

// ---------- Auth Endpoints ----------
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role, fullName, location, facilityName } = req.body;

    // Check if user exists
    const existing = await db.User.findOne({ where: { username } });
    if (existing) return res.status(400).json({ ok: false, error: 'Username exists' });

    // Hash with 12 rounds for Enterprise security
    const passwordHash = await bcrypt.hash(password, 12);

    // Enroll with Fabric CA dynamically
    let orgMspId = 'Org1MSP'; // fallback
    try {
      const caHelper = require('./caHelper');
      const caRes = await caHelper.registerAndEnrollUser(username, role);
      orgMspId = caRes.mspId;
    } catch (caErr) {
      console.error("CA Enrollment Failure:", caErr);
      return res.status(500).json({ ok: false, error: 'Failed to enroll Fabric Identity: ' + caErr.message });
    }

    // Create DB Transaction
    const t = await db.sequelize.transaction();
    try {
      const newUser = await db.User.create({
        username,
        passwordHash,
        role,
        organizationId: orgMspId, // Dynamic specific Org
        fabricIdentity: username, // The dynamic Wallet name
      }, { transaction: t });

      await db.Profile.create({
        userId: newUser.id,
        fullName,
        location,
        facilityName
      }, { transaction: t });

      await t.commit();
      res.json({ ok: true, message: 'User registered successfully' });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Query Enterprise DB
    const user = await db.User.findOne({
      where: { username },
      include: [{ model: db.Profile, as: 'profile' }]
    });

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    // Embed Postgres userId and Role in JWT
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      role: user.role,
      fabricIdentity: user.fabricIdentity, // Include Fabric binding
      organizationId: user.organizationId // Include Fabric Org
    }, SECRET_KEY, { expiresIn: '8h' });

    res.json({ ok: true, token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Login failed' });
  }
});

function authRole(roles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ ok: false, error: 'No token' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ ok: false, error: 'Invalid token' });
      if (!roles.includes(user.role)) return res.status(403).json({ ok: false, error: 'Access denied' });
      req.user = user;
      next();
    });
  };
}

// ---------- Profile ----------
app.get('/api/profile', authRole(['farmer', 'processor', 'lab']), async (req, res) => {
  try {
    const userProfile = await db.Profile.findOne({ where: { userId: req.user.id } });
    if (!userProfile) return res.status(404).json({ ok: false, error: 'Profile not found' });
    res.json({
      ok: true,
      profile: {
        fullName: userProfile.fullName,
        location: userProfile.location,
        facilityName: userProfile.facilityName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Failed to fetch profile' });
  }
});

// ---------- Farmer ----------
app.post('/api/farmer/add-herb', authRole(['farmer']), upload.single('image'), async (req, res) => {
  try {
    const { species, otherSpecies, quality, lat, long } = req.body;
    let herb = species;
    if (species === 'other') herb = otherSpecies || 'Unknown';

    const batchId = generateBatchId();

    let imageLink = null;
    if (req.file && pinataHelper) {
      try {
        const hash = await pinataHelper.uploadFile(req.file.path);
        if (hash) imageLink = `https://gateway.pinata.cloud/ipfs/${hash}`;
      } catch (e) { console.error('IPFS image upload failed', e); }
    }
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    // Inject immutable farmer details from Database Profile
    const userProfile = await db.Profile.findOne({ where: { userId: req.user.id } });
    const collectorName = userProfile ? userProfile.fullName : 'Unknown Farmer';
    const farmLocation = userProfile ? userProfile.location : 'Unknown Location';

    const event = {
      type: 'collection',
      batchId,
      collector: collectorName,       // immutable
      farmLocation,                   // immutable
      species: herb,
      quality,
      lat: toNum(lat),
      long: toNum(long),
      imageLink,
      farmer: req.user.username,
      status: 'pending'
    };

    // ---------- Real On-chain Fabric txn (Farmer) ----------
    try {
      await fabricGateway.invokeTransaction(req.user.fabricIdentity, req.user.organizationId, 'CreateBatch', batchId, JSON.stringify(event));
      console.log(`Fabric Transaction Successful: CreateBatch for ${batchId}`);
    } catch (err) {
      console.error('Fabric transaction failed (farmer)', err);
      return res.status(500).json({ ok: false, error: 'Blockchain transaction failed' });
    }

    res.json({ ok: true, batchId, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// ---------- Processor ----------
app.get('/api/processor/dashboard', authRole(['processor']), async (req, res) => {
  try {
    console.log(`[PROCESSOR] Fetching batches for ${req.user.username}...`);
    const allBatchesJSON = await fabricGateway.evaluateTransaction(req.user.fabricIdentity, req.user.organizationId, 'GetAllBatches');
    console.log(`[PROCESSOR] Raw JSON from chaincode:`, allBatchesJSON);

    const allBatches = JSON.parse(allBatchesJSON);
    console.log(`[PROCESSOR] Parsed events:`, allBatches.length);

    // Filter for batches that have a collection event but NO processing event
    const pending = allBatches
      .map(b => b.Record)
      .filter(events => {
        const hasCollection = events.some(e => e.type === 'collection');
        const hasProcessing = events.some(e => e.type === 'processing');
        return hasCollection && !hasProcessing;
      })
      .map(events => {
        // Flatten latest state for dashboard display
        const collectionEvent = events.find(e => e.type === 'collection');
        return {
          batchId: collectionEvent.batchId,
          species: collectionEvent.species,
          quality: collectionEvent.quality,
          status: collectionEvent.status
        }
      });

    console.log(`[PROCESSOR] Filtered pending:`, pending);
    res.json({ ok: true, pending });
  } catch (err) {
    console.error('Failed to get processor dashboard batches:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch batches', pending: [] });
  }
});

app.post('/api/processor/process', authRole(['processor']), async (req, res) => {
  const { batchId, processType, lat, long } = req.body;

  // Inject immutable processor details from Database Profile
  const userProfile = await db.Profile.findOne({ where: { userId: req.user.id } });
  const facility = userProfile ? userProfile.facilityName : 'Unknown Facility';
  const facilityLocation = userProfile ? userProfile.location : 'Unknown Location';
  const managerName = userProfile ? userProfile.fullName : 'Unknown Manager';

  const event = {
    type: 'processing',
    batchId,
    facility,             // immutable
    facilityLocation,     // immutable
    managerName,          // immutable
    processType,
    processor: req.user.username,
    lat: toNum(lat),    // optional geo
    long: toNum(long),  // optional geo
    status: 'processed'
  };

  // ---------- Real On-chain Fabric txn (Processor) ----------
  try {
    await fabricGateway.invokeTransaction(req.user.fabricIdentity, req.user.organizationId, 'ProcessBatch', batchId, JSON.stringify(event));
    console.log(`Fabric Transaction Successful: ProcessBatch for ${batchId}`);
  } catch (err) {
    console.error('Fabric transaction failed (processor)', err);
    return res.status(500).json({ ok: false, error: 'Blockchain transaction failed' });
  }

  res.json({ ok: true, event });
});

// ---------- Lab ----------
app.get('/api/lab/dashboard', authRole(['lab']), async (req, res) => {
  try {
    const allBatchesJSON = await fabricGateway.evaluateTransaction(req.user.fabricIdentity, req.user.organizationId, 'GetAllBatches');
    const allBatches = JSON.parse(allBatchesJSON);

    // Filter for batches that have a processing event but NO quality event
    const pending = allBatches
      .map(b => b.Record)
      .filter(events => {
        const hasProcessing = events.some(e => e.type === 'processing');
        const hasQuality = events.some(e => e.type === 'quality');
        return hasProcessing && !hasQuality;
      })
      .map(events => {
        // Flatten latest state for dashboard display
        const collectionEvent = events.find(e => e.type === 'collection');
        const processingEvent = events.find(e => e.type === 'processing');
        return {
          batchId: collectionEvent.batchId,
          species: collectionEvent.species,
          status: processingEvent.status, // Should be 'processed'
          processor: processingEvent.processor
        }
      });

    res.json({ ok: true, pending });
  } catch (err) {
    console.error('Failed to get lab dashboard batches:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch batches', pending: [] });
  }
});

app.post('/api/lab/upload-report', authRole(['lab']), upload.single('file'), async (req, res) => {
  const { batchId, resultStatus } = req.body; // lab fields ignored (server-enforced)
  if (!req.file) return res.status(400).json({ ok: false, error: 'File missing' });

  // Immutable lab profile from Database Profile
  const userProfile = await db.Profile.findOne({ where: { userId: req.user.id } });
  const labName = userProfile ? userProfile.facilityName : 'Unknown Lab';
  const labManagerName = userProfile ? userProfile.fullName : 'Unknown Manager';
  const labLocation = userProfile ? userProfile.location : 'Unknown Location';

  let ipfsLink = null;
  if (pinataHelper) {
    try {
      const hash = await pinataHelper.uploadFile(req.file.path);
      if (hash) ipfsLink = `https://gateway.pinata.cloud/ipfs/${hash}`;
    } catch (e) { console.error('IPFS lab upload failed', e); }
  }
  if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

  const event = {
    type: 'quality',
    batchId,
    labName,            // immutable
    labManagerName,     // immutable
    labLocation,        // immutable
    resultStatus,
    ipfsLink,
    lat: toNum(req.body.lat),   // optional geo
    long: toNum(req.body.long), // optional geo
    lab: req.user.username,
    status: 'tested'
  };

  // ---------- Real On-chain Fabric txn (Lab) ----------
  try {
    await fabricGateway.invokeTransaction(req.user.fabricIdentity, req.user.organizationId, 'AddLabTest', batchId, JSON.stringify(event));
    console.log(`Fabric Transaction Successful: AddLabTest for ${batchId}`);
  } catch (err) {
    console.error('Fabric transaction failed (lab)', err);
    return res.status(500).json({ ok: false, error: 'Blockchain transaction failed' });
  }

  res.json({ ok: true, event });
});

// ---------- Consumer ----------
app.get('/api/consumer/view', async (req, res) => {
  const batchId = req.query.batchId;
  try {
    const historyJSON = await fabricGateway.evaluateTransaction('admin_org1', 'Org1MSP', 'GetBatchHistory', batchId);
    const events = JSON.parse(historyJSON);
    res.json({ ok: true, events });
  } catch (err) {
    console.error(err);
    res.json({ ok: false, events: [] });
  }
});

// ---------- Provenance (with map) ----------
app.get('/provenance/:batchId', async (req, res) => {
  const batchId = req.params.batchId;

  let events = [];
  try {
    const historyJSON = await fabricGateway.evaluateTransaction('admin_org1', 'Org1MSP', 'GetBatchHistory', batchId);
    events = JSON.parse(historyJSON);
  } catch (err) {
    console.error(err);
  }

  const geoEvents = events.filter(hasGeo);

  let html = `<!doctype html><html><head><meta charset="utf-8"><title>Provenance ${batchId}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
    <style>
      body{font-family:Arial;background:#f7f9fb;padding:20px}
      .card{background:#fff;padding:16px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,0.06);max-width:1000px;margin:12px auto}
      h2{color:#2E8B57}
      .evt{border-left:4px solid #2E8B57;padding:12px;margin:12px 0;border-radius:6px;background:#fff}
      .muted{color:#666;font-size:0.9em}
      a.link{color:#2E8B57}
      #map{height:420px;border-radius:12px;margin:16px 0}
      .fabric-badge {display: inline-block; background-color: #2e8b57; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin-bottom: 15px;}
    </style>
  </head><body><div class="card"><h2>Provenance — ${batchId}</h2>
  <div class="fabric-badge">✓ Verified on Hyperledger Fabric</div>`;

  if (events.length === 0) {
    html += '<p class="muted">No records found on Blockchain.</p>';
  } else {
    if (geoEvents.length > 0) {
      const markers = geoEvents.map(e => {
        const when = new Date(e.timestamp || Date.now()).toLocaleString();
        const title =
          e.type === 'collection' ? 'Collection' :
            e.type === 'processing' ? 'Processing' :
              e.type === 'quality' ? 'Lab Test' : 'Geo';
        const who = e.farmer || e.processor || e.lab || e.role || '';
        const ctx = e.context || '';
        return { lat: Number(e.lat), lng: Number(e.long), text: `${title} ${ctx ? '(' + ctx + ')' : ''}${who ? ' — ' + who : ''}<br>${when}` };
      });

      html += `<div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
        const markers = ${JSON.stringify(markers)};
        const latlngs = markers.map(m => [m.lat, m.lng]);
        const group = L.featureGroup(markers.map(m => L.marker([m.lat, m.lng]).bindPopup(m.text))).addTo(map);
        L.polyline(latlngs, { weight: 4 }).addTo(map);
        map.fitBounds(group.getBounds().pad(0.2));
      </script>`;
    }

    events.forEach(e => {
      const when = new Date(e.timestamp).toLocaleString();
      html += `<div class="evt">`;
      if (e.type === 'collection') {
        html += `<strong>Collection</strong> — <span class="muted">${when}</span><br>`;
        html += `Species: ${e.species} | Quality: ${e.quality}<br>`;
        if (e.collector) html += `Collector: ${e.collector}<br>`;        // NEW
        if (e.farmLocation) html += `Farm: ${e.farmLocation}<br>`;        // NEW
        if (hasGeo(e)) html += `Location: (${e.lat}, ${e.long})<br>`;
        if (e.imageLink) html += `Image: <a class="link" target="_blank" href="${e.imageLink}">View</a><br>`;
        html += `Status: ${e.status}`;
      } else if (e.type === 'processing') {
        html += `<strong>Processing</strong> — <span class="muted">${when}</span><br>`;
        html += `${e.facility} (${e.facilityLocation})<br>`;
        html += `Manager: ${e.managerName}<br>Type: ${e.processType}<br>`;
        if (hasGeo(e)) html += `Location: (${e.lat}, ${e.long})<br>`;
        html += `Status: ${e.status}`;
      } else if (e.type === 'quality') {
        html += `<strong>Lab Test</strong> — <span class="muted">${when}</span><br>`;
        html += `${e.labName} (${e.labLocation})<br>`;
        html += `Manager: ${e.labManagerName}<br>Result: ${e.resultStatus}<br>`;
        if (e.ipfsLink) html += `Report: <a class="link" target="_blank" href="${e.ipfsLink}">View</a><br>`;
        if (hasGeo(e)) html += `Location: (${e.lat}, ${e.long})<br>`;
        html += `Status: ${e.status}`;
      } else {
        html += `<strong>Event</strong> — <span class="muted">${when}</span><br>`;
        if (e.context) html += `Context: ${e.context}<br>`;
        if (hasGeo(e)) html += `Location: (${e.lat}, ${e.long})<br>`;
      }
      html += `</div>`;
    });
  }

  html += `<p style="text-align:center"><a href="/">Back</a></p>`;
  html += `</div></body></html>`;
  res.send(html);
});

// ---------- QR ----------
app.get('/qr/:batchId', async (req, res) => {
  const batchId = req.params.batchId;
  const url = `http://localhost:3000/provenance/${batchId}`;
  const qr = await QRCode.toDataURL(url);
  res.send(`<!doctype html><html><head><meta charset="utf-8"><title>QR ${batchId}</title></head>
    <body style="font-family:Arial;text-align:center;padding:30px">
    <h3>QR for ${batchId}</h3>
    <img src="${qr}" alt="QR" style="max-width:300px"/><br>
    <a href="${url}">${url}</a><br><a href="/">Back</a>
    </body></html>`);
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
} else {
  // Export the app for Vercel serverless
  module.exports = app;
}
