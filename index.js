// Import modules
var express = require('express');
var ejs = require('ejs');
var expressLayouts = require('express-ejs-layouts');
const path = require('path');
var mysql = require('mysql2');
require('dotenv').config();
var session = require('express-session');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Use express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Static files (CSS, images, client-side JS)
app.use(express.static(path.join(__dirname, 'public')));

// Body parser for forms (urlencoded)
app.use(express.urlencoded({ extended: true }));

// Sanitizer (must come after body parser)
app.use(expressSanitizer());

// Sessions
app.use(session({
  secret: 'someSuperSecretStringChangeMe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 600000 // 10 minutes
  }
}));

// Define DB connection pool (using dotenv variables from spec)
const db = mysql.createPool({
  host: process.env.HEALTH_HOST || 'localhost',
  user: process.env.HEALTH_USER || 'health_app',
  password: process.env.HEALTH_PASSWORD || 'qwertyuiop',
  database: process.env.HEALTH_DATABASE || 'health',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

global.db = db;

// App-wide locals (like shopData from Thirsty Student)
app.locals.siteData = {
  siteName: "HealthTrack"
};

// Attach session to res.locals (so we can use it easily in views)
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Load route handlers
const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/users');
const entryRoutes = require('./routes/entries');

// Base URL configuration (empty for local, /usr/260 on VM)
const BASE_URL = process.env.HEALTH_BASE_PATH || '';

app.use(BASE_URL, mainRoutes);
app.use(`${BASE_URL}/users`, userRoutes);
app.use(`${BASE_URL}/entries`, entryRoutes);

// Start listening
app.listen(port, () => {
  console.log(`HealthTrack app listening on port ${port}...`);
});
