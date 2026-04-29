import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, RefreshCw, MapPin, ShieldCheck, FileUp, FileText } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

const LabModal = ({ batch, isOpen, onClose, onRefresh }) => {
  const [resultStatus, setResultStatus] = useState('');
  const [reportFile, setReportFile] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resultStatus) return setError('Please select a result status');
    if (!reportFile) return setError('Please upload a PDF report');

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('batchId', batch.batchId);
      fd.append('resultStatus', resultStatus);
      fd.append('file', reportFile);
      if (geo?.lat) fd.append('lat', geo.lat);
      if (geo?.lng) fd.append('long', geo.lng);

      const res = await axios.post(`${API_BASE_URL}/api/lab/upload-report`, fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.ok) {
        setSuccess(`Lab report for ${batch.batchId} uploaded and verified on blockchain!`);
        setTimeout(() => {
          onRefresh();
          onClose();
          setSuccess('');
          setResultStatus('');
          setReportFile(null);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
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
              <h3 className="text-2xl font-bold mb-2">Upload Lab Report</h3>
              <p className="text-white/60 text-sm font-mono tracking-tight">{batch.batchId}</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-herb-cream/50 p-4 rounded-xl border border-herb-deep/5">
                  <p className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-widest mb-1">Herbal Species</p>
                  <p className="font-bold text-herb-deep">{batch.species}</p>
                </div>
                <div className="bg-herb-cream/50 p-4 rounded-xl border border-herb-deep/5">
                  <p className="text-[10px] font-bold text-herb-charcoal/40 uppercase tracking-widest mb-1">Processor</p>
                  <p className="font-bold text-herb-deep text-xs truncate">{batch.processor || 'Processed'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Quality Result</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setResultStatus('pass')}
                      className={`py-4 rounded-xl border-2 font-bold transition-all ${
                        resultStatus === 'pass' 
                          ? 'bg-herb-leaf/10 border-herb-leaf text-herb-leaf' 
                          : 'bg-white border-herb-deep/5 text-herb-charcoal/40 hover:border-herb-leaf/30'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1" /> PASS
                    </button>
                    <button 
                      type="button"
                      onClick={() => setResultStatus('fail')}
                      className={`py-4 rounded-xl border-2 font-bold transition-all ${
                        resultStatus === 'fail' 
                          ? 'bg-red-50 border-red-500 text-red-500' 
                          : 'bg-white border-herb-deep/5 text-herb-charcoal/40 hover:border-red-500/30'
                      }`}
                    >
                      <AlertCircle className="w-5 h-5 mx-auto mb-1" /> FAIL
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Digital Lab Report (PDF)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={(e) => setReportFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-herb-deep/10 rounded-2xl p-8 text-center group-hover:border-herb-leaf/50 transition-all bg-herb-cream/20">
                      {reportFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="w-10 h-10 text-herb-leaf" />
                          <p className="text-herb-deep font-bold text-sm truncate max-w-[200px]">{reportFile.name}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <FileUp className="w-10 h-10 text-herb-charcoal/20" />
                          <p className="text-herb-charcoal/40 text-xs font-bold uppercase tracking-widest">Select PDF Document</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-herb-charcoal/40 bg-herb-cream/30 p-4 rounded-xl border border-dashed border-herb-deep/10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> 
                    {geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : 'Detecting Location...'}
                  </div>
                  <div className="flex items-center gap-2 text-herb-leaf">
                    <ShieldCheck className="w-4 h-4" /> IPFS Verified
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
                  {loading ? 'Uploading to IPFS...' : 'Verify & Submit'} 
                  {!loading && <FileUp className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LabModal;
