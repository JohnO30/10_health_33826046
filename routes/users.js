

// Dependencies
const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const router = express.Router();



// --- Security Middleware Functions ---

// Middleware to redirect to login if user is not logged in
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect((req.app.locals.BASE_URL || '') + '/users/login');
  } else {
    next();
  }
};

// Middleware to redirect to home if user is already logged in
const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.redirect(req.app.locals.BASE_URL || '');
  } else {
    next();
  }
};

// --- Helper Functions ---

// Function to safely sanitise SQL LIKE input by escaping % and _
function sanitiseSearch(input) {
  if (!input) return '';
  return input.replace(/([%_'])/g, '\\$1');
}

// --- Route Handlers ---

// Registration (GET - Display Form)
router.get('/register', redirectHome, (req, res) => {
  res.render('register', {
    title: 'Register',
    errors: null
  });
});

// Registration (POST - Process Form)
router.post('/registered',
  [
    check('username', 'Username must be 2-20 characters long').isLength({ min: 2, max: 20 }),
    check('first_name', 'First name is required').notEmpty(),
    check('last_name', 'Last name is required').notEmpty(),
    check('email', 'Invalid email address').isEmail(),
    check('password', 'Password must be 8+ chars, with 1 uppercase, 1 lowercase, 1 number, and 1 symbol')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('register', {
        title: 'Register',
        errors: errors.array()
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const sql = "INSERT INTO users (username, first_name, last_name, email, hashedPassword) VALUES (?, ?, ?, ?, ?)";
      const newUserData = [
        req.sanitize(req.body.username),
        req.sanitize(req.body.first_name),
        req.sanitize(req.body.last_name),
        req.sanitize(req.body.email),
        hashedPassword
      ];

      db.query(sql, newUserData, (err, result) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.render('register', {
              title: 'Register',
              errors: [{ msg: 'Username already exists. Please choose another.' }]
            });
          }
          return next(err);
        }

        res.send(`
          <h2>Registration Successful</h2>
          <p>User ${req.body.username} has been registered successfully!</p>
          <p><a href="${req.app.locals.BASE_URL || ''}/users/login">Login here</a> or <a href="${req.app.locals.BASE_URL || ''}">Go to Home</a></p>
        `);
      });

    } catch (error) {
      next(error);
    }
  }
);

// Login (GET - Display Form)
router.get('/login', redirectHome, (req, res) => {
  res.render('login', {
    title: 'Login',
    error: null
  });
});

// Login (POST - Process Form)
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  const sql = "SELECT id, username, hashedPassword FROM users WHERE username = ?";
  console.log('Login attempt for:', username);

  db.query(sql, [username], async (err, results) => {
    console.log('DB query finished');
    if (err) return next(err);

    if (results.length === 0) {
      console.log('No user found');
      return res.render('login', {
        title: 'Login',
        error: 'Invalid username or password.'
      });
    }

    const user = results[0];
    console.log('User found, starting bcrypt.compare');
    bcrypt.compare(password, user.hashedPassword, function (err2, match) {
      console.log('bcrypt.compare finished');
      if (err2) {
        console.log('bcrypt error:', err2);
        return next(err2);
      }

      if (!match) {
        console.log('Password does not match');
        return res.render('login', {
          title: 'Login',
          error: 'Invalid username or password.'
        });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      console.log('Login successful, redirecting');
      res.redirect(req.app.locals.BASE_URL || '/');
    });
  });
});

// Logout
router.get('/logout', function (req, res) {
  req.session.destroy(function () {
    res.redirect(req.app.locals.BASE_URL || '');
  });
});

module.exports = router;