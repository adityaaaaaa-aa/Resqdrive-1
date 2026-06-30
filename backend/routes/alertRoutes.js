const express = require('express');
const router = express.Router();
const EmergencyAlert = require('../models/EmergencyAlert');

// POST /api/alerts/trigger
router.post('/trigger', async (req, res) => {
    try {
        const { deviceId, latitude, longitude, impactForce, status, createdAt } = req.body;

        const newAlert = new EmergencyAlert({
            deviceId,
            latitude,
            longitude,
            impactForce,
            status: status || 'Pending',
            createdAt: createdAt || Date.now()
        });

        await newAlert.save();

        res.status(201).json({
            success: true,
            message: 'Emergency alert triggered successfully',
            data: newAlert
        });
    } catch (error) {
        console.error('Error triggering alert:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error: Failed to trigger alert',
            error: error.message
        });
    }
});

module.exports = router;
