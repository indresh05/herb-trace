import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShieldCheck, MapPin, Calendar, User, Building2, 
  FileCheck, ArrowRight, CheckCircle2, History, Info, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import Layout from './components/Layout';

const TraceNode = ({ event, isLast }) => {
  const date = new Date(event.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const getEventDetails = () => {
    switch (event.type) {
      case 'collection':
        return {
          title: 'Harvest & Collection',
          color: 'herb-leaf',
          details: [
            { label: 'Farmer', value: event.collector },
            { label: 'Origin', value: event.farmLocation },
            { label: 'Species', value: event.species },
            { label: 'Quality Grade', value: event.quality }
          ]
        };
      case 'processing':
        return {
          title: 'Processing & Refining',
          color: 'herb-charcoal',
          details: [
            { label: 'Facility', value: event.facility },
            { label: 'Location', value: event.facilityLocation },
            { label: 'Process Type', value: event.processType },
            { label: 'Manager', value: event.managerName }
          ]
        };
      case 'quality':
        return {
          title: 'Lab Verification',
          color: 'herb-turmeric',
          details: [
            { label: 'Lab', value: event.labName },
            { label: 'Result', value: event.resultStatus },
            { label: 'Manager', value: event.labManagerName },
            { label: 'Chemical Analysis', value: 'Verified', link: event.ipfsLink }
          ]
        };
      default:
        return { title: 'Unknown Event', color: 'gray-400', details: [] };
    }
  };

  const { title, color, details } = getEventDetails();

  return (
    <div className="relative pl-12 pb-16 last:pb-0">
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-herb-deep/10 dashed" 
             style={{ backgroundImage: 'linear-gradient(to bottom, #0F3D2E 50%, transparent 50%)', backgroundSize: '2px 10px' }} />
      )}
      
      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-4 border-${color} shadow-lg z-10 flex items-center justify-center`}>
        <div className={`w-2 h-2 rounded-full bg-${color}`} />
      </div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="glass-card p-8 group hover:border-herb-leaf/30 transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h4 className="text-xl font-bold text-herb-deep mb-1">{title}</h4>
            <p className="text-xs font-bold text-herb-charcoal/40 uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar className="w-3 h-3" /> {date}
            </p>
          </div>
          <div className={`px-4 py-1.5 rounded-lg bg-${color}/10 text-${color} text-xs font-bold uppercase tracking-wider border border-${color}/20`}>
            {event.type}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {details.map((d, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-widest mb-2">{d.label}</p>
              {d.link ? (
                <a href={d.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-herb-leaf flex items-center gap-1 hover:underline">
                  View Report <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <p className="text-sm font-bold text-herb-deep">{d.value}</p>
              )}
            </div>
          ))}
        </div>

        {event.imageLink && event.type === 'collection' && (
          <div className="mt-8 relative group">
            <p className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-widest mb-4">Harvest Documentation</p>
            <div className="relative overflow-hidden rounded-2xl border border-herb-deep/5 aspect-video sm:aspect-[21/9]">
              <img 
                src={event.imageLink} 
                alt="Harvest Documentation" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-herb-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <a 
                  href={event.imageLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/90 backdrop-blur-sm text-herb-deep px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" /> View Original IPFS Image
                </a>
              </div>
            </div>
          </div>
        )}

        {event.blockchainProof && (
          <div className="mt-8 pt-6 border-t border-herb-deep/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px]">
              <div className="flex items-center gap-2 text-herb-leaf font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Blockchain Verified
              </div>
              <div className="text-herb-charcoal/40 font-mono">Tx: {event.blockchainProof.txId.substring(0, 16)}...</div>
              <div className="text-herb-charcoal/40 font-mono">Block: #{event.blockchainProof.blockNumber}</div>
            </div>
            <a 
              href={`http://localhost:8080/#/channels/mychannel/transactions/${event.blockchainProof.txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] font-bold text-herb-leaf hover:underline bg-herb-leaf/5 px-3 py-1.5 rounded-full"
            >
              <ExternalLink className="w-3 h-3" /> View on Explorer
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ConsumerView = () => {
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState(searchParams.get('batchId') || '');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('batchId')) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!batchId) return;

    setLoading(true);
    setError('');
    setEvents([]);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/consumer/view?batchId=${batchId}`);
      if (res.data.ok && res.data.events.length > 0) {
        setEvents(res.data.events);
      } else {
        setError('No batch records found. Please verify the Batch ID.');
      }
    } catch (err) {
      setError('System error while retrieving records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-herb-cream/30 min-h-[90vh]">
        {/* Search Header */}
        <div className="bg-herb-deep text-white py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-herb-leaf/10 -skew-x-12 translate-x-1/4" />
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Trace Your <span className="text-herb-turmeric">Herb Journey</span>
            </motion.h2>
            <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto">
              Enter a Batch ID to view its immutable journey from farm to fork, secured by enterprise blockchain.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <input 
                type="text" 
                value={batchId}
                onChange={(e) => setBatchId(e.target.value.toUpperCase())}
                placeholder="Enter Batch ID (e.g., BATCH-12345)"
                className="w-full pl-6 pr-40 py-6 rounded-2xl bg-white text-herb-deep font-bold text-lg shadow-2xl focus:ring-4 focus:ring-herb-leaf/30 outline-none transition-all placeholder:text-herb-charcoal/30"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-3 top-3 bottom-3 bg-herb-leaf hover:bg-herb-deep text-white px-8 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Trace Batch'} 
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-20">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-red-100 p-12 rounded-[2rem] text-center shadow-xl shadow-red-500/5"
              >
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                  <Info className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-herb-deep mb-3">{error}</h3>
                <p className="text-herb-charcoal/50 max-w-sm mx-auto">Please check the ID on your product packaging and try again.</p>
              </motion.div>
            )}

            {events.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between mb-12 bg-white p-8 rounded-3xl shadow-sm border border-herb-deep/5">
                  <div className="flex items-center gap-6">
                    <div className="bg-herb-leaf/10 p-4 rounded-2xl">
                      <ShieldCheck className="w-8 h-8 text-herb-leaf" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-herb-deep">Batch Verified</h3>
                      <p className="text-herb-charcoal/40 font-mono text-sm tracking-tight">{batchId}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-[0.2em] mb-1">Blockchain Network</span>
                    <span className="text-sm font-bold text-herb-deep bg-herb-cream px-3 py-1 rounded-full border border-herb-deep/5">Hyperledger Fabric v2.5</span>
                  </div>
                </div>

                <div className="relative">
                  {events.map((event, i) => (
                    <TraceNode 
                      key={i} 
                      event={event} 
                      isLast={i === events.length - 1} 
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {!loading && !events.length && !error && (
              <div className="text-center py-20 opacity-20 flex flex-col items-center gap-4">
                <History className="w-24 h-24" />
                <p className="text-xl font-bold">Waiting for Batch Input</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default ConsumerView;
