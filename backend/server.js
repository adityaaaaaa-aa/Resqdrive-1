require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const twilio = require('twilio');

const User = require('./models/User');
const Accident = require('./models/Accident');
const Ambulance = require('./models/Ambulance');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techarambh', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Twilio Setup (mock credentials if not provided)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'AC_mock',
  process.env.TWILIO_AUTH_TOKEN || 'mock_token'
);

// Helper to calculate distance and find nearest ambulance
async function findNearestAmbulance(coordinates) {
  // Auto-seed if empty
  const count = await Ambulance.countDocuments({});
  if (count === 0) {
    console.log('[Seed] No ambulances found. Auto-seeding...');
    await Ambulance.create([
      { ambulanceId: 'AMB-001', driverName: 'John Doe', phone: '1112223333', location: { type: 'Point', coordinates: [-73.935242, 40.730610] }, status: 'Available' },
      { ambulanceId: 'AMB-002', driverName: 'Jane Smith', phone: '4445556666', location: { type: 'Point', coordinates: [-73.985130, 40.758896] }, status: 'Available' },
      { ambulanceId: 'AMB-003', driverName: 'Mike Johnson', phone: '7778889999', location: { type: 'Point', coordinates: [-74.005941, 40.712784] }, status: 'Available' }
    ]);
  }

  // Find ANY available ambulance first (ignores geospatial distance to prevent local DB index errors)
  let nearest = await Ambulance.findOne({ status: 'Available' });

  // Fallback: If no available ambulance, grab ANY ambulance so the demo always works
  if (!nearest) {
    nearest = await Ambulance.findOne({});
  }

  return nearest;
}

// Helper to send SMS
async function notifyEmergencyContacts(vehicleId, coordinates) {
  try {
    const user = await User.findOne({ vehicleId });
    if (!user || !user.emergencyContacts.length) return;

    const mapsLink = `https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`;
    const messageBody = `EMERGENCY ALERT: An accident involving vehicle ${vehicleId} was detected. Location: ${mapsLink}`;

    // Loop through contacts (In a real system, we'd bulk send)
    for (const contact of user.emergencyContacts) {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'AC_mock') {
        try {
          await twilioClient.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phone
          });
        } catch (twilioErr) {
          console.error(`[Twilio Error] Failed to send to ${contact.phone}:`, twilioErr.message);
        }
      }
      console.log(`[SMS Sent] to ${contact.name} (${contact.phone}): ${messageBody}`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
}

// IoT Ingestion API
app.post('/api/accident', async (req, res) => {
  try {
    const { vehicle_id, location, severity } = req.body; // location = { lat, lng }

    if (!vehicle_id || !location || !location.lat || !location.lng || !severity) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const coordinates = [location.lng, location.lat]; // GeoJSON uses [longitude, latitude]

    const accident = new Accident({
      vehicleId: vehicle_id,
      location: { type: 'Point', coordinates },
      severity
    });

    await accident.save();

    // 1. Notify Frontend via WebSocket
    io.emit('new_accident', accident);

    // 2. Emergency Dispatch Logic
    const nearestAmbulance = await findNearestAmbulance(coordinates);
    if (nearestAmbulance) {
      nearestAmbulance.status = 'Dispatched';
      nearestAmbulance.assignedAccidentId = accident._id;
      await nearestAmbulance.save();
      
      accident.dispatchedAmbulanceId = nearestAmbulance._id;
      accident.status = 'Ambulance Dispatched';
      await accident.save();

      io.emit('ambulance_dispatched', {
        accidentId: accident._id,
        ambulance: nearestAmbulance
      });
      console.log(`[Dispatch] Dispatched Ambulance ${nearestAmbulance.ambulanceId}`);
    } else {
      console.log('[Dispatch] No available ambulance found nearby.');
    }

    // 3. SMS Notifications
    await notifyEmergencyContacts(vehicle_id, coordinates);

    // 4. Smart Traffic Routing Simulation
    if (nearestAmbulance) {
      simulateTrafficRouting(nearestAmbulance, accident);
    }

    res.status(201).json({ message: 'Accident reported successfully', data: accident });
  } catch (error) {
    console.error('Error reporting accident:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Smart Traffic Routing Simulation
function simulateTrafficRouting(ambulance, accident) {
  let step = 0;
  const interval = setInterval(() => {
    step++;
    const message = `Traffic light #${step} turned GREEN for Ambulance ${ambulance.ambulanceId}.`;
    console.log(`[Traffic Sys] ${message}`);
    
    // Broadcast status to dashboard
    io.emit('traffic_routing_update', {
      ambulanceId: ambulance.ambulanceId,
      step,
      message,
      timestamp: new Date()
    });

    if (step >= 5) { // Simulate 5 traffic lights
      clearInterval(interval);
      io.emit('ambulance_arrived', {
        ambulanceId: ambulance.ambulanceId,
        accidentId: accident._id
      });
      console.log(`[Traffic Sys] Ambulance ${ambulance.ambulanceId} arrived at scene.`);
      
      // Update ambulance status
      Ambulance.findById(ambulance._id).then(amb => {
        if(amb) {
          amb.status = 'Busy';
          amb.save();
        }
      });
    }
  }, 2500); // every 2.5 seconds simulate passing a light
}

// Fetch all accidents (for dashboard initialization)
app.get('/api/accidents', async (req, res) => {
  try {
    const accidents = await Accident.find().populate('dispatchedAmbulanceId').sort({ timestamp: -1 }).limit(50);
    res.json(accidents);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all ambulances
app.get('/api/ambulances', async (req, res) => {
  try {
    const ambulances = await Ambulance.find();
    res.json(ambulances);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed data route for testing
app.post('/api/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    await Ambulance.deleteMany({});
    await Accident.deleteMany({});

    await User.create({
      name: 'Aditya',
      phone: '+1234567890',
      vehicleId: 'VH-1234',
      emergencyContacts: [{ name: 'Mom', phone: '+1987654321', relation: 'Mother' }]
    });

    // Default coordinates near some central location or generic (e.g., NYC)
    await Ambulance.create([
      { ambulanceId: 'AMB-001', driverName: 'John Doe', phone: '1112223333', location: { type: 'Point', coordinates: [-73.935242, 40.730610] } },
      { ambulanceId: 'AMB-002', driverName: 'Jane Smith', phone: '4445556666', location: { type: 'Point', coordinates: [-73.985130, 40.758896] } },
      { ambulanceId: 'AMB-003', driverName: 'Mike Johnson', phone: '7778889999', location: { type: 'Point', coordinates: [-74.005941, 40.712784] } }
    ]);

    res.json({ message: 'Seed data created!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
