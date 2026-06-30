import React, { useState } from 'react';
import { Navigation, CheckCircle, ShieldAlert, Car, Power, MapPin, HeartPulse, User, Droplets, AlertOctagon } from 'lucide-react';
import ThemeToggleButton from '../components/ThemeToggleButton';

const AmbulanceDashboard = () => {
  const [onDuty, setOnDuty] = useState(false);
  const [missionStatus, setMissionStatus] = useState('ASSIGNED'); // 'ASSIGNED', 'ACCEPTED', 'AT_SCENE', 'SECURED'

  const mockMission = {
    id: 'SOS-001',
    distance: '3.2 KM',
    eta: '4 MINS',
    coords: '28.6139° N, 77.2090° E',
    routeInfo: 'Via NH-8 (Clear traffic)',
    victim: {
      name: 'John Doe',
      bloodGroup: 'O+',
      allergies: 'Penicillin',
      conditions: 'None'
    }
  };

  const handleAction = () => {
    if (missionStatus === 'ASSIGNED') setMissionStatus('ACCEPTED');
    else if (missionStatus === 'ACCEPTED') setMissionStatus('AT_SCENE');
    else if (missionStatus === 'AT_SCENE') setMissionStatus('SECURED');
  };

  const getActionButtonConfig = () => {
    switch(missionStatus) {
      case 'ASSIGNED':
        return { text: 'ACCEPT MISSION', icon: <ShieldAlert className="w-6 h-6" />, color: 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]' };
      case 'ACCEPTED':
        return { text: 'REACHED SCENE', icon: <Navigation className="w-6 h-6" />, color: 'bg-orange-500 hover:bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.5)]' };
      case 'AT_SCENE':
        return { text: 'PATIENT SECURED', icon: <CheckCircle className="w-6 h-6" />, color: 'bg-[#00e5ff] text-[#050B14] hover:bg-[#00e5ff]/80 shadow-[0_0_20px_rgba(0,229,255,0.5)]' };
      case 'SECURED':
        return { text: 'MISSION COMPLETE - AWAITING NEW', icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-600 cursor-not-allowed opacity-80', disabled: true };
      default:
        return null;
    }
  };

  const actionConfig = getActionButtonConfig();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#050B14] text-gray-900 dark:text-white p-4 font-mono selection:bg-[#00e5ff] selection:text-[#050B14] flex flex-col md:max-w-md mx-auto border-x border-gray-300 dark:border-[#00e5ff]/10 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-gray-300 dark:border-[#00e5ff]/20 pb-4 mb-6">
        <div>
          <h1 className="text-[#00e5ff] font-bold tracking-widest text-lg flex items-center gap-2">
            <Car className="w-5 h-5" /> DL-01-AB-1234
          </h1>
          <p className="text-gray-400 text-xs tracking-widest uppercase mt-1">Opr: Aditya (ID: 9021)</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <button 
            onClick={() => setOnDuty(!onDuty)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider transition-all ${
              onDuty 
                ? 'bg-green-100 dark:bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)]' 
                : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}
          >
            <Power className={`w-3 h-3 ${onDuty ? 'animate-pulse' : ''}`} />
            {onDuty ? 'ON DUTY' : 'OFF DUTY'}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {onDuty ? (
        <div className="flex-1 flex flex-col gap-6">
          
          {/* MISSION CARD */}
          <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-500 ${
            missionStatus === 'ASSIGNED' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' :
            missionStatus === 'ACCEPTED' ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]' :
            'bg-white dark:bg-[#0a1526] border-gray-200 dark:border-[#00e5ff]/30 shadow-sm dark:shadow-[0_0_20px_rgba(0,229,255,0.1)]'
          }`}>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-bl-lg">
              CRITICAL
            </div>
            
            <h2 className="text-gray-700 dark:text-gray-300 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <AlertOctagon className={`w-4 h-4 ${missionStatus === 'ASSIGNED' ? 'text-red-500 animate-pulse' : 'text-[#00e5ff]'}`} />
              Active Mission: {mockMission.id}
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700/50 pb-3">
                <div>
                  <p className="text-gray-500 text-[10px] tracking-widest mb-1">TARGET DISTANCE</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{mockMission.distance}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-[10px] tracking-widest mb-1">EST. TIME</p>
                  <p className="text-xl font-bold text-[#00e5ff]">{mockMission.eta}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#050B14] rounded p-3 border border-gray-200 dark:border-gray-700/50">
                <div className="flex items-start gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold tracking-wider mb-0.5">GPS COORDINATES</p>
                    <p className="text-sm text-gray-900 dark:text-white">{mockMission.coords}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                  <Navigation className="w-4 h-4 text-[#00e5ff] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-bold tracking-wider mb-0.5">ROUTING INTEL</p>
                    <p className="text-sm text-gray-900 dark:text-white">{mockMission.routeInfo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* VICTIM DETAILS */}
          <div className="bg-white dark:bg-[#0a1526] rounded-xl border border-gray-200 dark:border-[#00e5ff]/20 p-5 shadow-sm dark:shadow-none">
            <h2 className="text-gray-700 dark:text-gray-300 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-[#00e5ff]/10 pb-2">
              <HeartPulse className="w-4 h-4 text-[#00e5ff]" />
              Victim Telemetry
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-[10px] text-gray-500 tracking-wider">NAME</p>
                  <p className="text-sm font-bold">{mockMission.victim.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-red-400" />
                <div>
                  <p className="text-[10px] text-gray-500 tracking-wider">BLOOD</p>
                  <p className="text-sm font-bold text-red-400">{mockMission.victim.bloodGroup}</p>
                </div>
              </div>
              <div className="col-span-2 bg-slate-50 dark:bg-[#050B14] p-3 rounded border border-gray-200 dark:border-gray-800">
                <p className="text-[10px] text-gray-500 tracking-wider mb-1">ALLERGIES</p>
                <p className="text-sm text-gray-900 dark:text-white">{mockMission.victim.allergies}</p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTON (Sticky Bottom on Mobile) */}
          <div className="mt-auto pt-6 pb-4 sticky bottom-0 bg-gray-100 dark:bg-[#050B14]">
            <button 
              onClick={handleAction}
              disabled={actionConfig.disabled}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold tracking-widest text-sm uppercase transition-all duration-300 ${actionConfig.color}`}
            >
              {actionConfig.icon}
              {actionConfig.text}
            </button>
          </div>
          
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <Power className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-gray-500 tracking-widest text-center">
            SYSTEM STANDBY
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-mono text-center max-w-xs">
            Toggle duty status to online to start receiving emergency telemetry dispatches.
          </p>
        </div>
      )}
    </div>
  );
};

export default AmbulanceDashboard;
