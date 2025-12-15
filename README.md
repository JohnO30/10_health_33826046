# HealthTrack

A dynamic web application for tracking personal health and fitness activities, built with Node.js, Express, and EJS templating.

## Features

### Activity Management
- **Add Activity** - Easy-to-use form for logging health activities with details like activity type, duration, intensity, and notes
- **My Activities** - View all your logged activities with date, activity type, duration, intensity, and personal notes
- **Search Functionality** - Advanced search feature to find activities by activity type or notes with partial matching
- **Activity History** - Complete history of all logged activities sorted by most recent date

### User Features
- **User Registration** - Secure registration form for new users with comprehensive validation
  - Password requirements: 8+ characters with uppercase, lowercase, number, and symbol
  - Email validation
  - Username uniqueness checking
- **User Login** - Secure login system with bcrypt password verification
- **Login Audit** - Complete audit trail of all login attempts (successful and failed)
- **Session Management** - Secure session-based authentication with 10-minute timeout
- **Protected Routes** - Activities can only be accessed by logged-in users
- **Responsive Interface** - Clean, styled interface with consistent navigation across all pages
- **Dynamic Content** - All pages dynamically render data from the MySQL database

### Technical Features
- Server-side rendering with EJS templates and layouts
- MySQL database integration for persistent data storage
- Form validation with express-validator
- Input sanitization for security
- RESTful routing structure
- Error handling middleware
- bcrypt password hashing (10 salt rounds)

## Available Routes

### Web Pages
- `/` (or `/usr/260/` on VM) - Home page with navigation links
- `/about` - About the health tracker
- `/search` - Search for activities (GET - display form)
- `/search` - Search results (POST - display results)
- `/entries/add` - Add a new health activity (requires login)
- `/entries/my` - View your logged activities (requires login)
- `/users/register` - User registration
- `/users/login` - User login
- `/users/logout` - Logout

**Note**: All routes are automatically prefixed with the BASE_PATH when deployed on the VM.

## Setup Instructions

### Prerequisites
- Node.js (v12 or higher)
- MySQL Server
- npm (Node Package Manager)

### Installation

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/JohnO30/10_health_33826046
   cd 10_health_33826046
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database
   - Run the SQL scripts in the following order:
   ```bash
   mysql -u root -p < createdb.sql
   mysql -u root -p < insert_test_data.sql
   ```

4. **Configure environment variables**
   - Create a `.env` file in the root directory
   - Add the following variables (or use defaults):
   
   **For local development:**
   ```
   HEALTH_HOST=localhost
   HEALTH_USER=health_app
   HEALTH_PASSWORD=qwertyuiop
   HEALTH_DATABASE=health
   HEALTH_BASE_PATH=
   ```
   
   **For VM deployment (doc.gold.ac.uk):**
   ```
   HEALTH_HOST=localhost
   HEALTH_USER=health_app
   HEALTH_PASSWORD=qwertyuiop
   HEALTH_DATABASE=health
   HEALTH_BASE_PATH=/usr/260
   ```

5. **Run the application**
   ```bash
   node index.js
   ```

6. **Access the application**
   - **Locally**: Open your browser and navigate to `http://localhost:8000`
   - **On VM**: Navigate to `https://www.doc.gold.ac.uk/usr/260/`

## Project Structure

```
10_health_33826046/
├── views/                  # EJS template files
│   ├── layout.ejs          # Main layout template
│   ├── index.ejs           # Home page
│   ├── about.ejs           # About page
│   ├── add_entry.ejs       # Add activity form
│   ├── myentries.ejs       # User's activities list
│   ├── search.ejs          # Search form
│   ├── search_results.ejs  # Search results display
│   ├── login.ejs           # Login form
│   └── register.ejs        # Registration form
├── routes/                 # Route handlers
│   ├── main.js             # Main routes (home, about, search)
│   ├── entries.js          # Activity-related routes
│   └── users.js            # User authentication routes
├── public/                 # Static files
│   └── main.css            # Stylesheet
├── index.js                # Main application file
├── package.json            # Dependencies
├── createdb.sql            # Database creation script
└── insert_test_data.sql    # Test data script
```

## Dotenv Implementation

The application uses the `dotenv` package to manage environment variables, which is a best practice for handling sensitive configuration data like database credentials.

### How It Works

1. **Environment File**: A `.env` file in the root directory stores configuration variables:
   - Database credentials (host, user, password, database name)
   - Base path for deployment (HEALTH_BASE_PATH)
   - Application settings

2. **Loading Variables**: At application startup, `require('dotenv').config()` loads all variables from the `.env` file into `process.env`

3. **Accessing Variables**: Throughout the application, values are accessed using `process.env.VARIABLE_NAME` with fallback defaults:
   ```javascript
   host: process.env.HEALTH_HOST || 'localhost',
   user: process.env.HEALTH_USER || 'health_app'
   ```

### Base Path Configuration

The application supports deployment in subdirectories using the `HEALTH_BASE_PATH` environment variable:

- **Local Development**: Leave `HEALTH_BASE_PATH` empty or undefined - routes work from root (`/`)
- **VM Deployment**: Set `HEALTH_BASE_PATH=/usr/260` - all routes are prefixed with `/usr/260`

This is implemented throughout:
- Route mounting in `index.js` uses `BASE_URL` prefix
- All view templates use `<%= BASE_URL %>` for links and form actions
- Redirect middleware uses `BASE_URL` for proper navigation

### Benefits
- **Security**: Sensitive data (passwords, API keys) are kept out of source code
- **Flexibility**: Different configurations for development, testing, and production environments
- **Deployment**: Easy deployment to subdirectories without code changes
- **Version Control**: The `.env` file should be added to `.gitignore` to prevent committing secrets
- **Easy Configuration**: Environment variables can be easily changed without modifying code

**Important**: Never commit the `.env` file to version control. Add it to your `.gitignore` file.

## Audit Implementation

The login audit feature provides a comprehensive tracking system for all login attempts, both successful and failed. This implementation enhances security by providing visibility into authentication activity.

### How It Works

1. **Database Table**: A `login_audit` table stores all login attempts with the following information:
   - Unique ID for each attempt
   - Username that was used
   - Timestamp of the attempt (automatically set to current time)
   - Status (success or failed)
   - Descriptive message explaining the outcome

2. **Automatic Logging**: The `/users/loggedin` route automatically records every login attempt:
   - Successful logins: When username exists and password matches
   - Failed logins - Username not found: When the username doesn't exist in the database
   - Failed logins - Incorrect password: When username exists but password is wrong

3. **Audit History Page**: The `/users/audit` route displays all login attempts in a user-friendly table:
   - Sorted by most recent first
   - Shows date, time, username, status, and reason
   - Helps administrators monitor security and detect potential unauthorized access attempts

This audit trail helps administrators monitor security, detect potential unauthorized access attempts, and troubleshoot login issues.

## Database Schema

### Users Table
- `id` - Auto-incrementing primary key
- `username` - Unique username (2-20 characters)
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - User's email address
- `hashedPassword` - Bcrypt hashed password
- `created_at` - Account creation timestamp

### Health Entries Table
- `id` - Auto-incrementing primary key
- `user_id` - Foreign key to users table
- `date` - Date of the activity
- `activity_type` - Type of health/fitness activity
- `duration_minutes` - Duration in minutes
- `intensity` - Activity intensity level
- `notes` - Additional notes or observations

### Login Audit Table
- `id` - Auto-incrementing primary key
- `username` - Username used in login attempt
- `login_time` - Timestamp of login attempt
- `status` - Status (success/failed)
- `message` - Descriptive message about the outcome

## Technologies Used

- **Backend**: Node.js, Express.js
- **Templating**: EJS (Embedded JavaScript) with express-ejs-layouts
- **Database**: MySQL (with mysql2 driver)
- **Security**: bcrypt for password hashing
- **Validation**: express-validator
- **Sanitization**: express-sanitizer
- **Session Management**: express-session
- **Environment Variables**: dotenv
- **Frontend**: HTML5, CSS3

## Development

This project was created for the Dynamic Web Applications module at Goldsmiths College.

### Key Dependencies

- `express` - Web application framework
- `ejs` - Templating engine
- `express-ejs-layouts` - Layout support for EJS
- `mysql2` - MySQL database driver
- `bcrypt` - Password hashing
- `express-sanitizer` - Input sanitization
- `express-validator` - Form validation
- `express-session` - Session management
- `dotenv` - Environment variable management

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **Input Sanitization**: All user inputs are sanitized to prevent XSS attacks
- **SQL Injection Prevention**: Parameterized queries used throughout
- **Session Security**: Sessions expire after 10 minutes of inactivity
- **Protected Routes**: Authentication middleware protects sensitive routes
- **CSRF Protection**: Form submissions are protected
- **Login Audit**: Complete logging of all authentication attempts
