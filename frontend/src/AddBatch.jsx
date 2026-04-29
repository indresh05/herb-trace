import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, ArrowLeft, Send, MapPin, Clock, ShieldCheck, 
  Leaf, Info, CheckCircle2, AlertCircle, RefreshCw, UploadCloud
} from 'lucide-react';
import axios from 'axios';
import exifr from 'exifr';
import { API_BASE_URL } from './apiConfig';
import Layout from './components/Layout';

const AddBatch = () => {
  const [profile, setProfile] = useState(null);
  const [species, setSpecies] = useState('Ashwagandha');
  const [otherSpecies, setOtherSpecies] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [metadata, setMetadata] = useState({ time: null, lat: null, lng: null, exif: false });
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'farmer') {
      navigate('/dashboard');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const dmsToDecimal = (dms, ref) => {
    if (!dms) return null;
    const [deg, min, sec] = dms;
    let dec = deg + (min / 60) + (sec / 3600);
    if (ref === 'S' || ref === 'W') dec = -dec;
    return dec;
  };

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setExtracting(true);
    setError('');

    try {
      const output = await exifr.parse(file, { gps: true, tiff: true });
      const exifTime = output?.DateTimeOriginal || output?.CreateDate;
      const lat = dmsToDecimal(output?.GPSLatitude, output?.GPSLatitudeRef);
      const lng = dmsToDecimal(output?.GPSLongitude, output?.GPSLongitudeRef);

      let finalLat = lat;
      let finalLng = lng;

      if (finalLat == null) {
        const geo = await getBrowserLocation();
        if (geo) {
          finalLat = geo.lat;
          finalLng = geo.lng;
        }
      }

      setMetadata({
        time: exifTime ? new Date(exifTime).toISOString() : new Date().toISOString(),
        lat: finalLat,
        lng: finalLng,
        exif: !!(exifTime || lat)
      });
    } catch (err) {
      console.error(err);
      const geo = await getBrowserLocation();
      setMetadata({
        time: new Date().toISOString(),
        lat: geo?.lat || null,
        lng: geo?.lng || null,
        exif: false
      });
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please provide a photo of the harvest.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('species', species === 'other' ? otherSpecies : species);
      fd.append('collector', profile.fullName);
      fd.append('farmLocation', profile.location);
      if (metadata.lat) fd.append('lat', metadata.lat);
      if (metadata.lng) fd.append('long', metadata.lng);
      fd.append('timestamp', metadata.time);
      fd.append('image', image);

      const res = await axios.post(`${API_BASE_URL}/api/farmer/add-herb`, fd, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.ok) {
        setSuccess(`Batch ${res.data.batchId} successfully registered on blockchain!`);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register batch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout role="farmer">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-herb-charcoal/50 hover:text-herb-deep font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-bold text-herb-deep mb-4">Record New Harvest</h1>
            <p className="text-herb-charcoal/60 mb-10 leading-relaxed">
              Capture your harvest details and secure them on the blockchain. Ensure camera and location access are enabled for maximum compliance.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="glass-card p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Herbal Species</label>
                  <select 
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white focus:ring-2 focus:ring-herb-leaf/20 outline-none transition-all font-medium"
                  >
                    <option value="Ashwagandha">Ashwagandha</option>
                    <option value="Tulsi">Tulsi</option>
                    <option value="Amla">Amla</option>
                    <option value="Neem">Neem</option>
                    <option value="other">Other Species</option>
                  </select>
                </div>

                {species === 'other' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Specify Species</label>
                    <input 
                      type="text"
                      placeholder="Enter species name"
                      value={otherSpecies}
                      onChange={(e) => setOtherSpecies(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf font-medium"
                      required
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Harvest Photo</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-herb-deep/10 rounded-2xl p-12 text-center group-hover:border-herb-leaf/50 transition-all bg-white/50">
                      <div className="bg-herb-leaf/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-herb-leaf" />
                      </div>
                      <p className="text-herb-deep font-bold mb-1">Click to Capture / Upload</p>
                      <p className="text-herb-charcoal/40 text-xs">JPEG, PNG up to 10MB</p>
                    </div>
                  </div>
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
                disabled={loading || extracting}
                className="btn-primary w-full py-5 flex items-center justify-center gap-3 text-lg disabled:opacity-50 shadow-xl shadow-herb-leaf/20"
              >
                {loading ? 'Securing on Blockchain...' : 'Register Harvest'} 
                {!loading && <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 bg-herb-deep text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-herb-leaf/20 rounded-full translate-x-16 -translate-y-16 blur-2xl" />
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-herb-turmeric" /> Compliance Check
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Digital Signature</span>
                  <span className="text-herb-leaf font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Geo-Locking</span>
                  <span className={metadata.lat ? 'text-herb-leaf font-bold' : 'text-herb-turmeric font-bold'}>
                    {metadata.lat ? 'Enabled' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Timestamping</span>
                  <span className="text-herb-leaf font-bold">Automatic</span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {preview && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card overflow-hidden"
                >
                  <img src={preview} alt="Harvest" className="w-full h-64 object-cover" />
                  <div className="p-6 space-y-4 bg-white">
                    <h4 className="font-bold text-herb-deep flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-herb-leaf" /> Metadata Analysis
                    </h4>
                    {extracting ? (
                      <div className="flex items-center gap-2 text-herb-charcoal/40 text-sm italic">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Extracting details...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 text-xs font-semibold uppercase tracking-wider text-herb-charcoal/50">
                        <div className="flex items-center gap-2 bg-herb-cream/50 p-3 rounded-lg">
                          <Clock className="w-4 h-4 text-herb-deep" /> {new Date(metadata.time).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 bg-herb-cream/50 p-3 rounded-lg">
                          <MapPin className="w-4 h-4 text-herb-deep" /> {metadata.lat ? `${metadata.lat.toFixed(4)}, ${metadata.lng.toFixed(4)}` : 'No Location Data'}
                        </div>
                        <div className="flex items-center gap-2 bg-herb-cream/50 p-3 rounded-lg">
                          <Info className="w-4 h-4 text-herb-deep" /> {metadata.exif ? 'Verified Photo EXIF' : 'Browser Fallback Data'}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddBatch;
