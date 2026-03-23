import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldAlert, Car, PhoneCall, ChevronRight, Building } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [React.createRef(), React.createRef(), React.createRef(), React.createRef()];

  // Auto-format vehicle number (e.g. MH 12 AB 1234)
  const handleVehicleChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + ' ' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + ' ' + val.slice(5);
    if (val.length > 8) val = val.slice(0, 8) + ' ' + val.slice(8);
    setVehicleNo(val.slice(0, 13));
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value !== '' && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const submitOtp = (e) => {
    e.preventDefault();
    if (otp.join('').length === 4) {
      navigate('/dashboard'); // the main app
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'white' }} className="md:grid-cols-2">
      
      {/* LEFT PANEL - DESKTOP ONLY */}
      <div className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden bg-bg border-r border-border">
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--cyan-dim) 1px, transparent 1px), linear-gradient(90deg, var(--cyan-dim) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10">
          <div className="nav-logo text-3xl mb-4 font-display flex items-center gap-3 tracking-widest text-[#00e5ff] font-black">
            <div className="dot w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            ResQDrive
          </div>
          <p className="text-[#4a6080] max-w-sm text-sm tracking-widest font-mono leading-relaxed mt-4">
            AI-POWERED EMERGENCY CONTAINMENT PROTOCOL.<br/>
            VEHICLE TELEMETRY ONLINE.<br/>
            RESPONSE UNITS STANDING BY.
          </p>
        </div>

        {/* Center Graphic */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* Glowing rings */}
            <div className="absolute inset-0 rounded-full border border-[#00e5ff] opacity-30 animate-pulse" />
            <div className="absolute inset-4 rounded-full border border-[#00e5ff] opacity-20" style={{ animation: 'spin 10s linear infinite' }} />
            <div className="absolute inset-8 rounded-full border border-red-500 opacity-20" style={{ animation: 'spin 15s linear infinite reverse' }} />
            <div className="text-[#00e5ff] opacity-60">
              <Car size={100} strokeWidth={1} />
            </div>
            
            {/* Telemetry Dots */}
            <div className="absolute top-1/4 right-0 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red] animate-ping" />
            <div className="absolute bottom-1/4 left-0 w-2 h-2 bg-[#00e5ff] rounded-full shadow-[0_0_10px_cyan] animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        <div className="relative z-10 text-xs font-mono text-[#00e5ff] tracking-widest opacity-80">
          SECURE CONNECTION ESTABLISHED // AES-256
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden pt-12 md:pt-0">
        
        {/* Background flares for mobile */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none md:hidden" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none md:hidden" />
        
        <div className="w-full max-w-md bg-[#0d1422] border border-[#00e5ff]/20 rounded-xl p-8 lg:p-10 shadow-2xl relative z-10">
          
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            <h1 className="font-display font-bold text-2xl text-[#00e5ff] tracking-wider">ResQDrive</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide flex items-center gap-2 font-display">
              <ShieldAlert className="text-red-500" size={24} />
              AMBULANCE OPERATOR PORTAL
            </h2>
            <p className="text-[#4a6080] text-sm font-mono tracking-wide leading-relaxed">Enter vehicle credentials to securely access the emergency telemetry dashboard.</p>
          </div>

          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); if (username && vehicleNo.length >= 10 && hospitalId.length >= 4) setStep(2); }} className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <div className="space-y-2">
                <label className="text-xs font-mono text-[#00e5ff] tracking-widest block uppercase">AMBULANCE OPERATOR NAME</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#111928] border border-[#00e5ff]/20 text-white px-4 py-3 rounded outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/50 transition-all font-ui placeholder-[#4a6080]"
                  placeholder="e.g. Aditya"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#00e5ff] tracking-widest block uppercase">ASSIGNED VEHICLE NUMBER</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#4a6080]">
                    <Car size={16} />
                  </div>
                  <input 
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={handleVehicleChange}
                    className="w-full bg-[#111928] border border-[#00e5ff]/20 text-white pl-10 pr-4 py-3 rounded outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/50 transition-all font-mono tracking-wider font-bold placeholder-[#4a6080]"
                    placeholder="DL 01 AB 1234"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-[#00e5ff] tracking-widest block uppercase">AFFILIATED HOSPITAL ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#4a6080]">
                    <Building size={16} />
                  </div>
                  <input 
                    type="text"
                    required
                    value={hospitalId}
                    onChange={e => setHospitalId(e.target.value.toUpperCase())}
                    className="w-full bg-[#111928] border border-[#00e5ff]/20 text-white pl-10 pr-4 py-3 rounded outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/50 transition-all font-mono tracking-wider font-bold placeholder-[#4a6080]"
                    placeholder="e.g. HOSP-DEL-9021"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-white text-[#060810] font-bold tracking-wider py-3.5 rounded flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] mt-8">
                GET OTP <ChevronRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={submitOtp} className="space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <div className="p-4 bg-[#00e676]/10 border border-[#00e676]/20 rounded mb-6 flex gap-3 text-sm text-[#00e676]/90 font-mono items-start leading-relaxed">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p>OTP sent to the mobile number registered with vehicle <strong className="text-white bg-[#111928] px-1 py-0.5 rounded">{vehicleNo}</strong>.</p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-mono text-[#00e5ff] tracking-widest block uppercase text-center">Enter 4-Digit Activation Code</label>
                <div className="flex justify-between gap-3 px-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      autoFocus={i === 0}
                      className="w-14 h-16 bg-[#111928] border-b-2 border-t-0 border-l-0 border-r-0 border-[#00e5ff]/30 text-center text-2xl text-white font-mono font-bold focus:border-[#00e5ff] focus:bg-[#00e5ff]/5 outline-none transition-all rounded shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={otp.join('').length < 4} className="w-full bg-[#ff1a2e] text-white font-bold tracking-widest py-3.5 rounded mt-8 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(255,26,46,0.3)] flex items-center justify-center gap-2">
                VERIFY & LOGIN
              </button>

              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-mono text-[#4a6080] hover:text-white transition-colors pt-2 pb-0 uppercase tracking-widest">
                Return to vehicle input
              </button>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-[#00e5ff]/10 space-y-3">
            <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-3 bg-[#111928] border border-[#ff1a2e]/30 text-[#ff1a2e] hover:bg-[#ff1a2e]/10 transition-colors py-3.5 rounded font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(255,26,46,0.1)]">
              <PhoneCall size={16} className="animate-pulse" />
              EMERGENCY SOS (Bypass Login)
            </button>
            <button onClick={() => navigate('/register')} className="w-full flex items-center justify-center gap-3 bg-[#00e5ff] text-[#0d1422] hover:bg-[#00e5ff]/80 transition-colors py-3.5 rounded font-mono text-xs font-bold tracking-widest uppercase shadow-[0_0_10px_rgba(0,229,255,0.3)] mt-2">
              <ShieldAlert size={16} />
              Register New Profile
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
