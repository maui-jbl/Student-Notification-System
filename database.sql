CREATE DATABASE IF NOT EXISTS student_notification_system;
USE student_notification_system;

CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role ENUM('admin','teacher','student') NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(120) NOT NULL,
  section_id INT NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(120) NOT NULL,
  teacher_id INT NULL,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_subjects (
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  PRIMARY KEY (student_id, subject_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  sender_id INT NOT NULL,
  subject_id INT NOT NULL,
  section_id INT NOT NULL,
  priority ENUM('Urgent','Normal','Exam','Event') DEFAULT 'Normal',
  scheduled_at DATETIME NULL,
  status ENUM('scheduled','sent','delivered') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_reads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id INT NOT NULL,
  student_id INT NOT NULL,
  read_at DATETIME NOT NULL,
  UNIQUE KEY uq_read (notification_id, student_id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  fcm_token TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student (student_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO sections(section_name) VALUES ('BSIT2A'),('BSIT3B')
ON DUPLICATE KEY UPDATE section_name=VALUES(section_name);

INSERT INTO users(name, role, email, password, section_id) VALUES
('Admin User','admin','admin@school.com','admin123',NULL),
('Teacher One','teacher','teacher1@school.com','teacher123',NULL),
('Student One','student','student1@school.com','student123',1),
('Student Two','student','student2@school.com','student123',2)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO subjects(subject_name, teacher_id)
SELECT 'WebDev', id FROM users WHERE email='teacher1@school.com'
ON DUPLICATE KEY UPDATE subject_name=VALUES(subject_name);

INSERT IGNORE INTO student_subjects(student_id, subject_id)
SELECT u.id, s.id
FROM users u, subjects s
WHERE u.email IN ('student1@school.com','student2@school.com')
  AND s.subject_name='WebDev';
