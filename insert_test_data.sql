USE health;

-- Sample users
INSERT INTO users (username, first_name, last_name, email, hashedPassword)
VALUES
  -- TODO: replace the hashedPassword below with a real bcrypt hash of 'smiths'
  ('gold', 'Gold', 'User', 'gold@example.com', 'REPLACE_WITH_BCRYPT_HASH_OF_SMITHS');

-- Sample activities for user gold (assuming id=1 after insert)
INSERT INTO health_entries (user_id, date, activity_type, duration_minutes, intensity, notes)
VALUES
  (1, '2025-01-01', 'Running', 30, 'High', 'Morning run in the park'),
  (1, '2025-01-02', 'Cycling', 45, 'Moderate', 'Cycle to uni'),
  (1, '2025-01-03', 'Yoga', 20, 'Low', 'Evening stretch');
