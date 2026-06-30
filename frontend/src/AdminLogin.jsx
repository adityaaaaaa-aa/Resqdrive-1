import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Terminal } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleOverride = (e) => {
    e.preventDefault();
    if (adminId === 'ADMIN-007' && password === 'ResQDrive@2026') {
      setErrorMessage('');
      navigate('/admin-dashboard');
    } else {
      setErrorMessage('ACCESS DENIED: INVALID CREDENTIALS');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#050B14] font-mono text-gray-900 dark:text-red-500 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      {/* Background visual effects */}
      <div className="absolute inset-0 bg-red-900/5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-gray-100/5 to-gray-100 dark:via-[#050B14]/5 dark:to-[#050B14] pointer-events-none transition-colors duration-300" />
      
      {/* Terminal text top left */}
      <div className="absolute top-4 left-4 text-xs text-red-600/70 tracking-widest hidden sm:block">
        <p>SYSTEM.SEC.PROTOCOL_v9.4.22</p>
        <p>TERMINAL_NODE: XG-881</p>
        <p className="animate-pulse mt-2">&gt;_ AWAITING_INPUT...</p>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="border border-red-600 rounded-none bg-white/80 dark:bg-[#050B14]/80 p-8 shadow-[0_0_20px_rgba(220,38,38,0.15)] backdrop-blur-sm relative transition-colors duration-300">
          
          <div className="flex flex-col items-center mb-8 border-b border-red-900/50 pb-6">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-[pulse_2s_ease-in-out_infinite]" />
            <h1 className="text-xl font-bold tracking-[0.2em] text-center text-red-500">
              RESTRICTED AREA
            </h1>
            <h2 className="text-sm tracking-widest text-red-600 mt-1">
              // SYSTEM OVERRIDE
            </h2>
          </div>

          <form onSubmit={handleOverride} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs tracking-widest text-red-600 uppercase">
                ADMIN ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full bg-red-950/20 border border-red-600 text-red-500 px-4 py-3 rounded-none focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder-red-800 transition-all"
                  placeholder="ENTER ID"
                  required
                />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500 m-1" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs tracking-widest text-red-600 uppercase">
                MASTER CIPHER (Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-red-950/20 border border-red-600 text-red-500 px-4 py-3 rounded-none focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder-red-800 transition-all"
                  placeholder="••••••••••••"
                  required
                />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500 m-1" />
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-500 font-bold tracking-widest text-center uppercase text-sm animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-red-500/50 bg-red-950/30 p-2">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-black font-bold py-4 px-4 rounded-none transition-colors duration-200 uppercase tracking-widest mt-8 flex items-center justify-center group"
            >
              <span>INITIATE OVERRIDE</span>
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                &gt;
              </span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-red-900/50 pt-4">
            <p className="text-[10px] text-red-600/70 tracking-widest flex items-center justify-center">
              <Terminal className="w-3 h-3 mr-2" />
              UNAUTHORIZED ACCESS WILL BE LOGGED AND TRACKED
            </p>
          </div>
        </div>
        
        {/* Decorative corner pieces outside the main box */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-red-600" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-red-600" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-red-600" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-red-600" />
      </div>
    </div>
  );
};

export default AdminLogin;
