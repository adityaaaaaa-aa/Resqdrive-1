const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    impactForce: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
