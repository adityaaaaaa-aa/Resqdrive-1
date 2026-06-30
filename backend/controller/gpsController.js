const mongoose = require('mongoose');

// In-memory store to keep track of the last time we saved to the database for each device
const lastDbSaveTime = new Map();

// Mock Mongoose model if it doesn't exist, replace with your actual model import
// const GpsTracking = require('../models/GpsTracking');
// Creating a basic schema dynamically just so the logic is complete
let GpsTracking;
try {
  GpsTracking = mongoose.model('GpsTracking');
} catch (error) {
  const GpsSchema = new mongoose.Schema({
    deviceId: String,
    location: {
      lat: Number,
      lng: Number
    },
    timestamp: { type: Date, default: Date.now }
  });
  GpsTracking = mongoose.model('GpsTracking', GpsSchema);
}

exports.handleLiveGps = async (req, res) => {
  const { deviceId, lat, lng } = req.body;

  if (!deviceId || !lat || !lng) {
    return res.status(400).json({ success: false, message: 'Missing required GPS data' });
  }

  // 1. Instantly emit to all connected frontend clients with zero latency
  // req.app.get('io') is how we access the socket.io instance from Express
  const io = req.app.get('io');
  if (io) {
    io.emit('locationUpdate', { deviceId, lat, lng, timestamp: Date.now() });
  }

  // 2. Throttle Database Saves (Save only once every 30 seconds per device)
  const currentTime = Date.now();
  const lastSave = lastDbSaveTime.get(deviceId) || 0;
  const THRESHOLD = 30 * 1000; // 30 seconds in milliseconds

  if (currentTime - lastSave >= THRESHOLD) {
    try {
      // Save to MongoDB
      await GpsTracking.create({
        deviceId,
        location: { lat, lng }
      });
      
      // Update the last save time
      lastDbSaveTime.set(deviceId, currentTime);
      console.log(`[DB SAVE] Saved location for ${deviceId} at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('[DB ERROR] Failed to save GPS data to MongoDB', error);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
  }

  // Always return success quickly so the ESP32 hardware doesn't hang
  res.status(200).json({ success: true, message: 'GPS data processed' });
};
