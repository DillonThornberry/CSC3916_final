const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['individual', 'employer'], default: 'individual' },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Only for employers
});

const User = mongoose.model('User', userSchema, 'Users');

module.exports = User;