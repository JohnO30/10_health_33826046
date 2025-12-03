-- Create database
CREATE DATABASE IF NOT EXISTS health;
USE health;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT,
  username       VARCHAR(50) NOT NULL UNIQUE,
  first_name     VARCHAR(50) NOT NULL,
  last_name      VARCHAR(50) NOT NULL,
  email          VARCHAR(100) NOT NULL,
  hashedPassword VARCHAR(255) NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(id)
);

-- Health entries table
CREATE TABLE IF NOT EXISTS health_entries (
  id               INT AUTO_INCREMENT,
  user_id          INT NOT NULL,
  date             DATE NOT NULL,
  activity_type    VARCHAR(100) NOT NULL,
  duration_minutes INT,
  intensity        VARCHAR(20),
  notes            TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Login audit table
CREATE TABLE IF NOT EXISTS login_audit (
  id          INT AUTO_INCREMENT,
  username    VARCHAR(50) NOT NULL,
  login_time  DATETIME DEFAULT CURRENT_TIMESTAMP,
  status      VARCHAR(20) NOT NULL,
  message     VARCHAR(255),
  PRIMARY KEY(id)
);

-- Create application user (for VM marking)
CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON health.* TO 'health_app'@'localhost';
