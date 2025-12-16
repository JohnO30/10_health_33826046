const express = require('express');
const router = express.Router();

// Middleware to check if user is logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect((req.app.locals.BASE_URL || '') + '/users/login');
  }
  next();
};

// GET /loggedin - Show a page only if logged in
router.get('/', redirectLogin, (req, res) => {
  // Always redirect to home page
  res.redirect(req.app.locals.BASE_URL || '/');
});

module.exports = router;
