const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relation: { type: String }
  }],
  vehicleId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
