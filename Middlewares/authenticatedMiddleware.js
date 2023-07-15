const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  let token;
  try {
    //check if req hsa token
    token = req.get('authorization').split(" ")[1];
    let decodedToken = jwt.verify(token, process.env.secretKey)
    req.decodedObject = decodedToken;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports.isAll = (req, res, next) => {
  if (!req.get('authorization')) {
    // If the request doesn't have the authorization header, skip token authentication
    return next();
  }
}

module.exports.isAdmin = (req, res, next) => {
  if (req.decodedObject.role == 'admin')
    next()
  else {
    // let error = new Error('not Authorized');
    // error.status = 403;
    // next(error)
    return res.status(403).json({ message: 'not Authorized' });
  }
}

module.exports.isAdminAndisUser = (req, res, next) => {
  if (req.decodedObject.role == 'admin' || req.decodedObject.role == 'user')
    next()
  else {
    // let error = new Error('not Authorized');
    // error.status = 403;
    // next(error)
    return res.status(403).json({ message: 'not Authorized' });
  }
}

