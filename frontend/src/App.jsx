import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Dashboard from './Dashboard';
import ConsumerView from './ConsumerView';
import AddBatch from './AddBatch';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-batch" element={<AddBatch />} />
        <Route path="/consumer" element={<ConsumerView />} />
        <Route path="/qr" element={<ConsumerView />} /> {/* Map /qr to ConsumerView as they are similar */}
      </Routes>
    </Router>
  );
}

export default App;
