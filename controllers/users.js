// EXTERNAL IMPORTS
const passport = require('passport');
const mongoose = require('mongoose');

// LOCAL IMPORTS
const UserModel        = require('../models/user'),
      User             = UserModel.User,
      AdminUser        = UserModel.AdminUser,
      ButlerUser       = UserModel.ButlerUser,
      PremiumUser      = UserModel.PremiumUser,
      UrbanUser        = UserModel.UrbanUser,
      AuthLevel        = UserModel.AUTH_LEVEL,
      handleError      = require('../services/handle-error');

// ***********************************
// SIGNUP - Add a new User to the DB.
// ***********************************
exports.userSignup = function userSignup(req, res, next) {

  userIsAdmin(req)
    .then(() => saveUser(req))
    .then(() => res.status(201).json({message: 'Successfully created new user!'}))
    .catch(error => {
      handleError(res, error, 'controllers.users.signup');
    });
};

saveUser = (req) => {
  const userInfo = req.body;
  let user;

  switch (userInfo.userType) {
    case AuthLevel.Admin:
      user = new AdminUser();
      break;
    case AuthLevel.Butler:
      user = new ButlerUser();
      break;
    case AuthLevel.Premium:
      user = new PremiumUser();
      break;
    case AuthLevel.Urban:
    default:
      user = new UrbanUser();
      break;
  }

  user._id = mongoose.Types.ObjectId();
  user.authData.email = userInfo.email;
  user.userData.firstName = userInfo.firstName;
  user.userData.lastName = userInfo.lastName;
  user.userData.notes = userInfo.notes || '';
  user.authLevel = userInfo.userType;
  user.canSetPassword = true;
  user.setPassword(user._id.toString());

  return user.save()
    .then(() => Promise.resolve(user._id));
};

// ***********************************
// UPDATE - Update a User in the DB.
// ***********************************
exports.userUpdate = function userUpdate(req, res, next) {
  const userPatch = req.body;
  const userId = req.params.id;

  userAuthAndUpdate(req, userPatch, userId)
    .then(() => res.status(200).json({message: 'successful update attempt!'}))
    .catch(error => {
      handleError(res, error, 'controllers.users.update');
    });
};

userAuthAndUpdate = (req, userPatch, userId) => {
  return User.findById(userId)
    .then(user => {
      if (req.user.authLevel < AuthLevel.Admin) {
        delete userPatch.userData.notes;
        user.userData = userPatch.userData;
      } else {
        delete userPatch._id;
        user = Object.assign(user, userPatch);
      }
      if ((req.user.authLevel === AuthLevel.Admin || user.canSetPassword) &&
          userPatch.authData && userPatch.authData.password) {
        user.setPassword(userPatch.authData.password);
        user.canSetPassword = false;
      }
      return user.save();
    });
};


// ***********************************************
// LOGIN - Authenticate user, begin login session.
// ***********************************************
exports.userLogin = function userLogin(req, res, next) {
  authUser(req, res)
    .then(token => res.status(200).json({token}))
    .catch(error => {
      if (!error.code) {
        error.code = 401;
      }
      handleError(res, error, 'controllers.users.login');
    });
};

authUser = (req, res) => {
  return new Promise((resolve, reject) => {
    passport.authenticate(
      'local',
      (err, user, info) => {
        if (err) {
          reject(err);
        }
        else if(!user) {
          reject({message: info.message});
        } else {
          resolve(user.generateJwt());
        }
      })(req, res);
    });
};

// ***********************************************
// SHOW - Retrieve user info from DB.
// ***********************************************
exports.userShow = function userShow(req, res, next) {
  const userId = req.params.id;
  userAuthAndShow(req, userId)
    .then(user => res.status(200).json({authLevel: user.authLevel, userData: user.userData}))
    .catch(error => {
      handleError(res, error, 'controllers.users.show');
    });
};

userAuthAndShow = (req, userId) => {
  if (req.user.authLevel >= AuthLevel.Admin) {
    return User.findById(userId, '-authData.hash -authData.salt').exec();
  } else {
    return User.findById(req.user._id, '-authData.hash -authData.salt -agreement').exec();
  }
};

// ****************************************************
// INDEX - Get list of users, return id's and userData.
// ****************************************************
exports.userIndex = function userIndex(req, res, next) {
  const userNew = new User();
  userNew.save().then(res.status(200).json({msg: 'testing done!'}));
  // userAuthAndIndex(req)
  //   .then(() => userIndexQuery(req))
  //   .then(userList => res.status(200).json(userList))
  //   .catch(error => {
  //     handleError(res, error, 'controllers.users.index');
  //   });
};

userIndexQuery = (req) => {
  const filter = userFilterObject(req);
  const projectionParams = '_id userData authLevel agreement';

  let query = User.find(filter, projectionParams);

  // Sorting
  query
    .sort({'userData.firstName': 1}); // 1 === ascending

  return query.exec();
};

userFilterObject = (req) => {
  const authLevel = +req.query.authLevel;
  const filter = (authLevel <= 10) ?
    { authLevel: authLevel } : { authLevel: {$gte: authLevel} };
  filter.isShowing = true;

  filter.isActive = true;
  return filter;
};

userAuthAndIndex = (req) => {
  if (req.user.authLevel < AuthLevel.Butler) {
    return Promise.reject({
      message: 'You are not authorized for this action!',
      code: 401
    });
  } else {
    return Promise.resolve(true);
  }
};


// ************************************
// UTILITY - Various utility functions.
// ************************************
userIsAdmin = (req) => {
  if (req.user.authLevel < AuthLevel.Admin) {
    return Promise.reject({
      message: 'Only an Admin is authorized for this action.',
      code: 401
    });
  } else {
    return Promise.resolve(true);
  }
};
