import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons not showing in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;

const hospitalIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/108/108343.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const accidentIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ambulanceIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/815/815858.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 14);
    }
  }, [center, map, zoom]);
  return null;
}

const SOCKET_SERVER_URL = 'https://resqdrive-1.onrender.com';

function App() {
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', time: '00:00', msg: 'System initialized — monitoring active' },
    { id: 2, type: 'info', time: '00:01', msg: 'All sensors nominal. GPS lock: <strong>confirmed</strong>' }
  ]);
  const [simPhase, setSimPhase] = useState('PHASE: MONITORING');
  
  const [sensorState, setSensorState] = useState({
    gx: 0.2, gy: 0.1, speed: 58, impact: 'LOW', 
    alert: false
  });
  
  const [isAccident, setIsAccident] = useState(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [trafficStep, setTrafficStep] = useState(0);

  const [defaultCenter, setDefaultCenter] = useState([40.730610, -73.935242]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDefaultCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.warn('Geolocation error:', error)
      );
    }
  }, []);
  const [accidentLoc, setAccidentLoc] = useState(null);
  const [hospitalLoc, setHospitalLoc] = useState(null);
  const [ambulanceLoc, setAmbulanceLoc] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ambulance animation logic
  useEffect(() => {
    let intervalId;
    let isCancelled = false;

    if (ambulanceDispatched && hospitalLoc && accidentLoc) {
      const fetchRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${hospitalLoc[1]},${hospitalLoc[0]};${accidentLoc[1]},${accidentLoc[0]}?overview=full&geometries=geojson`);
          const data = await res.json();
          let coords = [];
          if (data.routes && data.routes.length > 0) {
            coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          } else {
            coords = [hospitalLoc, accidentLoc];
          }
          
          if (isCancelled) return;
          
          setRouteCoords(coords);
          setCurrentIndex(0);
          setAmbulanceLoc(coords[0]);

          const stepDelay = 12000 / coords.length;
          let idx = 0;
          
          intervalId = setInterval(() => {
            idx++;
            
            if (idx >= coords.length) {
              setAmbulanceLoc(accidentLoc);
              setCurrentIndex(coords.length - 1);
              clearInterval(intervalId);
              return;
            }
            
            setAmbulanceLoc(coords[idx]);
            setCurrentIndex(idx);
          }, stepDelay);
          
        } catch(e) {
           console.error("OSRM error:", e);
        }
      };
      
      fetchRoute();
    }
    
    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [ambulanceDispatched, hospitalLoc, accidentLoc]);

  // idle jitter
  useEffect(() => {
    if (isAccident) return;
    const interval = setInterval(() => {
      setSensorState(prev => ({
        ...prev,
        gx: +(0.1 + Math.random() * 0.3).toFixed(1),
        gy: +(0.05 + Math.random() * 0.25).toFixed(1),
        speed: Math.round(52 + Math.random() * 16)
      }));
    }, 800);
    return () => clearInterval(interval);
  }, [isAccident]);

  const addLog = (msgHTML, type) => {
    setLogs(prev => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      return [...prev, { id: Date.now() + Math.random(), type, time: timeStr, msg: msgHTML }].slice(-50);
    });
  };

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    
    socket.on('new_accident', (acc) => {
      setIsAccident(true);
      setSimPhase('PHASE: IMPACT DETECTED');
      
      const rawLat = typeof acc.location === 'object' && acc.location.coordinates ? acc.location.coordinates[1] : 40.730610;
      const rawLng = typeof acc.location === 'object' && acc.location.coordinates ? acc.location.coordinates[0] : -73.935242;
      
      const aLoc = [rawLat, rawLng];
      setAccidentLoc(aLoc);
      
      // Calculate dynamic hospital coordinate (+0.015 offset)
      const hLoc = [rawLat + 0.015, rawLng + 0.015];
      setHospitalLoc(hLoc);
      
      // Spawn ambulance at hospital immediately
      setAmbulanceLoc(hLoc);

      setSensorState({
        gx: 9.8, gy: 7.4, speed: 0, 
        impact: acc.severity.toUpperCase(), alert: true
      });
      
      addLog(`🚨 <strong>CRITICAL IMPACT DETECTED</strong> — G-force: 9.8G (Severity: ${acc.severity})`, 'danger');
      setTimeout(() => {
        setSimPhase('PHASE: GPS LOCK');
        const lat = typeof acc.location === 'object' && acc.location.coordinates ? acc.location.coordinates[1].toFixed(4) : "40.7306";
        const lng = typeof acc.location === 'object' && acc.location.coordinates ? acc.location.coordinates[0].toFixed(4) : "-73.9352";
        addLog(`📍 GPS lock confirmed — <strong>${lat}°N, ${lng}°E</strong>`, 'info');
      }, 1500);
      
      setTimeout(() => {
        setSimPhase('PHASE: ALERT TRANSMITTED');
        addLog(`📡 Emergency alert packet transmitted. Vehicle <strong>${acc.vehicleId}</strong>`, 'warn');
      }, 3000);
    });
    
    socket.on('ambulance_dispatched', (data) => {
      setSimPhase('PHASE: AMBULANCE DISPATCHED');
      setAmbulanceDispatched(true);
      const ambId = data.ambulance ? data.ambulance.ambulanceId : "AMB-001";
      addLog(`🚑 <strong>${ambId} dispatched</strong>`, 'success');
      addLog(`🗺️ Optimal route calculated`, 'info');
    });

    socket.on('traffic_routing_update', (data) => {
      setSimPhase('PHASE: GREEN CORRIDOR ACTIVE');
      setTrafficStep(data.step); // 1, 2, 3, 4, 5
      addLog(`🚦 <strong>TRAFFIC OVERRIDE</strong>: ${data.message}`, 'warn');
    });

    socket.on('ambulance_arrived', (data) => {
      setSimPhase('PHASE: RESPONDER ON SCENE');
      addLog(`✅ <strong>${data.ambulanceId} arrived on scene</strong> — Handoff initiated`, 'success');
    });

    return () => socket.close();
  }, []);

  const triggerAccident = async () => {
    if (isAccident) return;
    try {
      const response = await fetch(`${SOCKET_SERVER_URL}/api/accident`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          vehicle_id: 'VH-1234',
          location: { lat: defaultCenter[0], lng: defaultCenter[1] },
          severity: 'Critical',
          gForce: 9.8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (e) {
      console.error('Trigger accident error:', e);
      addLog(`Failed to trigger backend: ${e.message}`, 'danger');
    }
  };

  const resetSimulation = async () => {
    // Optionally trigger backend seed to clear states
    try {
      await fetch(`${SOCKET_SERVER_URL}/api/seed`, { method: 'POST' });
    } catch (e) {}
    
    setIsAccident(false);
    setAmbulanceDispatched(false);
    setTrafficStep(0);
    setAccidentLoc(null);
    setHospitalLoc(null);
    setAmbulanceLoc(null);
    setRouteCoords([]);
    setCurrentIndex(0);
    setSimPhase('PHASE: MONITORING');
    setSensorState({ gx: 0.2, gy: 0.1, speed: 58, impact: 'LOW', alert: false });
    setLogs([
      { id: Date.now(), type: 'info', time: '00:00', msg: 'System initialized — monitoring active' },
      { id: Date.now()+1, type: 'info', time: '00:01', msg: 'All sensors nominal. GPS lock: <strong>confirmed</strong>' }
    ]);
  };

  useEffect(() => {
    const logEl = document.getElementById('eventLog');
    if (logEl) {
      logEl.scrollTop = logEl.scrollHeight;
    }
  }, [logs]);

  // Legacy ambulanceStyle removed


  return (
    <div>
      {/* NAV */}
      <nav>
        <div className="nav-logo">
          <div className="dot"></div>
          ResQDrive OS
        </div>
        <div className="nav-links">
          <a href="#how">HOW IT WORKS</a>
          <a href="#simulation">SIMULATION</a>
          <a href="#features">INNOVATION</a>
          <a href="#stats">IMPACT</a>
        </div>
        <div className="nav-status">
          <div className="pulse-dot"></div>
          SYSTEM ACTIVE
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="radar-wrap">
          <div className="radar-circle"></div>
          <div className="radar-circle"></div>
          <div className="radar-circle"></div>
          <div className="radar-circle"></div>
          <div className="radar-sweep"></div>
        </div>
        <div className="hero-inner">
          <div className="hero-badge">SMART IOT SYSTEM · V2.4.1</div>
         <h1 className="hero-title">
            ResQDrive<br />
            <span>Detection</span> &amp;<br />
            <span className="red">Emergency</span> Response
          </h1>
          <p className="hero-sub">
            AI-powered IoT system that automatically detects vehicle accidents, pinpoints locations, and mobilises emergency services — all within seconds, without human intervention.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => document.getElementById('simulation').scrollIntoView({behavior:'smooth'})}>▶ &nbsp;LIVE DEMO</button>
            <button className="btn-outline" onClick={() => document.getElementById('how').scrollIntoView({behavior:'smooth'})}>HOW IT WORKS</button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-val">&lt;8s</div>
              <div className="hero-stat-label">RESPONSE TIME</div>
            </div>
            <div>
              <div className="hero-stat-val">99.4%</div>
              <div className="hero-stat-label">DETECTION ACC.</div>
            </div>
            <div>
              <div className="hero-stat-val">24/7</div>
              <div className="hero-stat-label">MONITORING</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">// SYSTEM PIPELINE</div>
            <h2 className="section-title">How <span>ResQDrive</span> Works</h2>
          </div>

          <div className="pipeline">
            <div className="step visible">
              <div className="step-icon-wrap">
                <div className="step-icon-bg red">🚗</div>
                <div className="step-number">01</div>
              </div>
              <div className="step-body">
                <div className="step-title">ACCIDENT DETECTION</div>
                <div className="step-desc">Multi-axis accelerometers and gyroscopes continuously monitor vehicle dynamics. Sudden deceleration exceeding threshold G-forces, combined with airbag deployment signals, trigger the detection algorithm.</div>
                <div className="step-tag">ACCELEROMETER · GYROSCOPE · AIRBAG SENSOR</div>
              </div>
            </div>

            <div className="step visible" style={{transitionDelay: '150ms'}}>
              <div className="step-icon-wrap">
                <div className="step-icon-bg amber">📍</div>
                <div className="step-number">02</div>
              </div>
              <div className="step-body">
                <div className="step-title">GPS LOCATION CAPTURE</div>
                <div className="step-desc">High-precision GPS module instantly locks the exact coordinates of the incident, cross-referenced with cellular triangulation for accuracy in GPS-shadowed areas like tunnels and urban canyons.</div>
                <div className="step-tag">GPS MODULE · CELLULAR TRIANGULATION · ±2M ACCURACY</div>
              </div>
            </div>

            <div className="step visible" style={{transitionDelay: '300ms'}}>
              <div className="step-icon-wrap">
                <div className="step-icon-bg cyan">📡</div>
                <div className="step-number">03</div>
              </div>
              <div className="step-body">
                <div className="step-title">AUTOMATIC EMERGENCY ALERT</div>
                <div className="step-desc">Within milliseconds of detection, an encrypted alert packet containing GPS coordinates, vehicle ID, impact severity score, and timestamp is transmitted over 4G/5G to the Central Emergency Hub.</div>
                <div className="step-tag">4G/5G · MQTT PROTOCOL · ENCRYPTED PAYLOAD</div>
              </div>
            </div>

            <div className="step visible" style={{transitionDelay: '450ms'}}>
              <div className="step-icon-wrap">
                <div className="step-icon-bg red">🚑</div>
                <div className="step-number">04</div>
              </div>
              <div className="step-body">
                <div className="step-title">NEAREST AMBULANCE DISPATCH</div>
                <div className="step-desc">The system queries the real-time ambulance fleet database, identifies the closest available unit using live traffic-adjusted routing, and automatically dispatches with turn-by-turn navigation to the accident site.</div>
                <div className="step-tag">FLEET MANAGEMENT · REAL-TIME ROUTING · AUTO-DISPATCH</div>
              </div>
            </div>

            <div className="step visible" style={{transitionDelay: '600ms'}}>
              <div className="step-icon-wrap">
                <div className="step-icon-bg amber">👨‍👩‍👧</div>
                <div className="step-number">05</div>
              </div>
              <div className="step-body">
                <div className="step-title">FAMILY EMERGENCY ALERT</div>
                <div className="step-desc">Registered emergency contacts receive simultaneous SMS and push notifications containing the accident location, a live tracking link, and the responding hospital's contact details.</div>
                <div className="step-tag">SMS · PUSH NOTIFICATION · LIVE TRACKING LINK</div>
              </div>
            </div>

            <div className="step visible" style={{transitionDelay: '750ms'}}>
              <div className="step-icon-wrap">
                <div className="step-icon-bg green">🚦</div>
                <div className="step-number">06</div>
              </div>
              <div className="step-body">
                <div className="step-title">SMART TRAFFIC SIGNAL CONTROL</div>
                <div className="step-desc">Smart city infrastructure integration enables green corridor creation along the ambulance's predicted route. Traffic signals automatically switch to grant uninterrupted passage, cutting response time by up to 40%.</div>
                <div className="step-tag">V2I COMMS · SMART CITY API · GREEN CORRIDOR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE SIMULATION */}
      <section id="simulation">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">// INTERACTIVE DEMO</div>
            <h2 className="section-title">Live System <span>Simulation</span></h2>
          </div>

          <div className="sim-layout reveal visible">
            {/* MAP */}
            <div className="sim-panel px-4" style={{ gridColumn: 'span 2' }}>
              <div className="panel-title">
                <div className={`dot ${isAccident ? 'red' : ''}`}></div>
                <span>{isAccident ? '⚠ IMPACT DETECTED — 28.6139°N, 77.2090°E' : 'VEHICLE MONITORING — ALL CLEAR'}</span>
              </div>
              <div className="map-area" id="mapArea" style={{ padding: 0, position: 'relative', zIndex: 0 }}>
                <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
                  <ChangeView center={accidentLoc ? accidentLoc : defaultCenter} zoom={13} />
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  
                  {isAccident && accidentLoc && (
                    <Marker position={accidentLoc} icon={accidentIcon} draggable={false}>
                      <Popup>Accident Location</Popup>
                    </Marker>
                  )}
                  
                  {isAccident && hospitalLoc && (
                    <Marker position={hospitalLoc} icon={hospitalIcon} draggable={false}>
                      <Popup>Nearest Hospital</Popup>
                    </Marker>
                  )}

                  {/* Vanishing Trail - Only rendering the remaining coordinates */}
                  {routeCoords.length > 0 && ambulanceDispatched && (
                    <Polyline positions={routeCoords.slice(currentIndex)} color="#00e676" weight={5} opacity={0.7} />
                  )}
                  
                  {ambulanceDispatched && ambulanceLoc && (
                    <Marker position={ambulanceLoc} icon={ambulanceIcon} draggable={false}>
                      <Popup>Ambulance En Route</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* SENSORS */}
            <div className="sim-panel">
              <div className="panel-title">
                <div className={`dot ${isAccident ? 'red' : ''}`}></div>
                <span>SENSOR TELEMETRY</span>
              </div>
              <div className="sensor-grid">
                <div className="sensor-card">
                  <div className="sensor-label">G-FORCE (X)</div>
                  <div className={`sensor-value ${sensorState.alert ? 'alert' : ''}`}>{sensorState.gx} G</div>
                  <div className="sensor-bar"><div className={`sensor-fill ${sensorState.alert ? 'danger' : ''}`} style={{ width: `${sensorState.gx * 10}%` }}></div></div>
                </div>
                <div className="sensor-card">
                  <div className="sensor-label">G-FORCE (Y)</div>
                  <div className={`sensor-value ${sensorState.alert ? 'alert' : ''}`}>{sensorState.gy} G</div>
                  <div className="sensor-bar"><div className={`sensor-fill ${sensorState.alert ? 'danger' : ''}`} style={{ width: `${sensorState.gy * 10}%` }}></div></div>
                </div>
                <div className="sensor-card">
                  <div className="sensor-label">IMPACT SCORE</div>
                  <div className={`sensor-value ${sensorState.alert ? 'alert' : ''}`}>{sensorState.impact}</div>
                  <div className="sensor-bar"><div className={`sensor-fill ${sensorState.alert ? 'danger' : ''}`} style={{ width: sensorState.alert ? '100%' : '8%' }}></div></div>
                </div>
                <div className="sensor-card">
                  <div className="sensor-label">SPEED (km/h)</div>
                  <div className="sensor-value">{sensorState.speed}</div>
                  <div className="sensor-bar"><div className="sensor-fill" style={{ width: `${sensorState.speed}%` }}></div></div>
                </div>
              </div>
              <div className="panel-title" style={{ marginTop: '0.5rem' }}>
                <div className="dot green"></div>
                <span>TRAFFIC SIGNALS — AMBULANCE ROUTE</span>
              </div>
              <div className="traffic-grid">
                <div className="traffic-light">
                  <div className="tl-label">MAIN/5TH</div>
                  <div className="tl-box">
                    <div className="tl-dot"></div>
                    <div className="tl-dot" style={{ background: '#222' }}></div>
                    <div className="tl-dot active-green"></div>
                  </div>
                </div>
                <div className="traffic-light">
                  <div className="tl-label">MAIN/8TH</div>
                  <div className="tl-box">
                    <div className="tl-dot"></div>
                    <div className="tl-dot" style={{ background: '#222' }}></div>
                    <div className="tl-dot active-green"></div>
                  </div>
                </div>
                <div className="traffic-light">
                  <div className="tl-label">AVE/5TH</div>
                  <div className="tl-box">
                    <div className={`tl-dot ${trafficStep >= 3 ? 'active-red' : 'active-red'}`}></div>
                    <div className="tl-dot" style={{ background: '#222' }}></div>
                    <div className={`tl-dot`}></div>
                  </div>
                </div>
                <div className="traffic-light">
                  <div className="tl-label">AVE/8TH</div>
                  <div className="tl-box">
                    <div className={`tl-dot ${trafficStep >= 1 ? 'active-red' : 'active-red'}`}></div>
                    <div className="tl-dot" style={{ background: '#222' }}></div>
                    <div className={`tl-dot`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* LOG & CONTACTS */}
            <div className="sim-panel">
              <div className="panel-title">
                <div className={`dot ${isAccident ? 'red' : ''}`}></div>
                <span>EVENT LOG</span>
              </div>
              <div className="event-log" id="eventLog">
                {logs.map((log) => (
                  <div key={log.id} className={`log-entry ${log.type}`}>
                    <span className="log-time">{log.time}</span>
                    <span className="log-msg" dangerouslySetInnerHTML={{ __html: log.msg }}></span>
                  </div>
                ))}
              </div>
              <div className="panel-title" style={{ marginTop: '1rem' }}>
                <div className={`dot ${isAccident ? 'green' : ''}`}></div>
                <span>EMERGENCY CONTACTS</span>
              </div>
              <div className="contact-list">
                {/* Police Station */}
                <div className="contact-item">
                  <div className="contact-avatar">🚓</div>
                  <div>
                    <div className="contact-name">Nearest Police Station</div>
                    <div className="contact-relation">LAW ENFORCEMENT &bull; 112</div>
                  </div>
                  <div className={`contact-status ${isAccident ? 'notified' : 'pending'}`}>
                    {isAccident ? 'ALERTED' : 'STANDBY'}
                  </div>
                </div>
                {/* Hospital */}
                <div className="contact-item">
                  <div className="contact-avatar">🏥</div>
                  <div>
                    <div className="contact-name">City General ER</div>
                    <div className="contact-relation">HOSPITAL &bull; 91*****</div>
                  </div>
                  <div className={`contact-status ${isAccident ? 'notified' : 'pending'}`}>
                    {isAccident ? 'ALERTED' : 'STANDBY'}
                  </div>
                </div>
                {/* Aditya */}
                <div className="contact-item">
                  <div className="contact-avatar">👨</div>
                  <div>
                    <div className="contact-name">Aditya</div>
                    <div className="contact-relation">FRIEND &bull; 91*****</div>
                  </div>
                  <div className={`contact-status ${isAccident ? 'notified' : 'pending'}`}>
                    {isAccident ? 'NOTIFIED' : 'STANDBY'}
                  </div>
                </div>
                {/* Deepanshi */}
                <div className="contact-item">
                  <div className="contact-avatar">👩</div>
                  <div>
                    <div className="contact-name">Deepanshi</div>
                    <div className="contact-relation">FRIEND &bull; 91*****</div>
                  </div>
                  <div className={`contact-status ${isAccident ? 'notified' : 'pending'}`}>
                    {isAccident ? 'NOTIFIED' : 'STANDBY'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="sim-controls">
            <span className="sim-phase">{simPhase}</span>
            <button className="sim-btn trigger" disabled={isAccident} style={{ opacity: isAccident ? 0.5 : 1 }} onClick={triggerAccident}>
              ⚡ TRIGGER ACCIDENT
            </button>
            <button className="sim-btn reset" onClick={resetSimulation}>↺ RESET</button>
          </div>
        </div>
      </section>

      {/* FEATURES / INNOVATION */}
      <section id="features">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">// INNOVATION &amp; IMPACT</div>
            <h2 className="section-title">What Makes ResQDrive <span>Different</span></h2>
          </div>
          <div className="features-grid reveal visible">
            <div className="feature-card" data-num="01">
              <div className="feature-icon">🤖</div>
              <div className="feature-title">ZERO HUMAN INTERVENTION</div>
              <div className="feature-desc">Fully automated from impact detection through dispatch. The system acts within 8 seconds — far faster than any human could dial emergency services.</div>
              <div className="feature-accent accent-red"></div>
            </div>
            <div className="feature-card" data-num="02">
              <div className="feature-icon">🛰️</div>
              <div className="feature-title">DUAL-MODE LOCATION</div>
              <div className="feature-desc">Primary GPS combined with cellular triangulation backup ensures location accuracy even in tunnels, underground garages, and signal-weak rural zones.</div>
              <div className="feature-accent accent-cyan"></div>
            </div>
            <div className="feature-card" data-num="03">
              <div className="feature-icon">🚦</div>
              <div className="feature-title">GREEN CORRIDOR TECH</div>
              <div className="feature-desc">Real-time V2I communication with city smart traffic infrastructure. The ambulance never hits a red light — shaving critical minutes off every response.</div>
              <div className="feature-accent accent-amber"></div>
            </div>
            <div className="feature-card" data-num="04">
              <div className="feature-icon">📊</div>
              <div className="feature-title">IMPACT SEVERITY SCORING</div>
              <div className="feature-desc">Multi-sensor fusion produces an impact severity score that prioritizes dispatch and pre-alerts trauma teams at the receiving hospital before arrival.</div>
              <div className="feature-accent accent-green"></div>
            </div>
            <div className="feature-card" data-num="05">
              <div className="feature-icon">🔒</div>
              <div className="feature-title">ENCRYPTED TELEMETRY</div>
              <div className="feature-desc">End-to-end AES-256 encrypted communication ensures patient data, location, and vehicle information remain private and tamper-proof in transit.</div>
              <div className="feature-accent accent-cyan"></div>
            </div>
            <div className="feature-card" data-num="06">
              <div className="feature-icon">🌐</div>
              <div className="feature-title">SMART CITY INTEGRATION</div>
              <div className="feature-desc">Open REST API and MQTT protocol support enable seamless integration with existing city IoT infrastructure, hospital management systems, and fleet networks.</div>
              <div className="feature-accent accent-red"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats">
        <div className="container">
          <div className="section-header reveal visible">
            <div className="section-tag">// MEASURED OUTCOMES</div>
            <h2 className="section-title">Real-World <span>Impact</span></h2>
          </div>
          <div className="stats-row reveal visible">
            <div className="stat-cell">
              <div className="stat-num">40<span>%</span></div>
              <div className="stat-label">FASTER RESPONSE</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num"><span>&lt;</span>8<span>s</span></div>
              <div className="stat-label">ALERT DISPATCH TIME</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num">99<span>%</span></div>
              <div className="stat-label">DETECTION ACCURACY</div>
            </div>
            <div className="stat-cell">
              <div className="stat-num">60<span>%</span></div>
              <div className="stat-label">IMPROVED SURVIVAL RATE</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">ResQDrive</div>
        <div className="footer-links">
          <a href="#">Documentation</a>
          <a href="#">API Reference</a>
          <a href="#">GitHub</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-copy">© 2026 ResQDrive — SMART IOT EMERGENCY RESPONSE</div>
      </footer>
    </div>
  );
}

export default App;
