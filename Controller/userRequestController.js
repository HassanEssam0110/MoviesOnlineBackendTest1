const UserRequestSchema = require('../Model/userRequestModel')
const UserSchema = require('../Model/userModel')

exports.getAllUserRequest = (req, res, next) => {
  UserRequestSchema.find({})
    .populate({
      path: 'user',
      select: '_id username email'
    })
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      next(error)
    })
}
exports.getUserRequests = (req, res, next) => {
  const userId = req.params.userId;
  UserRequestSchema.find({ user: userId })
    .populate({
      path: 'user',
      select: '_id username email'
    })
    .then((data) => {
      res.status(200).json(data)
    })
    .catch((error) => {
      next(error)
    })
}

exports.addUserRequest = (req, res, next) => {
  const newRequestObj = new UserRequestSchema({
    user: req.body.userId,
    title: req.body.title,
    topic: req.body.topic
  })
  UserSchema.findById(newRequestObj.user)
    .then((user) => {
      if (!user) {
        throw new Error(`User with ID ${newRequestObj.user} not found`);
      }

      return newRequestObj.save()

    }).then((data) => {
      // Update the user's request property
      return UserSchema.findByIdAndUpdate(newRequestObj.user, { $push: { requests: data._id } }, { new: true });
    })
    .then((updatedUser) => {
      res.status(201).json({ message: 'successfully added ', newRequestObj });
    })
    .catch(error => {
      next(error)
    })
  // res.status(200).json({ data: 'successfully added' });
}

exports.adminResponse = (req, res, next) => {
  const userReqId = req.params.reqId;
  const adminResponse = req.body.adminResponse;
  UserRequestSchema.findByIdAndUpdate(
    userReqId,
    { adminResponse },
    { new: true }
  )
    .then((updatedRequest) => {
      if (!updatedRequest) {
        throw new Error(`User Request with ID ${userReqId} not found`);
      }
      res.status(200).json({ message: 'Admin response updated successfully', request: updatedRequest });
    })
    .catch((error) => {
      next(error);
    });
};

// exports.updateUserRequest = (req, res) => {
//     res.status(200).json({ data: 'successfully updated' });
// }

// exports.deleteUserRequest = (req, res) => {
//     res.status(200).json({ data: 'successfully deleted' });
// }
