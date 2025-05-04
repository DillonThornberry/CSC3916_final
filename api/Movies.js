const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process if the connection fails (optional)
  }
};

connectDB();

// Movie schema
const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  releaseDate: { type: Number, min: [1900, 'Must be greater than 1899'], max: [2100, 'Must be less than 2100']},
  genre: {
    type: String,
    enum: [
      'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Western', 'Science Fiction'
    ],
  },
  actors: [{
    actorName: String,
    characterName: String,
  }],
});

const Movie = mongoose.model('Movie', MovieSchema);

const movie1 = new Movie({ title: 'The Dark Knight', releaseDate: 2008, genre: 'Action', actors: [{ actorName: 'Christian Bale', characterName: 'Batman' }] });
const movie2 = new Movie({ title: 'Inception', releaseDate: 2010, genre: 'Science Fiction', actors: [{ actorName: 'Leonardo DiCaprio', characterName: 'Cobb' }] });
const movie3 = new Movie({ title: 'The Matrix', releaseDate: 1999, genre: 'Science Fiction', actors: [{ actorName: 'Keanu Reeves', characterName: 'Neo' }] });
const movie4 = new Movie({ title: 'The Shawshank Redemption', releaseDate: 1994, genre: 'Drama', actors: [{ actorName: 'Tim Robbins', characterName: 'Andy Dufresne' }] });
const movie5 = new Movie({ title: 'The Goodfather', releaseDate: 1972, genre: 'Drama', actors: [{ actorName: 'Marlon Brando', characterName: 'Vito Corleone' }] });


// movie1.save()
//   .then(doc => console.log("Movie saved:", doc))
//   .catch(err => console.error("Error saving movie:", err));

// movie2.save()
//   .then(doc => console.log("Movie saved:", doc))
//   .catch(err => console.error("Error saving movie:", err));

// movie3.save() 
//   .then(doc => console.log("Movie saved:", doc))
//   .catch(err => console.error("Error saving movie:", err));

// movie4.save()
//   .then(doc => console.log("Movie saved:", doc))
//   .catch(err => console.error("Error saving movie:", err));

// movie5.save()
//   .then(doc => console.log("Movie saved:", doc))
//   .catch(err => console.error("Error saving movie:", err));

module.exports = mongoose.model('Movie', MovieSchema);