// EXTERNAL IMPORTS
const jwt = require('express-jwt');

module.exports = jwt({
  secret: process.env.JWT_AUTH_SECRET,
  aud: process.env.AUDIENCE
});
