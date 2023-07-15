const express = require('express');

const controller = require('../Controller/movieController');

const { isAdmin } = require('./../Middlewares/authenticatedMiddleware')
const { isAdminAndisUser } = require('./../Middlewares/authenticatedMiddleware')


const router = express.Router();


// --> add the middleware only one endpoint
router.post('/movie', isAdmin, controller.addMovie) //only admin
router.patch('/movie', isAdmin, controller.updateMovie) //only admin
router.get('/movie', isAdminAndisUser, controller.getAllMovie)

router.get('/movie/:id', isAdmin, controller.getMovieById) //only admin
router.delete('/movie/:id', isAdmin, controller.deleteMovie) // only admin

router.get('/movie/watch/:id/:userId', isAdminAndisUser, controller.watchMovie)

router.route('/movie/genre/genres')
  .all(isAdminAndisUser)
  .get(controller.getAllGenresTitle)

router.route('/movie/genre/:genre')
  .all(isAdminAndisUser)
  .get(controller.getMovieByGenre)

router.route('/movie/language/:Language')
  .all(isAdminAndisUser)
  .get(controller.getMovieByLanguage)

router.route('/movie/title/:title')
  .all(isAdminAndisUser)
  .get(controller.getMovieByName)


/*------Start user get all Media ------- */
// router.get('/allMedia', isAdminAndisUser, controller.getAllMedia)
// router.get('/allMedia/:id', isAdminAndisUser, controller.getMediaById)

/* Reviews and Rating */

router.route('/movie/reviews/:movieId')
  .all(isAdminAndisUser)
  .get(controller.getAllReviews)
  .post(controller.addUserReview)


module.exports = router;
