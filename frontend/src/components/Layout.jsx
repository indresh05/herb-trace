import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Menu, User } from 'lucide-react';

const Layout = ({ children, role }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username'); // Assuming we store it

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-herb-deep text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-herb-leaf p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Herb<span className="text-herb-turmeric">Trace</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="hover:text-herb-turmeric transition-colors font-medium">Home</Link>
              <Link to="/consumer" className="hover:text-herb-turmeric transition-colors font-medium">Trace Batch</Link>
              
              {token ? (
                <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                  <span className="text-sm font-semibold px-3 py-1 bg-white/10 rounded-full flex items-center gap-2 uppercase tracking-wider">
                    <User className="w-3 h-3" /> {username || role || 'User'}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2 px-8">Login</Link>
              )}
            </div>

            <div className="md:hidden">
              <Menu className="w-6 h-6" />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-herb-charcoal text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <Leaf className="w-6 h-6 text-herb-leaf" />
            <span className="text-xl font-bold text-white tracking-tight">HerbTrace Enterprise</span>
          </div>
          <p className="max-w-md mx-auto text-sm mb-8 leading-relaxed">
            Revolutionizing the Ayurvedic supply chain with transparent, blockchain-verified traceability from origin to consumer.
          </p>
          <div className="border-t border-white/5 pt-8 text-xs uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} HerbTrace. Secured by Hyperledger Fabric.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
