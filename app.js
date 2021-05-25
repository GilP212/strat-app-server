// GLOBAL CONSTANTS
require('dotenv').config(); // imports environment variables.

// EXTERNAL IMPORTS
const express    = require('express'),
      app        = express(),
      bodyParser = require('body-parser'),
      passport   = require('passport');

// LOCAL IMPORTS
const corsHeaders   = require('./middleware/cors-headers'),
      userRoutes    = require('./routes/users');


// APP CONFIGS
app.use(bodyParser.json({ limit: process.env.MAX_REQUEST_LIMIT}));
app.use(bodyParser.urlencoded({ limit: process.env.MAX_REQUEST_LIMIT, extended: false }));
require('./config/db');
require('./config/passport');
app.use(passport.initialize());

// CORS Headers
app.use(corsHeaders);

// ROUTES
app.use('/api/users', userRoutes);

module.exports = app;
