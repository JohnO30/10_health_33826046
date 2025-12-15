const express = require('express');
const router = express.Router();

// Base URL from environment variable (empty for local, /usr/260 on VM)
const BASE_URL = process.env.HEALTH_BASE_PATH || '';

// Local middleware to require login
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    res.redirect(BASE_URL + '/users/login');
  } else {
    next();
  }
};

// Add activity form
router.get('/add', redirectLogin, (req, res) => {
  res.render('add_entry', {
    title: 'Add Activity'
  });
});

// Handle activity submission
router.post('/added', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  const date = req.sanitize(req.body.date);
  const activity_type = req.sanitize(req.body.activity_type);
  const duration_minutes = parseInt(req.body.duration_minutes || '0', 10);
  const intensity = req.sanitize(req.body.intensity);
  const notes = req.sanitize(req.body.notes);

  const sql = `
    INSERT INTO health_entries
    (user_id, date, activity_type, duration_minutes, intensity, notes)
    VALUES (?,?,?,?,?,?)
  `;

  const params = [
    userId,
    date,
    activity_type,
    duration_minutes,
    intensity,
    notes
  ];

  db.query(sql, params, (err, result) => {
    if (err) return next(err);
    res.send(
      `Activity saved! <a href="${BASE_URL}/entries/my">View my activities</a> or <a href="${BASE_URL}">Home</a>`
    );
  });
});

// My activities list
router.get('/my', redirectLogin, (req, res, next) => {
  const userId = req.session.userId;
  const sql =
    'SELECT * FROM health_entries WHERE user_id = ? ORDER BY date DESC';
  db.query(sql, [userId], (err, result) => {
    if (err) return next(err);
    res.render('myentries', {
      title: 'My Activities',
      entries: result
    });
  });
});

module.exports = router;
