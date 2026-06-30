import React, { useState, useEffect } from 'react';
import { Activity, Map as MapIcon, ShieldAlert, Terminal, CheckCircle2, XCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.flyTo(center, 12, { animate: true });
    }
  }, [center, map]);
  return null;
}

// System Health mock component
const SystemHealthPanel = () => {
  return (
    <div className="bg-white/80 dark:bg-[#0a0a0a]/80 border border-red-200 dark:border-red-900/50 p-6 rounded shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.1)] flex flex-col h-full transition-colors duration-300">
      <h2 className="text-red-600 dark:text-red-500 font-bold tracking-widest uppercase mb-6 flex items-center gap-2 border-b border-red-200 dark:border-red-900/30 pb-2 text-sm transition-colors">
        <Activity className="w-4 h-4" /> System Health
      </h2>
      <div className="space-y-6 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-xs tracking-wider transition-colors">MongoDB Cluster</span>
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xs font-bold">ONLINE</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-xs tracking-wider transition-colors">Socket Server</span>
          <div className="flex items-center gap-2">
            <span className="text-green-500 text-xs font-bold">ONLINE (14ms)</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 text-xs tracking-wider transition-colors">ESP32 IoT Nodes</span>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500 text-xs font-bold">DEGRADED (2/50 offline)</span>
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Global Map Component
const GlobalMapPanel = ({ currentLocation, activeAmbulance, isDarkMode }) => {
  return (
    <div className="bg-white/80 dark:bg-[#0a0a0a]/80 border border-red-200 dark:border-red-900/50 p-6 rounded shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.1)] flex flex-col h-full relative z-0 transition-colors duration-300">
      <h2 className="text-red-600 dark:text-red-500 font-bold tracking-widest uppercase mb-4 flex items-center gap-2 border-b border-red-200 dark:border-red-900/30 pb-2 text-sm transition-colors">
        <MapIcon className="w-4 h-4" /> Global Asset Map
      </h2>
      <div className="flex-1 rounded overflow-hidden border border-red-200 dark:border-red-900/30 relative transition-colors">
        <MapContainer 
            center={currentLocation || [28.3670, 77.3159]} 
            zoom={12} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              key={isDarkMode ? 'dark' : 'light'}
              url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {currentLocation && <MapUpdater center={currentLocation} />}
            
            {currentLocation && (
              <Marker position={currentLocation}>
                <Popup className="font-mono font-bold text-red-500">HQ BASE</Popup>
              </Marker>
            )}

            {activeAmbulance && (
              <Marker position={activeAmbulance}>
                <Popup className="font-mono font-bold text-red-500">AMB-101 (Live)</Popup>
              </Marker>
            )}
            
            {/* Standby Marker slightly offset for visual flavor */}
            {currentLocation && (
              <Marker position={[currentLocation[0] - 0.05, currentLocation[1] + 0.04]}>
                <Popup className="font-mono font-bold text-red-500">AMB-102 (Standby)</Popup>
              </Marker>
            )}
          </MapContainer>
      </div>
    </div>
  );
};

// Controls Panel
const ControlsPanel = ({ onSimulateCrash }) => {
  return (
    <div className="bg-white/80 dark:bg-[#0a0a0a]/80 border border-red-200 dark:border-red-900/50 p-6 rounded shadow-sm dark:shadow-[0_0_15px_rgba(220,38,38,0.1)] flex flex-col h-full transition-colors duration-300">
      <h2 className="text-red-600 dark:text-red-500 font-bold tracking-widest uppercase mb-6 flex items-center gap-2 border-b border-red-200 dark:border-red-900/30 pb-2 text-sm transition-colors">
        <Terminal className="w-4 h-4" /> Override Controls
      </h2>
      <div className="space-y-4 flex-1">
        <button className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-300 py-3 px-4 text-xs tracking-widest font-bold uppercase transition-colors text-left flex justify-between items-center group">
          <span>Force Ambulance Reroute</span>
          <ShieldAlert className="w-4 h-4 opacity-50 group-hover:opacity-100" />
        </button>
        <button onClick={onSimulateCrash} className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-300 py-3 px-4 text-xs tracking-widest font-bold uppercase transition-colors text-left flex justify-between items-center group">
          <span>Simulate Node Crash</span>
          <XCircle className="w-4 h-4 opacity-50 group-hover:opacity-100" />
        </button>
        <button className="w-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-300 py-3 px-4 text-xs tracking-widest font-bold uppercase transition-colors text-left flex justify-between items-center group">
          <span>Clear All SOS Alerts</span>
          <CheckCircle2 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [time, setTime] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeAmbulance, setActiveAmbulance] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const socketRef = React.useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket Connection for Live Telemetry
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('telemetry-update', (data) => {
      if (data && data.lat && data.lng) {
        setActiveAmbulance([data.lat, data.lng]);
      }
    });
    return () => socketRef.current.disconnect();
  }, []);

  const handleSimulateCrash = () => {
    if (socketRef.current && currentLocation) {
      // Simulate crash slightly offset from current location
      const simulatedCoords = [currentLocation[0] + 0.002, currentLocation[1] - 0.002];
      socketRef.current.emit('simulate-crash', { coords: simulatedCoords, baseCoords: currentLocation });
      alert('SIMULATED CRASH SIGNAL SENT');
    } else {
      alert('Wait for GPS lock before simulating crash.');
    }
  };

  // Geolocation
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
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  if (!currentLocation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center text-red-600 dark:text-red-500 font-mono p-4 transition-colors duration-300">
        {locationError ? (
          <div className="text-center space-y-4 max-w-md">
            <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto animate-[pulse_1s_ease-in-out_infinite] transition-colors" />
            <h2 className="text-xl font-bold tracking-widest transition-colors">CRITICAL GPS FAILURE</h2>
            <p className="text-red-800 dark:text-red-700 text-sm transition-colors">ACCESS LEVEL OMEGA requires precise location targeting. Please allow location access.</p>
            <button 
              onClick={() => setCurrentLocation([28.3670, 77.3159])}
              className="mt-6 px-6 py-2 border border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors uppercase tracking-widest text-xs"
            >
              FORCE OVERRIDE (DEFAULT COORDS)
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Activity className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto animate-pulse transition-colors" />
            <div className="text-lg tracking-[0.2em] animate-pulse transition-colors">ACQUIRING OMEGA-LEVEL GPS LOCK...</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-red-800 dark:text-red-500 font-mono p-4 md:p-8 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-gray-200/50 to-gray-300 dark:via-[#050505]/80 dark:to-[#000000] pointer-events-none z-10 transition-colors duration-300" />
      
      <header className="mb-8 relative z-20 flex justify-between items-center border-b border-red-300 dark:border-red-900/50 pb-4 transition-colors">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.2em] uppercase text-red-700 dark:text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] transition-colors">SUPERADMIN OVERRIDE</h1>
          <p className="text-xs text-red-600 dark:text-red-700 mt-1 tracking-widest transition-colors">ACCESS LEVEL: OMEGA</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-red-600 dark:text-red-700 tracking-widest uppercase transition-colors">System Time</div>
            <div className="text-sm font-bold text-red-800 dark:text-red-500 transition-colors">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
          <ThemeToggleButton />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 relative z-20">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <SystemHealthPanel />
          <ControlsPanel onSimulateCrash={handleSimulateCrash} />
        </div>
        <div className="lg:col-span-3">
          <GlobalMapPanel currentLocation={currentLocation} activeAmbulance={activeAmbulance} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
