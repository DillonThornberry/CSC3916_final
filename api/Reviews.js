var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('dotenv').config();

mongoose.connect(process.env.DB)
        .then(() => console.log('MongoDB connected!'))
        .catch(err => console.error('MongoDB connection error:', err));

// Review schema
var ReviewSchema = new Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    username: String,
    review: String,
    rating: { type: Number, min: 0, max: 5 }
});

// return the model
module.exports = mongoose.model('Review', ReviewSchema);
