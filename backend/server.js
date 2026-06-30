const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const alertRoutes = require('./routes/alertRoutes');
const gpsRoutes = require('./routes/gpsRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for the hardware and frontend
    methods: ['GET', 'POST']
  }
});

// Make io accessible in our routers
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/alerts', alertRoutes);
app.use('/api/gps', gpsRoutes);

app.get('/', (req, res) => {
    res.send('ResQDrive API is Running Successfully! 🚀');
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });

  // Relay hardware simulator data to frontend dashboards
  socket.on('telemetry-update', (data) => {
    socket.broadcast.emit('telemetry-update', data);
  });

  socket.on('simulate-crash', async (data) => {
    const endCoords = data?.coords || [28.3670, 77.3159];
    const startCoords = data?.baseCoords || [28.3650, 77.3130];
    
    const sosPayload = {
      id: 'SOS-' + Math.floor(Math.random()*1000),
      type: 'High Impact Collision',
      location: 'Simulated Crash Site',
      coords: endCoords,
      time: new Date().toLocaleTimeString(),
      severity: 'CRITICAL'
    };

    try {
      const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`);
      const routeData = await response.json();
      if (routeData.routes && routeData.routes.length > 0) {
        sosPayload.route = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
      }
    } catch (err) {
      console.log('OSRM fetch error:', err.message);
    }

    io.emit('emergency-sos', sosPayload);
  });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔥 MongoDB Connected Successfully'))
    .catch((err) => console.log('❌ MongoDB Connection Error: ', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server with Socket.IO is running on port: ${PORT}`);
});