const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// create User schema
const schema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, minlength: 5,
    maxlength: 50
  },
  email: {
    type: String, required: true, minlength: 5,
    maxlength: 255, unique: true
  },
  password: {
    type: String, required: true, minlength: 8,
    maxlength: 1024, select: false
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user'],
      message: 'Invalid role value: {VALUE}. Role must be either "admin" or "user".',
    },
    default: 'user' // set the default value for the role field
  },
  pro: { type: Boolean, default: false },
  stripeCheckoutSessionId: { type: String, default: null, },
  // favorites: [{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: ['movies', 'tvShows']
  // }],
  favoritesMovie: [{
    type: Schema.Types.ObjectId,
    ref: 'movies'
  }],
  requests: [{
    type: Schema.Types.ObjectId,
    ref: 'userRequets'
  }],
  stripeCustomerId: { type: String },// Store the Stripe customer ID associated with the user
  createdAt: { type: Date },
  updatedAt: { type: Date, default: Date.now }
})


// Hash the password before saving it to the database
schema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});


//mapping
module.exports = mongoose.model('users', schema);
