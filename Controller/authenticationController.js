const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const stripe = require('stripe')("sk_test_51NL0Z3CXa1e29qiXePhUx9Fo3l3LgGLAawDBNcEhA0BSi3pLc6D0Sm9M4wHsx9NSoQC7ZSJIr0iJUfecC0tju71S00ZuKBXKs4");
const UserSchema = require('../Model/userModel');

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Look up the user by email in the database
    const user = await UserSchema.findOne({ email }).select(['+role', '+password']);
    // If the user doesn't exist, return an error
    if (!user) {
      // return res.status(401).json({ message: 'Invalid email or password' });
      let error = new Error('Invalid email or password');
      error.status(401);
      next(error);
    }

    // Compare the user's entered password to the hashed password in the database
    const match = await bcrypt.compare(password, user.password);

    // If the passwords match, the user is authenticated
    let token;
    if (match) {

      token = jwt.sign({
        id: user._id,
        userName: user.username,
        role: user.role,
      }, process.env.secretKey, { expiresIn: "10d" })

      let userData = {
        userId: user._id,
        userName: user.username,
        userRole: user.role,
        userEmail: user.email
      }

      return res.status(200).json({ message: 'Authentication successful', userData, token });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
}


// Define a route to handle user signup


// exports.signup = async (req, res, next) => {
//   // const { username, password } = req.body;
//   const newUserObject = new UserSchema({
//     username: req.body.username,
//     email: req.body.email,
//     password: req.body.password,
//     createdAt: new Date().toLocaleString()
//   })

//   // Check if the user already exists in the database
//   UserSchema.findOne({ $or: [{ username: newUserObject.username }, { email: newUserObject.email }] })
//     .then(existingUser => {
//       if (existingUser) {
//         return res.status(409).json({ message: 'userName or userEmail already exists' });
//       }

//       // // Create a new user object with the provided username and password
//       // const user = new User({ username, password });
//           // Save the user object to the database
//           newUserObject.save()
//             .then(newUser => {
//               // Generate a token with the new user's ID as the payload
//               /*  const token = jwt.sign({
//                     id: newUser._id,
//                     userName: newUser.username,
//                     role: newUser.role,
//                 }, process.env.secretKey, { expiresIn: "10d" })
//               */
//               return res.status(200).json({ message: 'Registration successful' });
//             })
//             .catch(error => {
//               next(error)
//             });
//         })
//         .catch(error => {
//           next(error)
//         });
//     };


exports.signup = (req, res, next) => {
  const { username, email, password } = req.body;
  const createdAt = new Date().toLocaleString();

  UserSchema.findOne({ $or: [{ username }, { email }] })
    .then(existingUser => {
      if (existingUser) {
        // return res.status(409).json({ message: 'userName or userEmail already exists' });
        throw new Error('userName or userEmail already exists')
      }

      return stripe.customers.create();
    })
    .then(customer => {
      const newUser = new UserSchema({
        username,
        email,
        password,
        stripeCustomerId: customer.id,
        createdAt
      });

      return newUser.save();
    })
    .then(() => {
      return res.status(200).json({ message: 'Registration successful' });
    })
    .catch(error => {
      next(error);
    });
};
