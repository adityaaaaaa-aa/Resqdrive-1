import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const ambulanceIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/815/815858.png', // Pulsing blue dot alternative or custom ambulance
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  className: 'ambulance-marker-pulse' // We can add CSS for pulsing effect
});

const accidentIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle smooth panning
const MapController = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), {
        animate: true,
        duration: 1.5 // Smooth transition duration
      });
    }
  }, [position, map]);
  return null;
};

// Component to handle smooth marker movement
const SmoothMarker = ({ position, icon, popupText }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <Marker 
      position={position} 
      icon={icon} 
      ref={markerRef}
    >
      {popupText && <Popup>{popupText}</Popup>}
    </Marker>
  );
};

const LiveTrackingMap = ({ accidentLocation = [28.6139, 77.2090] }) => {
  const [ambLocation, setAmbLocation] = useState([28.6139, 77.2090]); // Default start
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    // Connect to backend Socket.IO
    const socket = io('http://localhost:5000', {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to Live Tracking Server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for real-time location updates
    socket.on('locationUpdate', (data) => {
      if (data && data.lat && data.lng) {
        setAmbLocation([data.lat, data.lng]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-[#00e5ff]/30 shadow-[0_0_20px_rgba(0,229,255,0.15)] bg-[#050B14]">
      {/* Overlay UI */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#0a1526]/90 backdrop-blur-md border border-[#00e5ff]/50 rounded-lg p-3 text-white font-mono shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#00e5ff] animate-pulse shadow-[0_0_8px_#00e5ff]' : 'bg-red-500'}`}></div>
          <span className="font-bold tracking-widest text-sm">
            STATUS: {isConnected ? 'LIVE TRACKING' : 'OFFLINE'}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          <span className="text-[#00e5ff]">LAT:</span> {ambLocation[0].toFixed(5)} <br/>
          <span className="text-[#00e5ff]">LNG:</span> {ambLocation[1].toFixed(5)}
        </div>
      </div>

      <MapContainer 
        center={ambLocation} 
        zoom={15} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Auto-Pan Controller */}
        <MapController position={ambLocation} />

        {/* Accident Location Pin */}
        <Marker position={accidentLocation} icon={accidentIcon}>
          <Popup className="font-mono font-bold text-red-500">Accident Site</Popup>
        </Marker>

        {/* Smooth Moving Ambulance Marker */}
        <SmoothMarker position={ambLocation} icon={ambulanceIcon} popupText="Ambulance En Route" />
      </MapContainer>

      {/* Global styles for pulsing marker if needed */}
      <style>{`
        .ambulance-marker-pulse {
          transition: margin 1.5s ease-in-out;
          filter: drop-shadow(0 0 10px rgba(0, 229, 255, 0.8));
        }
        .leaflet-popup-content-wrapper {
          background-color: #0a1526;
          color: #00e5ff;
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background-color: #0a1526;
        }
      `}</style>
    </div>
  );
};

export default LiveTrackingMap;
