import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { Shield, Activity, MapPin, Ambulance, Navigation2, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const hospitalIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #00e5ff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px #00e5ff; border: 2px solid white;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050B14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const ambulanceIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #ff1a1a; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px #ff1a1a; border: 2px solid white; animation: pulse-red 1.5s infinite;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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

// Smooth Marker Component
const SmoothMarker = ({ position, icon, popupText }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <Marker position={position} icon={icon} ref={markerRef}>
      {popupText && <Popup className="font-mono">{popupText}</Popup>}
    </Marker>
  );
};

const HospitalMapDashboard = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [deviceId, setDeviceId] = useState('AWAITING_DATA');
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // 1. Auto-Geolocation on Component Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  // 2. Live Socket Connection for Ambulance Tracking
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to ResQDrive Dispatch Server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('locationUpdate', (data) => {
      if (data && data.lat && data.lng) {
        setAmbulanceLocation([data.lat, data.lng]);
        setDeviceId(data.deviceId || 'AMB-UNKNOWN');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Calculate distance if both locations exist
  const getDistance = () => {
    if (!currentLocation || !ambulanceLocation) return '0.00';
    const point1 = L.latLng(currentLocation);
    const point2 = L.latLng(ambulanceLocation);
    // Returns distance in meters, convert to KM
    return (point1.distanceTo(point2) / 1000).toFixed(2);
  };

  if (!currentLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-400">
        Acquiring Secure GPS Signal...
      </div>
    );
  }

  // Theme-based classes
  const themeClasses = {
    mainBg: isDarkMode ? 'bg-[#050B14]' : 'bg-slate-50',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textMuted: isDarkMode ? 'text-gray-500' : 'text-slate-500',
    sidebarBg: isDarkMode ? 'bg-[#0a1526]' : 'bg-white',
    borderColor: isDarkMode ? 'border-[#00e5ff]/20' : 'border-slate-200',
    accentColor: isDarkMode ? 'text-[#00e5ff]' : 'text-blue-600',
    cardBg: isDarkMode ? 'bg-[#050B14]' : 'bg-slate-50',
    cardBorder: isDarkMode ? 'border-gray-800' : 'border-slate-200',
    activeCardBg: isDarkMode ? 'bg-red-950/20' : 'bg-red-50',
    activeCardBorder: isDarkMode ? 'border-red-500/30' : 'border-red-200',
    overlayBg: isDarkMode ? 'bg-[#0a1526]/80' : 'bg-white/90',
  };

  return (
    <div className={`min-h-screen ${themeClasses.mainBg} ${themeClasses.textMain} font-mono flex flex-col md:flex-row overflow-hidden transition-colors duration-300`}>
      
      {/* LEFT: MAP CONTAINER (75%) */}
      <div className="w-full md:w-3/4 h-[50vh] md:h-screen relative z-0">
        
        {/* Connection Overlay */}
        <div className={`absolute top-6 left-6 z-[1000] ${themeClasses.overlayBg} backdrop-blur-md border ${isDarkMode ? 'border-[#00e5ff]/30 text-white' : 'border-slate-200 text-slate-800'} p-3 rounded-lg flex items-center gap-3 shadow-lg`}>
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
          <span className="font-bold tracking-widest text-sm uppercase">
            {isConnected ? 'Telemetry Online' : 'Telemetry Offline'}
          </span>
        </div>

        {locationError && (
          <div className="absolute top-20 left-6 z-[1000] bg-red-900/80 backdrop-blur-md border border-red-500/50 text-red-200 p-2 rounded text-xs max-w-xs shadow-lg">
            ⚠ {locationError}
          </div>
        )}

        <MapContainer 
          center={currentLocation} 
          zoom={14} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          {/* Dynamic Theme Tiles */}
          <TileLayer
            key={isDarkMode ? 'dark' : 'light'}
            url={isDarkMode 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          <MapUpdater center={currentLocation} />

          {/* Static Hospital Marker */}
          <Marker position={currentLocation} icon={hospitalIcon}>
            <Popup className="font-mono">
              <strong>Hospital Command Base</strong>
            </Popup>
          </Marker>

          {/* Dynamic Ambulance Marker */}
          {ambulanceLocation && (
            <SmoothMarker 
              position={ambulanceLocation} 
              icon={ambulanceIcon} 
              popupText={`Ambulance: ${deviceId}`} 
            />
          )}

          {/* Dashed Routing Line */}
          {ambulanceLocation && (
            <Polyline 
              positions={[currentLocation, ambulanceLocation]} 
              color="#ff1a1a" 
              weight={3} 
              dashArray="10, 10" 
              className="animate-dash"
            />
          )}
        </MapContainer>
      </div>

      {/* RIGHT: SIDEBAR (25%) */}
      <div className={`w-full md:w-1/4 h-[50vh] md:h-screen ${themeClasses.sidebarBg} border-l ${themeClasses.borderColor} p-6 flex flex-col overflow-y-auto transition-colors duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-10`}>
        
        {/* Header with Theme Toggle */}
        <div className={`flex items-center justify-between mb-8 border-b ${themeClasses.borderColor} pb-4`}>
          <div className="flex items-center gap-3">
            <Shield className={`w-8 h-8 ${themeClasses.accentColor}`} />
            <h1 className={`text-xl font-bold tracking-widest ${themeClasses.accentColor} uppercase`}>Dispatch Ops</h1>
          </div>
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full border ${themeClasses.borderColor} hover:bg-gray-500/10 transition-colors`}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        <div className="space-y-8 flex-1">
          {/* Section: Hospital Status */}
          <div className={`${theme.cardBg} border ${theme.borderColor} p-4 rounded-xl transition-colors duration-300`}>
            <h2 className={`text-xs ${theme.textMuted} tracking-widest mb-3 flex items-center gap-2`}>
              <MapPin className={`w-4 h-4 ${theme.accentColor}`} /> BASE COMMAND
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className={theme.textMuted}>LAT</span>
                <span className={`font-bold ${theme.textMain}`}>{currentLocation[0].toFixed(6)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className={theme.textMuted}>LNG</span>
                <span className={`font-bold ${theme.textMain}`}>{currentLocation[1].toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* Section: Active Fleet */}
          <div className={`border p-4 rounded-xl transition-colors duration-500 ${ambulanceLocation ? `${theme.activeCardBg} ${theme.activeCardBorder}` : `${theme.cardBg} ${theme.cardBorder}`}`}>
            <h2 className={`text-xs ${theme.textMuted} tracking-widest mb-3 flex items-center gap-2`}>
              <Ambulance className={`w-4 h-4 ${ambulanceLocation ? 'text-red-500' : (isDarkMode ? 'text-gray-600' : 'text-slate-400')}`} /> 
              ACTIVE UNIT
            </h2>
            
            {ambulanceLocation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1.5 rounded text-xs font-bold tracking-wider border border-red-500/20 w-fit mb-4">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  EN ROUTE
                </div>

                <div className="space-y-2">
                  <div className={`flex justify-between items-center text-sm border-b ${isDarkMode ? 'border-gray-800' : 'border-slate-200'} pb-2`}>
                    <span className={theme.textMuted}>UNIT ID</span>
                    <span className="font-bold text-red-500">{deviceId}</span>
                  </div>
                  <div className={`flex justify-between items-center text-sm border-b ${isDarkMode ? 'border-gray-800' : 'border-slate-200'} pb-2`}>
                    <span className={theme.textMuted}>DISTANCE</span>
                    <span className={`font-bold ${theme.textMain}`}>{getDistance()} KM</span>
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className={`flex justify-between items-center text-[10px] ${theme.textMuted}`}>
                      <span>LIVE LAT</span>
                      <span>{ambulanceLocation[0].toFixed(6)}</span>
                    </div>
                    <div className={`flex justify-between items-center text-[10px] ${theme.textMuted}`}>
                      <span>LIVE LNG</span>
                      <span>{ambulanceLocation[1].toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className={`w-8 h-8 ${isDarkMode ? 'text-gray-700' : 'text-slate-300'} mx-auto mb-2`} />
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-400'} uppercase tracking-widest`}>No active dispatches</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-gray-600' : 'text-slate-300'} mt-1`}>Awaiting SOS Trigger</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer/System Info */}
        <div className={`mt-8 border-t ${theme.borderColor} pt-4 flex items-center justify-between text-[10px] ${theme.textMuted} tracking-widest`}>
          <span className="flex items-center gap-1"><Navigation2 className="w-3 h-3" /> ResQDrive Core</span>
          <span>v2.4.1</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(255, 26, 26, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(255, 26, 26, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 26, 26, 0); }
        }
        .animate-dash {
          stroke-dasharray: 10;
          animation: dash 20s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>
    </div>
  );
};

export default HospitalMapDashboard;
