const mongoose = require('mongoose');

const ambulanceSchema = new mongoose.Schema({
  ambulanceId: { type: String, required: true, unique: true },
  driverName: { type: String, required: true },
  phone: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  status: { type: String, enum: ['Available', 'Dispatched', 'Busy', 'Maintenance'], default: 'Available' },
  assignedAccidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Accident' },
  lastUpdated: { type: Date, default: Date.now }
});

ambulanceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ambulance', ambulanceSchema);
