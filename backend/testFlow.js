const FormData = require('form-data');
// Using raw fetch in Node 20

async function test() {
  try {
    console.log("1. Farmer Login...");
    let res = await fetch('http://localhost:3000/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'farmer1', password: 'password123' })
    });
    let data = await res.json();
    if (!data.ok) throw new Error("Farmer login failed: " + JSON.stringify(data));
    const token1 = data.token;

    console.log("2. Farmer Creates Batch...");
    const form = new FormData();
    form.append('species', 'Mint');
    form.append('quality', 'A+');
    res = await fetch('http://localhost:3000/api/farmer/add-herb', {
      method: 'POST', headers: { 'Authorization': `Bearer ${token1}`, ...form.getHeaders() },
      body: form
    });
    data = await res.json();
    if (!data.ok) throw new Error("Batch creation failed: " + JSON.stringify(data));
    const batchId = data.batchId;
    console.log("   -> Created Batch:", batchId);

    console.log("3. Processor Login...");
    res = await fetch('http://localhost:3000/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'processor1', password: 'password123' })
    });
    data = await res.json();
    const token2 = data.token;

    console.log("4. Processor checking pending batches...");
    res = await fetch('http://localhost:3000/api/processor/dashboard', {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    data = await res.json();
    const pendingProc = data.pending.find(b => b.batchId === batchId);
    if (!pendingProc) throw new Error("Batch not found in processor dashboard! Found: " + JSON.stringify(data.pending));
    console.log("   -> Found batch in processor dashboard!");

    console.log("5. Processor Processes Batch...");
    res = await fetch('http://localhost:3000/api/processor/process', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({ batchId, processType: 'Drying' })
    });
    data = await res.json();
    if (!data.ok) throw new Error("Process failed: " + JSON.stringify(data));
    console.log("   -> Processed successfully!");

    console.log("6. Lab Login...");
    res = await fetch('http://localhost:3000/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'lab1', password: 'password123' })
    });
    data = await res.json();
    const token3 = data.token;

    console.log("7. Lab checking pending batches...");
    res = await fetch('http://localhost:3000/api/lab/dashboard', {
      headers: { 'Authorization': `Bearer ${token3}` }
    });
    data = await res.json();
    const pendingLab = data.pending.find(b => b.batchId === batchId);
    if (!pendingLab) throw new Error("Batch not found in lab dashboard! Found: " + JSON.stringify(data.pending));
    console.log("   -> Found batch in lab dashboard!");

    console.log("SUCCESS! The flow works perfectly.");
  } catch (err) {
    console.error("TEST FAILED:", err.message);
  }
}
test();
