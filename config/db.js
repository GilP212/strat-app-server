// EXTERNAL IMPORTS
const mongoose = require('mongoose');

// LOCAL IMPORTS
const logger = require('../services/logger');

// CONSTANT VALUES
const DB_URL =
  "mongodb+srv://" +
  process.env.MONGO_ATLAS_USER + ":" + process.env.MONGO_ATLAS_PW +
  process.env.MONGO_CLUSTER;

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose
  .connect(DB_URL)
  .then(() => {
    logger.info("Connected to DB!");
  })
  .catch(error => {
    logger.error("Failed connecting to DB!", error);
  });
