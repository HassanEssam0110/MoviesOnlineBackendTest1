const UserSchema = require('../Model/userModel')
const MovieSchema = require('../Model/movieModel')
// const bcrypt = require('bcrypt');
const stripe = require('stripe')("sk_test_51NL7SRGtkA0JzOs1tV5a6mbMY3dD8z7cGOZT5oIVyzvUJsNSOBnftc3hc5kXZuWOi8ZLo9gSob329K63k6Wwabcy00JmZVSjhT");



//all users
exports.getAllUser = (req, res, next) => {
  UserSchema.find({}).select(['+role', '+password'])
    .populate('favoritesMovie')
    .populate({
      path: 'requests',
      select: 'title topic adminResponse'
    })
    .then((data) => {
      res.status(200).json(data)
    })
    .catch(error => {
      next(error)
    })

}
// one user by id
exports.getUserById = (req, res, next) => {
  let userId = req.params.id;
  console.log(userId)
  UserSchema.findOne({ _id: userId })
    .populate('favoritesMovie')
    .populate({
      path: 'requests',
      select: 'title topic adminResponse'
    })
    .then((data) => {
      if (data == null)
        throw new Error("user doesn't exists")
      res.status(200).json(data)
    })
    .catch((error) => {
      next(error)
    })
}
// one user by name
exports.getUserByName = (req, res, next) => {
  let userName = req.params.name;
  console.log(userName)
  UserSchema.findOne({ username: userName })
    .populate('favoritesMovie')
    .populate({
      path: 'requests',
      select: 'title topic adminResponse'
    })
    .then((data) => {
      if (data == null)
        throw new Error("user doesn't exists")
      res.status(200).json(data)
    })
    .catch((error) => {
      next(error)
    })
}
// add user
/*
exports.addUser = (req, res, next) => {
    let newUserObject = new UserSchema({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        createdAt: new Date()
    })
    console.log(newUserObject)
    newUserObject.save()
        .then((data) => {
            res.status(201).json({ data: 'successfully added ', newUser: data });
        })
        .catch(error => {
            next(error)
        })
}
*/
// add role admin
exports.addAdmin = (req, res, next) => {
  let adminName = req.body.username;
  UserSchema.updateOne({ username: adminName }, { $set: { role: "admin", updatedAt: new Date().toLocaleString() } }).select('+role')
    .then((data) => {
      if (data.matchedCount == 0)
        throw new Error("user doesn't exists")
      res.status(201).json({ data: 'successfully Update ', adminData: data });
    })
    .catch(error => {
      next(error)
    })
}
//emove role admin
// exports.removeAdmin = (req, res, next) => {
//   let adminName = req.body.username;
//   UserSchema.updateOne({ username: adminName }, { $set: { role: "user", updatedAt: new Date().toLocaleString() } }).select('+role')
//     .then((data) => {
//       if (data.matchedCount == 0)
//         throw new Error("user doesn't exists")
//       res.status(201).json({ data: 'successfully Update ', adminData: data });
//     })
//     .catch(error => {
//       next(error)
//     })
// }
exports.removeAdmin = (req, res, next) => {
  let adminName = req.body.username;

  UserSchema.countDocuments({ role: 'admin' })
    .then((count) => {
      if (count === 1) {
        throw new Error('Cannot remove the last admin');
      }
      return UserSchema.updateOne(
        { username: adminName },
        { $set: { role: 'user', updatedAt: new Date().toLocaleString() } }
      ).select('+role');
    }).then((data) => {
      if (data.matchedCount === 0) {
        throw new Error("User doesn't exist");
      }

      res.status(201).json({ data: 'Successfully updated', adminData: data });
    })
    .catch(error => {
      next(error)
    })
}

exports.getAllAdmin = (req, res, next) => {
  UserSchema.find({ role: 'admin' })
    .then(data => {
      if (!data)
        throw new Error('not found any Admin')

      res.status(200).json(data)
    }).catch(error => {
      next(error)
    })
}

//user update
exports.updateUser = (req, res, next) => {
  const userId = req.body._id;
  const updates = req.body;
  UserSchema.findOne({ _id: userId })
    .then(user => {
      if (!user)
        throw new Error('User not found');
      // Remove the role property from the updates object
      delete updates.role;
      // Merge current values and updates using Object.assign()
      const mergedUpdates = Object.assign({}, user.toObject(), updates);
      // Update the user document with the merged updates
      user.set(mergedUpdates);
      return user.save();
    })
    .then(updatedUser => {
      res.status(200).json({ message: 'User updated', user: updatedUser });
    })
    .catch(error => {
      next(error);
    });
}

//delete user
exports.deleteUser = (req, res, next) => {
  let userId = req.params.id;
  UserSchema.findOne({ _id: userId })
    .then((user) => {
      if (!user)
        throw new Error('User not found');
      // Delete the user document
      return UserSchema.deleteOne({ _id: userId });
    }).then((data) => {
      if (data.deletedCount === 0)
        throw new Error('User not found');
      res.status(200).json({ message: 'User deleted' });
    }).catch(error => {
      next(error);
    });
}


// exports.getUserFavorite = (req, res) => {
//     let user = req.params.id;
//     console.log(user)
//     //code
//     res.status(200).json({ data: [{ id: user, name: 'xx', fav: { title: 'xxx' } }] })
// }



//add user favorite
exports.addInFavorite = (req, res, next) => {
  const userId = req.params.id;
  const favoriteId = req.body.favoriteId;

  console.log(userId)
  console.log(favoriteId)

  if (!favoriteId) {
    return res.status(400).json({ message: 'Favorite ID is required' });
  }

  let user;
  UserSchema.findById(userId)
    .then((foundUser) => {
      if (!foundUser) {
        throw new Error(`User with ID ${userId} not found`);
      }

      user = foundUser;
      return MovieSchema.findById(favoriteId);
    })
    .then((favorite) => {
      if (!favorite) {
        throw new Error(`Media with ID ${favoriteId} not found`);
      }

      // Check if the favorite already exists in the user's favorites
      if (user.favoritesMovie && user.favoritesMovie.includes(favoriteId)) {
        throw new Error('Media already exists in favorites');
      }

      user.favoritesMovie.push(favoriteId);
      return user.save();
    })
    .then((updatedUser) => {
      res.status(201).json({ message: 'Media added to favorites successfully', favoritesMovie: updatedUser.favoritesMovie });
    })
    .catch((error) => {
      next(error);
    });
};

//get user favorite
exports.getFavorites = (req, res, next) => {
  const userId = req.params.id;
  UserSchema.findById(userId)
    .populate('favoritesMovie')
    .exec()
    .then((user) => {
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      const favoritesMovie = user.favoritesMovie;
      const moviesWithAvgRating = favoritesMovie.map(movie => {
        return { ...movie.toJSON(), avgRating: movie.avgRating };
      });
      res.status(200).json(moviesWithAvgRating);
    })
    .catch((error) => {
      next(error);
    });
};

//delete user favorite
exports.deleteFavorite = (req, res, next) => {
  const userId = req.params.id;
  const favoriteId = req.params.favoriteId;
  UserSchema.findById(userId)
    .then((user) => {
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      const favoritesMovieIndex = user.favoritesMovie.indexOf(favoriteId);

      if (favoritesMovieIndex > -1) {
        user.favoritesMovie.splice(favoritesMovieIndex, 1);
      } else {
        throw new Error(`Favorite with ID ${favoriteId} not found`);
      }

      return user.save();
    })
    .then((updatedUser) => {
      res.status(200).json({ message: 'Favorite deleted successfully', favoritesMovie: updatedUser.favoritesMovie });
    })
    .catch((error) => {
      next(error);
    });
};

/* user payment to make account pro */
exports.makeUserPro = async (req, res, next) => {
  const userId = req.params.id;
  try {
    // Find the user by ID
    const user = await UserSchema.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user is already a pro
    if (user.pro) {
      throw new Error('User is already a pro');
    }

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp',
            product_data: {
              name: `Pro Subscription for ${user.username}`,
            },
            unit_amount: 20000, // Adjust the amount as per your subscription plans
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
      customer_email: user.email
    });

    // Update the user's pro status after a successful payment
    if (session && session.id) {
      // Store the session ID in the user's record
      user.stripeCheckoutSessionId = session.id;
      await user.save();
      res.status(200).json(session)
      //  res.redirect(303, `${req.protocol}://${req.get('host')}/success?session_id=${session.id}`);
    }
    else {
      throw new Error('Failed to create Checkout Session');
    }

  } catch (error) {
    console.error(error);
    next(error);
  }
};



