const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home'
  });
});

// About route
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About'
  });
});

// Search route (GET - display form)
router.get('/search', (req, res) => {
  res.render('search', {
    title: 'Search Activities'
  });
});

// Search route (POST - display results)
router.post('/search', (req, res, next) => {
  const keyword = req.sanitize(req.body.keyword);
  
  const sql = `
    SELECT he.*, u.username 
    FROM health_entries he
    JOIN users u ON he.user_id = u.id
    WHERE he.activity_type LIKE ? OR he.notes LIKE ?
    ORDER BY he.date DESC
  `;
  
  const searchTerm = `%${keyword}%`;
  
  db.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) return next(err);
    res.render('search_results', {
      title: 'Search Results',
      keyword: keyword,
      results: results
    });
  });
});

module.exports = router;