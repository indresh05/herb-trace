import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, MapPin, ClipboardCheck, ArrowRight, Activity, Database } from 'lucide-react';
import HerbTrace3DJourney from './components/HerbTrace3DJourney';
import Layout from './components/Layout';

const Home = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-herb-cream/50 -skew-x-12 translate-x-1/2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-herb-leaf/10 text-herb-leaf px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase mb-8 border border-herb-leaf/20">
                <Database className="w-4 h-4" /> Enterprise Blockchain Solution
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold text-herb-deep mb-8 leading-[1.1]">
                Trace every herb. <br />
                <span className="text-herb-turmeric">Verify every claim.</span>
              </h1>
              
              <p className="text-xl text-herb-charcoal/70 mb-12 leading-relaxed max-w-lg">
                Blockchain-backed traceability for Ayurvedic and herbal supply chains — from farm origin to lab verification and QR-based customer trust.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/consumer" className="btn-primary flex items-center justify-center gap-2 text-lg">
                  Track a Batch <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary flex items-center justify-center gap-2 text-lg">
                  View Dashboard
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-3 gap-8 border-t border-herb-deep/5 pt-12">
                <div>
                  <div className="text-3xl font-bold text-herb-deep mb-1">100%</div>
                  <div className="text-sm text-herb-charcoal/50 uppercase tracking-widest font-semibold">Immutable</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-herb-deep mb-1">2.4k+</div>
                  <div className="text-sm text-herb-charcoal/50 uppercase tracking-widest font-semibold">Batches</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-herb-deep mb-1">Org2</div>
                  <div className="text-sm text-herb-charcoal/50 uppercase tracking-widest font-semibold">Multi-Org</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <HerbTrace3DJourney />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-herb-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-herb-deep mb-6">Trust Through Transparency</h2>
            <p className="text-herb-charcoal/60 text-lg leading-relaxed">
              Our enterprise-grade traceability platform ensures that every stakeholder in the herbal supply chain is verified and every data point is immutable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Shield,
                title: "Blockchain Security",
                desc: "Powered by Hyperledger Fabric for high-performance enterprise transactions and privacy.",
                color: "herb-deep"
              },
              {
                icon: MapPin,
                title: "Origin Verification",
                desc: "Geo-stamped data from farmers ensures you know exactly where your herbs were grown.",
                color: "herb-leaf"
              },
              {
                icon: ClipboardCheck,
                title: "Quality Compliance",
                desc: "Immutable lab reports and chemical analysis results attached directly to the batch record.",
                color: "herb-turmeric"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-3xl shadow-xl shadow-herb-deep/5 border border-herb-deep/5"
              >
                <div className={`bg-${feature.color}/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-herb-deep mb-4">{feature.title}</h3>
                <p className="text-herb-charcoal/70 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-herb-deep rounded-[3rem] p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-herb-leaf/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-herb-turmeric/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8 relative z-10">Ready to secure your supply chain?</h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed relative z-10">
              Join leading herbal brands and farmers already using HerbTrace to build unmatched customer confidence.
            </p>
            <div className="flex justify-center gap-6 relative z-10">
              <Link to="/login" className="bg-herb-turmeric text-herb-deep px-10 py-4 rounded-xl font-bold hover:bg-white transition-all duration-300 shadow-xl shadow-herb-turmeric/20">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
