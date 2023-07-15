const MoviesSchema = require('../Model/movieModel');
const UserSchema = require('../Model/userModel')

//get all movies
exports.getAllMovie = (req, res, next) => {
  MoviesSchema.find({})
    .sort({ createdAt: -1 })
    .populate({
      path: 'reviews.user',
      select: '-_id username'
    })
    .select('-__v') // exclude the __v field from the query result
    .then((data) => {
      const moviesWithAvgRating = data.map(movie => {
        return { ...movie.toJSON(), avgRating: movie.avgRating };
      });
      res.status(200).json(moviesWithAvgRating);
    })
    .catch(error => next(error));
};


//get all movies by Genre
exports.getMovieByGenre = (req, res, next) => {
  let moviegenre = req.params.genre;
  MoviesSchema.find({ genre: { $regex: new RegExp(moviegenre, 'i') } })
    .sort({ createdAt: -1 })
    .populate({
      path: 'reviews.user',
      select: '-_id username'
    })
    .select('-__v')
    .then((data) => {
      const moviesWithAvgRating = data.map(movie => {
        return { ...movie.toJSON(), avgRating: movie.avgRating };
      });
      res.status(200).json(moviesWithAvgRating);
    })
    .catch(error => next(error))
}

//language
exports.getMovieByLanguage = (req, res, next) => {
  let Language = req.params.Language;
  MoviesSchema.find({ languageName: { $regex: new RegExp(Language, 'i') } })
    .sort({ createdAt: -1 })
    .populate({
      path: 'reviews.user',
      select: '-_id username'
    })
    .select('-__v')
    .then((data) => {
      const moviesWithAvgRating = data.map(movie => {
        return { ...movie.toJSON(), avgRating: movie.avgRating };
      });
      res.status(200).json(moviesWithAvgRating);
    })
    .catch(error => next(error))
}

//get all movies by id
exports.getMovieById = (req, res, next) => {
  let movieId = req.params.id;
  MoviesSchema.findOne({ _id: movieId })
    .populate({
      path: 'reviews.user',
      select: '-_id username'
    })
    .select('-__v')
    .then((data) => {
      if (data == null)
        throw new Error(`movie Id: ${movieId} doesn't exists`)
      const movieWithAvgRating = { ...data.toJSON(), avgRating: data.avgRating };
      res.status(200).json(movieWithAvgRating);
    })
    .catch((error) => {
      next(error)
    })
}

// user watch movie
exports.watchMovie = async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const userId = req.params.userId;

    // Find the movie by ID
    const foundMovie = await MoviesSchema.findById(movieId)
      .populate({
        path: 'reviews.user',
        select: '-_id username'
      })
      .select('-__v');

    if (!foundMovie) {
      throw new Error('Movie not found');
    }

    // Check if the movie is premium
    if (foundMovie.state === 'premium') {
      const user = await UserSchema.findById(userId);
      if (user && !user.pro) {
        // throw new Error('Access denied. Premium movie is only available to pro users.');
        res.status(200).json({ message: 'Access denied. Premium movie is only available to pro users.' })
      }
    }
    const movieWithAvgRating = { ...foundMovie.toJSON(), avgRating: foundMovie.avgRating };
    res.status(200).json({ message: 'Movie watched successfully', movie: movieWithAvgRating });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// exports.watchMovie = (req, res, next) => {
//   const movieId = req.params.id;
//   const userId = req.body.id; // Assuming you have user authentication middleware

//   MoviesSchema.findById(movieId)
//     .populate({
//       path: 'reviews.user',
//       select: '-_id username'
//     })
//     .select('-__v')
//     .then(movie => {
//       if (!movie) {
//         throw new Error('Movie not found');
//       }

//       // Check if the movie is premium
//       if (movie.state === 'premium') {
//         return UserSchema.findById(userId); // Return a promise to chain the next operation
//       } else {
//         return Promise.resolve(null); // Return a resolved promise to skip the next operation
//       }
//     })
//     .then(user => {
//       if (user && !user.pro) {
//         throw new Error('Access denied. Premium movie is only available to pro users.');
//       }

//       // Continue with the logic to allow the user to watch the movie
//       // ...

//       res.status(200).json({ message: 'Movie watched successfully', movie });
//     })
//     .catch(error => {
//       console.error(error);
//       next(error);
//     });
// };


//get all movies by serch name
exports.getMovieByName = (req, res, next) => {
  let movieName = req.params.title;
  // console.log(movieName)
  MoviesSchema.find({ title: { $regex: new RegExp(movieName, 'i') } })
    .sort({ createdAt: -1 })
    .populate({
      path: 'reviews.user',
      select: '-_id username'
    })
    .select('-__v')
    .then((data) => {
      if (data == null)
        throw new Error(`movie name ${movieName} doesn't exists`)

      const moviesWithAvgRating = data.map(movie => {
        return { ...movie.toJSON(), avgRating: movie.avgRating };
      });

      res.status(200).json(moviesWithAvgRating);
    })
    .catch((error) => {
      next(error)
    })
}

//add movies
exports.addMovie = (req, res, next) => {
  let newMovieObject = new MoviesSchema({
    title: req.body.title,
    year: req.body.year,
    description: req.body.description,
    director: req.body.director,
    cast: req.body.cast,
    genre: req.body.genre,
    image: req.body.image,
    video: req.body.video,
    trailer: req.body.trailer,
    imdb: req.body.imdb,
    rating: req.body.rating,
    duration: req.body.duration,
    languageName: req.body.languageName,
    state: req.body.state,
    createdAt: new Date().toLocaleString()
  })
  // console.log(newMovieObject)
  newMovieObject.save()
    .then((data) => {
      res.status(201).json({ message: 'successfully added ', newMovie: data });
    })
    .catch(error => {
      next(error)
    })
}

//update movies
exports.updateMovie = (req, res, next) => {
  const movieId = req.body._id;
  const movieUpdates = req.body;
  MoviesSchema.findOne({ _id: movieId })
    .then(movie => {
      if (!movie)
        throw new Error('movie not found');
      // Merge current values and updates using Object.assign()
      const mergedUpdates = Object.assign({}, movie.toObject(), movieUpdates);
      // Update the user document with the merged updates
      movie.set(mergedUpdates);
      return movie.save();
    })
    .then(updatedMovie => {
      res.status(200).json({ message: 'movie updated', movie: updatedMovie });
    })
    .catch(error => {
      next(error);
    });
}

//delete movies
exports.deleteMovie = (req, res, next) => {
  let movieId = req.params.id;
  MoviesSchema.findOne({ _id: movieId })
    .then((movie) => {
      if (!movie)
        throw new Error('movie not found');
      // Delete the movie document
      return MoviesSchema.deleteOne({ _id: movieId });
    }).then((data) => {
      if (data.deletedCount === 0)
        throw new Error('movie not found');
      res.status(200).json({ message: 'movie deleted' });
    }).catch(error => {
      next(error);
    });
}

//get  Genres Title
exports.getAllGenresTitle = (req, res, next) => {
  MoviesSchema.distinct('genre')
    .then((genres) => {
      res.status(200).json(genres);
    })
    .catch((error) => {
      next(error);
    });
};


//get all Media
// exports.getAllMedia = async (req, res, next) => {
//   try {
//     const movies = await MoviesSchema.find().select('-__v').lean();
//     const tvShows = await TvShowSchema.find().select('-__v').lean();
//     const media = [...movies, ...tvShows].sort((a, b) => {
//       const dateA = new Date(a.createdAt);
//       const dateB = new Date(b.createdAt);
//       return dateB - dateA;
//     });
//     res.status(200).json(media);
//   } catch (error) {
//     next(error)
//   }
// }
//get By Media id
// exports.getMediaById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const movie = await MoviesSchema.findById(id).select('-__v').lean();
//     if (movie) {
//       res.status(200).json(movie);
//       return;
//     }

//     const tvShow = await TvShowSchema.findById(id).select('-__v').lean();
//     if (tvShow) {
//       res.status(200).json(tvShow);
//       return;
//     }

//     // If no movie or TV show found with the given ID
//     res.status(404).json({ message: 'Media not found' });
//   } catch (error) {
//     next(error);
//   }
// }

//add user review

exports.addUserReview = (req, res, next) => {
  const movieId = req.params.movieId;
  const { text, user, stars } = req.body;
  const newReview = {
    text: text,
    user: user,
    stars: stars,
    createdAt: new Date().toLocaleString()
  };
  UserSchema.findById(user)
    .then((user) => {
      if (!user) {
        throw new Error(`User ${user} not found`);
      }

      return MoviesSchema.findByIdAndUpdate(movieId, { $push: { reviews: newReview } });
    })
    .then(() => {
      res.status(200).json({ message: 'Review added successfully', newReview: newReview });
    })
    .catch((error) => {
      next(error)
    });
}

exports.getAllReviews = (req, res, next) => {
  const movieId = req.params.movieId;
  MoviesSchema.findById(movieId)
    .populate({
      path: 'reviews.user',
      select: '-_id username'
    })

    .then((movie) => {
      if (movie) {
        const sortedReviews = movie.reviews.sort((a, b) => b.createdAt - a.createdAt);
        res.status(200).json(sortedReviews);
      } else {
        throw new Error(`movie Id: ${movieId} doesn't exists`)
      }
    })
    .catch((error) => {
      next(error)
    });
}
