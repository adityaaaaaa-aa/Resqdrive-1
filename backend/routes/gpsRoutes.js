const express = require('express');
const router = express.Router();
const { handleLiveGps } = require('../controller/gpsController');

// POST /api/gps/live - Receive live GPS data from ESP32
router.post('/live', handleLiveGps);

module.exports = router;
