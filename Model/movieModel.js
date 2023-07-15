const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  stars: {
    type: Number,
    min: 1,
    max: 5,
    default: 0,
  },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// create Movie schema
const schema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  year: { type: Number, required: true },
  description: { type: String, required: true },
  director: { type: String, required: true },
  cast: [{ type: String, required: true }],
  genre: [{ type: String, required: true }],
  duration: { type: Number, required: true },
  languageName: { type: String, required: true },
  image: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid URL for image field",
    },
  },
  video: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid URL for video field",
    },
  },
  imdb: {
    type: String,
    validate: {
      validator: function (value) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid URL for imdb field",
    },
  },
  trailer: {
    type: String,
    validate: {
      validator: function (value) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(value);
      },
      message: "Invalid URL for trailer field",
    },
  },
  state: {
    type: String,
    enum: {
      values: ["free", "premium"],
      message:
        'Invalid role value: {VALUE}. Role must be either "free" pr "premium".',
    },
    default: "free", // set the default value for the state field
  },
  reviews: [reviewSchema],
  createdAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});

schema.virtual("avgRating").get(function () {
  let totalStars = 0;
  let numReviews = this.reviews.length;
  if (numReviews === 0) {
    return 0;
  }
  for (let i = 0; i < numReviews; i++) {
    if (
      typeof this.reviews[i].stars !== "number" ||
      isNaN(this.reviews[i].stars)
    ) {
      continue;
    }
    totalStars += this.reviews[i].stars;
  }
  return parseFloat((totalStars / numReviews).toFixed(1));
});

module.exports = mongoose.model("movies", schema);
