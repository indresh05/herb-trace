import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import Layout from './components/Layout';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!role) {
      setError('Please select a role');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE_URL}/api/login`, { username, password });
        if (res.data.ok) {
          if (res.data.role !== role) {
            setError(`Role mismatch. Your account is registered as "${res.data.role}"`);
            setLoading(false);
            return;
          }
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.role);
          localStorage.setItem('username', username);
          navigate('/dashboard');
        }
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/register`, {
          username, password, role, fullName, location, facilityName
        });
        if (res.data.ok) {
          setSuccess('Identity registered successfully! Switching to login...');
          setTimeout(() => setIsLogin(true), 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="glass-card p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-herb-leaf/10 rounded-full translate-x-16 -translate-y-16 blur-2xl" />
            
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-herb-deep mb-3">
                {isLogin ? 'Welcome Back' : 'Create Identity'}
              </h2>
              <p className="text-herb-charcoal/60">
                {isLogin 
                  ? 'Access your enterprise blockchain dashboard.' 
                  : 'Register your facility on the Hyperledger Fabric network.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-herb-deep uppercase tracking-wider">Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white focus:ring-2 focus:ring-herb-leaf/20 focus:border-herb-leaf outline-none transition-all"
                  required
                >
                  <option value="">Select your organization role</option>
                  <option value="farmer">Farmer / Cultivator</option>
                  <option value="processor">Processing Facility</option>
                  <option value="lab">Quality Control Lab</option>
                </select>
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Location" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf"
                        required
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Facility / Farm Name" 
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-herb-charcoal/30" />
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-herb-charcoal/30" />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-herb-deep/10 bg-white outline-none focus:border-herb-leaf"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 bg-green-50 text-green-600 p-4 rounded-xl text-sm border border-green-100">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Identity')} 
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-herb-deep/5 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-herb-leaf font-bold hover:text-herb-deep transition-colors"
              >
                {isLogin ? "Don't have an account? Register" : "Already registered? Sign In"}
              </button>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-3 text-herb-charcoal/40 text-sm font-medium">
            <ShieldCheck className="w-5 h-5" /> Secured by Enterprise Grade Encryption
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
