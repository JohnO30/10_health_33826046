
USE health;
-- Sample users
-- Password for 'gold' user is: smiths123ABC$
INSERT INTO users (username, first_name, last_name, email, hashedPassword)
VALUES
  ('gold', 'Gold', 'Smith', 'gold@example.com', '$2b$10$5uNrTRPa31tGOD4hUi6VEOO7Ggsusi7Bik4NzQ7bwWkUDSFiPf5S.');

-- Sample activities for user gold (assuming id=1 after insert)
INSERT INTO health_entries (user_id, date, activity_type, duration_minutes, intensity, notes)
VALUES
  (1, '2025-01-01', 'Running', 30, 'High', 'Morning run in the park'),
  (1, '2025-01-02', 'Cycling', 45, 'Moderate', 'Cycle to uni'),
  (1, '2025-01-03', 'Yoga', 20, 'Low', 'Evening stretch');


SELECT username, email, hashedPassword FROM users WHERE username = 'gold';

