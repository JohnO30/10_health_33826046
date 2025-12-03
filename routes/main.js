const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home'
  });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About'
  });
});

// Search form
router.get('/search', (req, res) => {
  res.render('search', {
    title: 'Search Activities'
  });
});

// Search results (GET, like Lab 5 search_result) 
router.get('/search_results', (req, res, next) => {
  let term = req.sanitize(req.query.term || '');
  let likeTerm = '%' + term + '%';

  let sql = `
    SELECT h.*, u.username
    FROM health_entries h
    JOIN users u ON h.user_id = u.id
    WHERE h.activity_type LIKE ? OR h.notes LIKE ?
    ORDER BY h.date DESC
  `;

  db.query(sql, [likeTerm, likeTerm], (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('search_results', {
      title: 'Search Results',
      term: term,
      entries: result
    });
  });
});

module.exports = router;
