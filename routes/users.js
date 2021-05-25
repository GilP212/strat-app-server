// EXTERNAL IMPORTS
const express = require('express'),
      router  = express.Router(),
      jwt = require('express-jwt');

// LOCAL IMPORTS
const UsersController = require('../controllers/users');
const authRoute = require('../middleware/auth-route');

// SIGNUP
router.post(
  '/signup',
  authRoute,
  UsersController.userSignup
);

// LOGIN
router.post(
  '/login',
  UsersController.userLogin
);

// SHOW
router.get(
  '/:id',
  authRoute,
  UsersController.userShow
);

// INDEX
router.get(
  '',
  authRoute,
  UsersController.userIndex
);

// UPDATE
router.patch(
  '/:id',
  authRoute,
  UsersController.userUpdate
);


module.exports = router;
