const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
// const paypal = require('paypal-rest-sdk');

const authMW = require("./Middlewares/authenticatedMiddleware");
const authenticatedRouter = require("./routes/authenticationRoute");
const userRouter = require("./routes/userRoute");
const movieRouter = require("./routes/movieRoute");
const userRequestRouter = require("./routes/userRequestRoute");
const userPaymentRouter = require("./routes/userPayment");

const server = express(); //create server
server.use(cors()); //alow cors

dotenv.config();

//Create config options, with parameters (mode, client_id, secret).
// paypal.configure({
//   'mode': 'sandbox', //sandbox or live
//   'client_id': 'AeFsYozM31ZiyS_oNAYZOeDl-zdbFobSnoo7FYHl-o7iTSz3JI6LF2wvpGfFBBl8IpUE4EgdwQ2iQJgv',
//   'client_secret': 'EF8eUQbJaMsVg-n_TvTt57A5_ccO9IhDeVdQNMmgx2FWvWqHVt9-SFbxU5CQIj6CWzVDPklk2-PvS3Pv'
// });

//open node js server and opern connection mongoodb
mongoose
  .connect("mongodb://127.0.0.1:27017/MoviesSystem")
  .then(() => {
    console.log("DB connected...");
    //---listening  server
    server.listen(process.env.PORT || 8088, () => {
      console.log("server ==> I am listening...");
    });
  })
  .catch((error) => {
    console.log("Failed to connect to MongoDB: " + error);
  });

// ----------- server layers --------

// First MW --> Logging we write code
/*
server.use((req, res, next) => {
    console.log(req.url, req.method)
    next();
});
*/
// First MW --> Logging use Morgan middleware
server.use(morgan("dev"));

//Seconde MW --> Authentication
/*
server.use((req, res, next) => {
    console.log('Authenticated MW <==');
    // res.status(200).json({ message: 'Hello From Server' })
    next();
    //Jump to error MW
    // next(new Error('Not Authenticated'));
});
*/

//Node.js body parsing middleware
//Setting ==> Use the body-parser in express middleware to parse request bodies
server.use(express.json());

server.use(authenticatedRouter);
server.use(userPaymentRouter);
server.use(authMW);

//*********** Routes ************
server.use(userRouter);
server.use(movieRouter);
server.use(userRequestRouter);

//Not Found MW
server.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
  next();
});

//Error MW
server.use((error, req, res, next) => {
  res.status(500).json({ message: "Error:" + error });
});

// best practices to check with multi call back function
/*
server.get('/user', (req, res, next) => {
    //check admin or user
    if (true)
        next();
    else
        next(new Error('not authorized'));
}, (req, res, next) => {
    //body check ,url data check vaild
    //next or next(new Error('Error validation'))
}, (req, res) => {
    res.status(200).json({ data: [{ id: 1, name: 'test user' }] })
});
*/
