import React, { useState, useEffect } from 'react';
import { Activity, MapPin, Ambulance, AlertTriangle, Clock, ShieldAlert, Radio, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;

const accidentIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063224.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const ambulanceIcon = L.icon({
  iconUrl: 'https://purepng.com/public/uploads/large/purepng.com-ambulanceambulancevehiclesmedical-9615246701768coyd.png',
  iconSize: [60, 40],
  iconAnchor: [30, 20],
  popupAnchor: [0, -20]
});

const crashIcon = L.divIcon({
  className: 'custom-crash-icon',
  html: `<div style="background-color: #ef4444; width: 35px; height: 35px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #ef4444; border: 2px solid white;">
          <div style="transform: rotate(45deg); color: white; font-weight: bold; font-family: sans-serif; font-size: 18px;">!</div>
         </div>`,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.flyTo(center, 14, { animate: true });
    }
  }, [center, map]);
  return null;
}

const HospitalDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [activeAmbulance, setActiveAmbulance] = useState(null);
  const [sosAlerts, setSosAlerts] = useState([]);
  const [dispatchToast, setDispatchToast] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const animationRef = React.useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket Connection for Live Telemetry
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('emergency-sos', (alertData) => {
      setSosAlerts(prev => [alertData, ...prev]);
      setDispatchToast('🚨 AMBULANCE AMB-101 DISPATCHED TO CRASH SITE');
      
      // Auto hide dispatch toast
      setTimeout(() => setDispatchToast(null), 6000);

      if (alertData.route && alertData.route.length > 0) {
        setActiveRoute(alertData.route);
        
        if (animationRef.current) clearInterval(animationRef.current);
        
        let step = 0;
        const totalSteps = alertData.route.length;
        const totalDurationMs = 6000; // 6 seconds for realistic fast arrival effect
        const intervalMs = Math.max(50, totalDurationMs / totalSteps);
        
        animationRef.current = setInterval(() => {
          if (step < totalSteps) {
            setActiveAmbulance(alertData.route[step]);
            step++;
          } else {
            clearInterval(animationRef.current);
          }
        }, intervalMs);
      }
    });

    return () => {
      socket.disconnect();
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(error.message || 'Failed to acquire GPS signal.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by your browser.');
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const fleet = [
    { id: 'AMB-101', status: 'En Route', eta: '4 Mins', location: 'Heading to SOS-001' },
    { id: 'AMB-102', status: 'At Scene', eta: '-', location: 'Sector 9' },
    { id: 'AMB-103', status: 'Standby', eta: '-', location: 'Hospital Base' },
  ];

  const dynamicFleet = fleet.map(amb => {
    if (amb.id === 'AMB-101' && activeAmbulance) {
      return {
        ...amb,
        location: `${activeAmbulance[0].toFixed(4)}, ${activeAmbulance[1].toFixed(4)} (Live)`
      };
    }
    return amb;
  });

  if (!currentLocation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-cyan-400 font-mono bg-slate-50 dark:bg-[#050B14] p-4">
        {locationError ? (
          <div className="text-center space-y-4">
            <div className="text-red-500 font-bold flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <span>GPS Error: {locationError}</span>
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Ensure you have granted location permissions in your browser. You can retry or proceed with the default command center location.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400/10 transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={() => setCurrentLocation([28.3670, 77.3159])}
                className="px-4 py-2 bg-cyan-400 text-[#050B14] font-bold rounded hover:bg-cyan-300 transition-colors"
              >
                Proceed with Default
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Activity className="w-12 h-12 animate-pulse" />
            <div className="text-lg tracking-widest animate-pulse">Acquiring Secure GPS Signal...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050B14] text-slate-900 dark:text-white p-4 md:p-6 font-mono transition-colors duration-300">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200 dark:border-[#00e5ff]/30 pb-4 mb-6 gap-4 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-600 dark:text-[#00e5ff] animate-pulse w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest text-blue-600 dark:text-[#00e5ff] dark:drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
            HOSPITAL COMMAND CENTER
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right border-r border-slate-200 dark:border-[#00e5ff]/30 pr-4">
            <div className="text-xs text-slate-500 dark:text-[#00e5ff] tracking-widest uppercase">System Time</div>
            <div className="text-sm font-bold text-slate-800 dark:text-white">{currentTime.toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      {/* DISPATCH NOTIFICATION */}
      {dispatchToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] font-bold text-lg border border-red-400">
          {dispatchToast}
        </div>
      )}

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 relative z-20">
        
        {/* LEFT PANEL: ALERTS */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0a1526] border border-slate-200 dark:border-[#00e5ff]/20 rounded-lg p-4 flex flex-col h-full shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-[#00e5ff]/10 pb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold tracking-widest text-slate-500 dark:text-gray-300 uppercase">Incoming SOS Alerts</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {sosAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-xs font-bold tracking-widest text-green-600 uppercase">System Normal</span>
                <span className="text-[10px] text-slate-500 mt-1">NO ACTIVE ALERTS</span>
              </div>
            ) : (
              sosAlerts.map(alert => (
                <div key={alert.id} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/30 rounded p-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-red-600 dark:text-red-400 font-bold text-xs tracking-wider">{alert.id}</span>
                    <span className="text-slate-500 dark:text-gray-400 text-xs">{alert.time}</span>
                  </div>
                  <p className="text-slate-900 dark:text-white text-sm font-bold mb-1">{alert.type}</p>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-slate-500 dark:text-gray-400 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {alert.location}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold tracking-wider ${
                      alert.severity === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/50'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER PANEL: MAP */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0a1526] border border-slate-200 dark:border-[#00e5ff]/30 rounded-lg flex flex-col h-full relative overflow-hidden group shadow-sm dark:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-colors duration-300">
          <MapContainer 
            center={currentLocation} 
            zoom={12} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
          >
            {/* Dynamic Map Tiles based on global theme */}
            <TileLayer
              key={isDarkMode ? 'dark' : 'light'}
              url={isDarkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              }
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            <MapUpdater center={currentLocation} />

            <Marker position={currentLocation} icon={hospitalIcon}>
              <Popup className="font-mono">
                <strong>Hospital Command Base</strong>
              </Popup>
            </Marker>

            {activeRoute && (
              <Polyline 
                positions={activeRoute} 
                pathOptions={{ color: '#00e5ff', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
              />
            )}

            {activeAmbulance && (
              <Marker position={activeAmbulance} icon={ambulanceIcon}>
                <Popup className="font-mono text-blue-500 font-bold">AMB-101 (En Route)</Popup>
              </Marker>
            )}

            {sosAlerts.map(alert => (
              <Marker 
                key={alert.id}
                position={alert.coords} 
                icon={crashIcon}
              >
                <Popup className="font-mono text-red-500 font-bold">{alert.id}: {alert.type}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* RIGHT PANEL: FLEET */}
        <div className="lg:col-span-1 bg-white dark:bg-[#0a1526] border border-slate-200 dark:border-[#00e5ff]/20 rounded-lg p-4 flex flex-col h-full shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-[#00e5ff]/10 pb-2">
            <Ambulance className="w-5 h-5 text-blue-600 dark:text-[#00e5ff]" />
            <h2 className="text-sm font-bold tracking-widest text-slate-500 dark:text-gray-300 uppercase">Ambulance Fleet</h2>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {dynamicFleet.map(amb => (
              <div key={amb.id} className="bg-slate-50 dark:bg-[#050B14] border border-slate-200 dark:border-[#00e5ff]/20 rounded p-3 hover:border-blue-400 dark:hover:border-[#00e5ff]/50 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-600 dark:text-[#00e5ff] font-bold text-sm tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3" /> {amb.id}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    amb.status === 'En Route' ? 'bg-blue-100 dark:bg-[#00e5ff]/20 text-blue-700 dark:text-[#00e5ff] border border-blue-200 dark:border-[#00e5ff]/50 animate-pulse' :
                    amb.status === 'At Scene' ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/50' :
                    'bg-slate-200 dark:bg-gray-800 text-slate-600 dark:text-gray-400 border border-slate-300 dark:border-gray-600'
                  }`}>
                    {amb.status}
                  </span>
                </div>
                <div className="text-slate-500 dark:text-gray-400 text-xs space-y-1">
                  <p className="flex justify-between"><span>ETA:</span> <span className="text-slate-900 dark:text-white font-bold">{amb.eta}</span></p>
                  <p className="flex justify-between"><span>LOC:</span> <span className="truncate ml-2">{amb.location}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 229, 255, 0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 229, 255, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 229, 255, 0.5); }
      `}</style>
    </div>
  );
};

export default HospitalDashboard;
