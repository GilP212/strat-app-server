// EXTERNAL IMPORTS
const mongoose = require('mongoose'),
      crypto = require('crypto'),
      jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

// CONSTANT VALUES
const SALT_LENGTH = 16,
      ITERATIONS = 1000,
      KEY_LENGTH = 64,
      DIGEST = 'sha512';

const EXP_TIME_HOURS = 1,
      EXP_TIME = EXP_TIME_HOURS * 60 * 60 * 1000;

const AUTH_LEVEL = {
  Urban: 9,
  Premium: 10,
  Butler: 11,
  Admin: 12,
};

// USER SCHEMA
const userSchema = Schema({
  authLevel: {type: Number, default: AUTH_LEVEL.Urban},
  authData: { // remember to put unique back to true
    email: {type: String, unique: false, required: false},
    hash: String,
    salt: String
  },
  userData: {
    firstName: {type: String, required: false},
    lastName: {type: String, required: false},
    phone: {type: String, required: false},
    startDate: {type: Date, default: Date.now()},
    birthday: {type: Date, required: false},
    notes: {type: String, default: ''},
  },
  agreement: {
    type: {type: Number, default: AUTH_LEVEL.Urban},
    notes: {type: String, default: ''},
  },
  canSetPassword: {type: Boolean, default: false},
  isActive: {type: Boolean, default: true},
  isShowing: {type: Boolean, default: true},
});

// METHODS
userSchema.methods.setPassword = function(password) {
  this.authData.salt = crypto
    .randomBytes(SALT_LENGTH)
    .toString('hex');

  this.authData.hash = crypto
    .pbkdf2Sync(password, this.authData.salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');
  };

userSchema.methods.validPassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.authData.salt, ITERATIONS, KEY_LENGTH, DIGEST)
    .toString('hex');

  return (this.authData.hash === hash);
};

userSchema.methods.generateJwt = function () {
  return jwt.sign({
    _id: this._id,
    authLevel: this.authLevel,
    email: this.authData.email,
    firstName: this.userData.firstName,
    exp: Date.now() + EXP_TIME
  }, process.env.JWT_AUTH_SECRET);
};

const User = mongoose.model('User', userSchema);

// EXPORTS
exports.User = User;
