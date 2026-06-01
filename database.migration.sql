-- Migration: Convert users table from single name to separate name fields
USE student_notification_system;

-- Add new columns (default to empty string to handle NOT NULL constraint)
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT '',
ADD COLUMN middle_initial VARCHAR(10) NULL;

-- Update the new columns - assumes existing name is "First Last" format
UPDATE users SET 
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = CASE 
    WHEN name LIKE '% %' THEN SUBSTRING_INDEX(name, ' ', -1) 
    ELSE name 
  END,
  middle_initial = CASE
    WHEN (LENGTH(name) - LENGTH(REPLACE(name, ' ', '')) - 2) > 0 
    THEN SUBSTRING_INDEX(SUBSTRING_INDEX(name, ' ', 2), ' ', -1)
    ELSE NULL
  END;

-- For the admin@ and teacher1@ and student1@ seeded accounts, set proper values
UPDATE users SET first_name='Admin', last_name='User', middle_initial=NULL WHERE email='admin@school.com';
UPDATE users SET first_name='Teacher', last_name='One', middle_initial=NULL WHERE email='teacher1@school.com';
UPDATE users SET first_name='Student', last_name='One', middle_initial=NULL WHERE email='student1@school.com';
UPDATE users SET first_name='Student', last_name='Two', middle_initial=NULL WHERE email='student2@school.com';

-- Remove old column
ALTER TABLE users DROP COLUMN name;

-- Add push_subscriptions table for Web Push (PWA)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_sub (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);