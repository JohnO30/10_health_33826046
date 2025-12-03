const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

const saltRounds = 10;

// Middleware to protect routes
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect('/users/login');
  } else {
    next();
  }
};

// GET register
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Register',
    errors: [],
    formData: {}
  });
});

// POST registered – validation + sanitisation + hashing + insert
router.post(
  '/registered',
  [
    check('email').isEmail().withMessage('Email must be valid'),
    check('username')
      .isLength({ min: 5, max: 20 })
      .withMessage('Username must be 5–20 characters'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    check('first').notEmpty().withMessage('First name is required'),
    check('last').notEmpty().withMessage('Last name is required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Re-render form with errors and entered data
      return res.render('register', {
        title: 'Register',
        errors: errors.array(),
        formData: req.body
      });
    }

    // Sanitise
    const first = req.sanitize(req.body.first);
    const last = req.sanitize(req.body.last);
    const email = req.sanitize(req.body.email);
    const username = req.sanitize(req.body.username);
    const plainPassword = req.body.password; // we hash this

    // Hash password
    bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
      if (err) return next(err);

      const sql = `
        INSERT INTO users (username, first_name, last_name, email, hashedPassword)
        VALUES (?,?,?,?,?)
      `;
      const params = [username, first, last, email, hashedPassword];

      db.query(sql, params, (err2, result) => {
        if (err2) {
          return next(err2);
        }

        // Simple confirmation page
        const msg =
          'Hello ' +
          first +
          ' ' +
          last +
          ', you are now registered! We will email you at ' +
          email;
        res.send(msg);
      });
    });
  }
);

// GET login
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login',
    error: null
  });
});

// POST loggedin – check username + password against DB, create session, audit
router.post('/loggedin', (req, res, next) => {
  const username = req.sanitize(req.body.username);
  const password = req.body.password;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], (err, results) => {
    if (err) return next(err);

    if (results.length === 0) {
      // user not found
      logLoginAttempt(username, 'FAIL', 'User not found', () => {
        return res.render('login', {
          title: 'Login',
          error: 'Invalid username or password'
        });
      });
    } else {
      const user = results[0];
      const hashedPassword = user.hashedPassword;

      bcrypt.compare(password, hashedPassword, function (err2, same) {
        if (err2) return next(err2);

        if (same) {
          // Successful login
          req.session.userId = user.id;
          req.session.username = user.username;

          logLoginAttempt(username, 'SUCCESS', 'Login successful', () => {
            res.redirect('/');
          });
        } else {
          // Wrong password
          logLoginAttempt(username, 'FAIL', 'Wrong password', () => {
            res.render('login', {
              title: 'Login',
              error: 'Invalid username or password'
            });
          });
        }
      });
    }
  });
});

// Logout
router.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.send('You are now logged out. <a href="/">Home</a>');
  });
});

// Simple /users/audit page to view login history
router.get('/audit', redirectLogin, (req, res, next) => {
  const sql = 'SELECT * FROM login_audit ORDER BY login_time DESC LIMIT 50';
  db.query(sql, [], (err, result) => {
    if (err) return next(err);
    res.send(result); // you can make a nicer EJS page if you want
  });
});

// Helper to log login attempts
function logLoginAttempt(username, status, message, callback) {
  const sql =
    'INSERT INTO login_audit (username, login_time, status, message) VALUES (?, NOW(), ?, ?)';
  db.query(sql, [username, status, message], (err, result) => {
    if (err) console.error('Error logging login attempt', err);
    if (callback) callback();
  });
}

module.exports = router;
