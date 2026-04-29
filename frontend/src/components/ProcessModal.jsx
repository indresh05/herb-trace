import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, RefreshCw, MapPin, ShieldCheck, Send } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const ProcessModal = ({ batch, isOpen, onClose, onRefresh }) => {
  const [processType, setProcessType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      refreshGeo();
    }
  }, [isOpen]);

  const refreshGeo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn("Geo access denied"),
      { enableHighAccuracy: true }
    );
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!processType) return setError('Please enter a process type');

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const body = {
        batchId: batch.batchId,
        processType,
        ...(geo?.lat && { lat: geo.lat }),
        ...(geo?.lng && { long: geo.lng })
      };

      const res = await axios.post(`${API_BASE_URL}/api/processor/process`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.ok) {
        setSuccess(`Batch ${batch.batchId} processed successfully!`);
        setTimeout(() => {
          onRefresh();
          onClose();
          setSuccess('');
          setProcessType('');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Processing failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-herb-deep/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-lg relative z-10 overflow-hidden bg-white"
          >
            <div className="bg-herb-deep text-white p-8">
              <button onClick={onClose} className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold mb-2">Process Batch</h3>
              <p className="text-white/60 text-sm font-mono tracking-tight">{batch.batchId}</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-herb-cream/50 p-4 rounded-xl border border-herb-deep/5">
                  <p className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-widest mb-1">Species</p>
                  <p className="font-bold text-herb-deep">{batch.species}</p>
                </div>
                <div className="bg-herb-cream/50 p-4 rounded-xl border border-herb-deep/5">
                  <p className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-widest mb-1">Current Status</p>
                  <span className="px-2 py-0.5 rounded-full bg-herb-turmeric/10 text-herb-turmeric text-[10px] font-bold uppercase border border-herb-turmeric/20">
                    {batch.status}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProcess} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Process Type</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Drying, Cleaning, Pulverizing"
                    value={processType}
                    onChange={(e) => setProcessType(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf font-medium"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-herb-charcoal/40 bg-herb-cream/30 p-4 rounded-xl border border-dashed border-herb-deep/10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> 
                    {geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Detecting Location...'}
                  </div>
                  <div className="flex items-center gap-2 text-herb-leaf">
                    <ShieldCheck className="w-4 h-4" /> Blockchain Ready
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-100 font-bold">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                >
                  {loading ? 'Processing on Blockchain...' : 'Process Batch'} 
                  {!loading && <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProcessModal;
