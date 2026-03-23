const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  status: { type: String, enum: ['Reported', 'Ambulance Dispatched', 'Resolved'], default: 'Reported' },
  dispatchedAmbulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ambulance' },
  timestamp: { type: Date, default: Date.now }
});

accidentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Accident', accidentSchema);
