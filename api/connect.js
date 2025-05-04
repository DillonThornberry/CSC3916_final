const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.DB)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));