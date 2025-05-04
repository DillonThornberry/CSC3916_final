/*
CSC3916 HW4
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Reviews');
const { models } = require('mongoose');

require('dotenv').config();

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            console.log("User created: " + user.username);

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signup', async (req, res) => { // Use async/await
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ success: false, msg: 'Please include both username and password to signup.' }); // 400 Bad Request
    }
  
    try {
      const user = new User({ // Create user directly with the data
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
      });
  
      await user.save(); // Use await with user.save()
  
      res.status(201).json({ success: true, msg: 'Successfully created new user.' }); // 201 Created
    } catch (err) {
      if (err.code === 11000) { // Strict equality check (===)
        return res.status(409).json({ success: false, message: 'A user with that username already exists.' }); // 409 Conflict
      } else {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
      }
    }
  });
  
  
  router.post('/signin', async (req, res) => { // Use async/await
    try {
      const user = await User.findOne({ username: req.body.username }).select('name username password');
  
      if (!user) {
        return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
      }
  
      const isMatch = await user.comparePassword(req.body.password); // Use await
  
      if (isMatch) {
        const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
        const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
        res.json({ success: true, token: 'JWT ' + token });
      } else {
        res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
      }
    } catch (err) {
      console.error(err); // Log the error
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
    }
  });

router.route('/movies')
    .get(authJwtController.isAuthenticated, async (req, res) => {

      var movies = null;

        try {
          console.log(req.query)
          if (req.query.reviews){
            console.log("Reviews requested for movie: " + req.query.reviews);
            const moviesWithReviews = await Movie.aggregate([
                {
                  $lookup: {
                    from: "reviews", // name of the foreign collection
                    localField: "_id", // field in the orders collection
                    foreignField: "movieId", // field in the items collection
                    as: "movieDetails" // output array where the joined items will be placed
                  }
                }
              ]);
            console.log("moviesWithReviews before sort", moviesWithReviews)
            moviesWithReviews.forEach(m => {
              avgRating = m.movieDetails.reduce((acc, review) => acc + review.rating, 0) / m.movieDetails.length;
              m.avgRating = avgRating;
            });
           const sorted =  moviesWithReviews.sort((a, b) => b.avgRating - a.avgRating)
            console.log("moviesWithReviews after sort", sorted)
            return res.json({ success: true, movies: sorted });
        }
        else {
            movies = await Movie.find({}); // Use await with Movie.find()
        }

            if (!movies) {
                return res.status(404).json({ success: false, message: 'No movies found.' }); // 404 Not Found
            }

            res.json({ success: true, movies: movies });
        }
        catch (err) {
            console.error(err); // Log the error
            res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
        }
     
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
        return res.status(500).json({ success: false, message: 'POST request not supported' });
    })

    .put(authJwtController.isAuthenticated, async (req, res) => {
      return res.status(500).json({ success: false, message: 'PUT request not supported' })
    })
    
    .delete(authJwtController.isAuthenticated, async (req, res) => {
      return res.status(500).json({ success: false, message: 'DELETE request not supported' });
  });

    router.route('/movies/:movie')
    .get(authJwtController.isAuthenticated, async (req, res) => {
      try {
        var movie = await Movie.findById(req.params.movie).lean();
        movieId = req.params.movie;

        console.log(req.query)

        if (req.query.reviews){
          console.log("Reviews requested for movie");
          var reviews = await Review.find({ movieId });
          movie.reviews = reviews;
          console.log("movie with reviews", movie)
          console.log("reviews", reviews)
          return res.json(movie);
          //return res.json({ success: true, movies: moviesWithReviews });
        }
        if (!movie) return res.status(404).json({ error: 'Movie not found' });
        res.json(movie);
      } catch (err) {
        res.status(400).json({ error: 'Invalid ID format' });
      }
    });

  router.route('/reviews')
    .get(authJwtController.isAuthenticated, async (req, res) => {

        try {
            var reviews = null;
            
            reviews = await Review.find({}); // Use await with Movie.find()
          
          
            if (!reviews) {
                return res.status(404).json({ success: false, message: 'No reviews found.' }); // 404 Not Found
            }

            res.json({ success: true, reviews: reviews });
        }
        catch (err) {
            console.error(err); // Log the error
            res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
        }
     
    })
    .post(authJwtController.isAuthenticated, async (req, res) => {
        console.log(req.body);
        try {
            const json = getJSONObjectForMovieRequirement(req);
            review = new Review(json.body);
            await review.save()
            
        }
        catch (err) {
            console.error(err); // Log the error
            res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
        }

        return res.status(500).json({ success: true, message: 'Review Created!' });
    })

    .put(authJwtController.isAuthenticated, async (req, res) => {
      return res.status(500).json({ success: false, message: 'PUT request not supported' })
    })
    
    .delete(authJwtController.isAuthenticated, async (req, res) => {
      return res.status(500).json({ success: false, message: 'DELETE request not supported' });
  });

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


