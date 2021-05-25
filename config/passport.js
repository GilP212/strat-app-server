// EXTERNAL IMPORTS
const passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      logger = require('../services/logger');

// LOCAL IMPORTS
const UserModel = require('../models/user'),
      User      = UserModel.User;

passport.use(
  new LocalStrategy({
    usernameField: 'email'
  },
  (username, password, done) => {
    User
      .findOne({'authData.email': username})
      .then(user => {
        // Return if user not found in database
        if (!user) {
          return done(null, false, {
            message: 'User not found'
          });
        }
        // Return if password is wrong
        if (!user.validPassword(password)) {
          return done(null, false, {
            message: 'Password is wrong'
          });
        }
        // If credentials are correct, return the user object
        return done(null, user);
      })
      .catch(error => {
        logger.error('Login Failed - internal server error.', error);
        done(error);
      });
  })
);
