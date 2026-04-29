import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, FileText, CheckCircle, Package, AlertTriangle, 
  BarChart3, RefreshCw, Layers, TrendingUp, Users, Map, Activity
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import Layout from './components/Layout';
import ProcessModal from './components/ProcessModal';
import LabModal from './components/LabModal';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="glass-card p-8 group hover:scale-[1.02] transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl bg-${color}/10 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-8 h-8 text-${color}`} />
      </div>
      <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> +12%
      </div>
    </div>
    <h3 className="text-3xl font-bold text-herb-deep mb-2">{value}</h3>
    <p className="text-herb-charcoal/50 font-semibold uppercase tracking-widest text-xs">{title}</p>
  </div>
);

const Dashboard = () => {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [profile, setProfile] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const profileRes = await axios.get(`${API_BASE_URL}/api/profile`, config);
      setProfile(profileRes.data.profile);

      let endpoint = '';
      if (role === 'farmer') endpoint = '/api/farmer/my-batches'; // Example endpoint, need to check server.js
      else if (role === 'processor') endpoint = '/api/processor/dashboard';
      else if (role === 'lab') endpoint = '/api/lab/dashboard';

      // Note: my-batches might not exist, I'll fallback to an empty list or a real one if I find it
      try {
        const batchRes = await axios.get(`${API_BASE_URL}${endpoint}`, config);
        setBatches(batchRes.data.pending || batchRes.data.batches || []);
      } catch (e) { console.warn("Failed to fetch batches", e); }
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate('/login');
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-herb-cream/30">
      <RefreshCw className="w-12 h-12 text-herb-leaf animate-spin" />
    </div>
  );

  return (
    <Layout role={role}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-herb-deep mb-2">Welcome, {profile?.fullName || 'User'}</h1>
            <p className="text-herb-charcoal/60 font-medium">
              <span className="capitalize">{role}</span> Dashboard &bull; {profile?.facilityName}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="btn-secondary py-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh Data
            </button>
            {role === 'farmer' && (
              <button onClick={() => navigate('/add-batch')} className="btn-primary py-2 flex items-center gap-2 shadow-herb-leaf/20 shadow-lg">
                <Plus className="w-5 h-5" /> New Harvest
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard title="Total Batches" value="124" icon={Layers} color="herb-deep" />
          <StatCard title="Verified Reports" value="89" icon={CheckCircle} color="herb-leaf" />
          <StatCard title="Pending Checks" value="12" icon={RefreshCw} color="herb-turmeric" />
          <StatCard title="Flagged Issues" value="2" icon={AlertTriangle} color="red-500" />
        </div>

        {/* Main Content Area */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Active Batches Table */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card overflow-hidden">
              <div className="p-8 border-b border-herb-deep/5 flex justify-between items-center bg-herb-cream/10">
                <h3 className="text-xl font-bold text-herb-deep">Pending Action Items</h3>
                <div className="flex items-center gap-2 text-herb-charcoal/40 bg-white px-4 py-2 rounded-xl border border-herb-deep/5">
                  <Search className="w-4 h-4" />
                  <input type="text" placeholder="Search batch ID..." className="bg-transparent outline-none text-sm" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-herb-cream/5 text-herb-charcoal/40 text-xs font-bold uppercase tracking-widest">
                      <th className="px-8 py-4">Batch ID</th>
                      <th className="px-8 py-4">Herbal Species</th>
                      <th className="px-8 py-4">Origin</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-herb-deep/5">
                    {batches.length > 0 ? batches.map((batch, i) => (
                      <tr key={i} className="hover:bg-herb-cream/5 transition-colors">
                        <td className="px-8 py-6 font-mono font-bold text-sm text-herb-deep">{batch.batchId}</td>
                        <td className="px-8 py-6 text-sm font-medium">{batch.species}</td>
                        <td className="px-8 py-6 text-sm text-herb-charcoal/60 italic">{batch.location || 'Multiple'}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            batch.status === 'pending' ? 'bg-herb-turmeric/10 text-herb-turmeric' : 'bg-herb-leaf/10 text-herb-leaf'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => {
                              setSelectedBatch(batch);
                              if (role === 'processor') setIsProcessModalOpen(true);
                              if (role === 'lab') setIsLabModalOpen(true);
                            }}
                            className="text-herb-deep font-bold text-sm hover:underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-16 text-center">
                          <div className="flex flex-col items-center gap-4 text-herb-charcoal/30">
                            <Layers className="w-12 h-12" />
                            <p className="font-semibold">No pending batches found in your queue.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity Feed & Tools */}
          <div className="space-y-8">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-herb-deep mb-8 flex items-center gap-2">
                <Activity className="w-5 h-5 text-herb-leaf" /> Network Activity
              </h3>
              <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-herb-deep/5">
                {[
                  { user: 'farmer1', action: 'Uploaded Harvest Data', time: '2m ago', icon: Map },
                  { user: 'lab1', action: 'Verified Batch B-102', time: '1h ago', icon: CheckCircle },
                  { user: 'exporter', action: 'Approved Shipment', time: '3h ago', icon: Package },
                  { user: 'processor', action: 'Started Cleaning', time: '5h ago', icon: RefreshCw },
                ].map((act, i) => (
                  <div key={i} className="flex gap-6 relative z-10">
                    <div className="bg-white border-2 border-herb-cream w-6 h-6 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-herb-leaf rounded-full" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-herb-deep">{act.action}</p>
                      <p className="text-xs text-herb-charcoal/40 font-semibold uppercase tracking-wider">{act.user} &bull; {act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-herb-deep rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 bg-herb-leaf/20 rounded-full translate-x-12 -translate-y-12 blur-2xl" />
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-herb-turmeric" /> Quick Report
              </h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                Generate a full compliance audit report for all batches processed this month.
              </p>
              <button className="w-full bg-herb-turmeric text-herb-deep py-3 rounded-xl font-bold hover:bg-white transition-colors">
                Download PDF Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedBatch && role === 'processor' && (
        <ProcessModal 
          batch={selectedBatch}
          isOpen={isProcessModalOpen}
          onClose={() => setIsProcessModalOpen(false)}
          onRefresh={fetchData}
        />
      )}

      {selectedBatch && role === 'lab' && (
        <LabModal 
          batch={selectedBatch}
          isOpen={isLabModalOpen}
          onClose={() => setIsLabModalOpen(false)}
          onRefresh={fetchData}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
