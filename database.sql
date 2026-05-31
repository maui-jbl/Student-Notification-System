CREATE DATABASE IF NOT EXISTS student_notification_system;
USE student_notification_system;

CREATE TABLE IF NOT EXISTS sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_name VARCHAR(100) NOT NULL,
  course_id INT NULL,
  archived TINYINT(1) DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  UNIQUE KEY uq_section (section_name, course_id)
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  middle_initial VARCHAR(10),
  usn VARCHAR(50) NULL UNIQUE,
  role ENUM('admin','teacher','student') NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(120) NOT NULL,
  section_id INT NULL,
  archived TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  course_code VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(120) NOT NULL UNIQUE,
  teacher_id INT NULL,
  course_id INT NULL,
  archived TINYINT(1) DEFAULT 0,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_subjects (
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  PRIMARY KEY (student_id, subject_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_subject_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  subject_id INT NOT NULL,
  section_id INT NOT NULL,
  UNIQUE KEY uq_assignment (teacher_id, subject_id, section_id),
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  fcm_token TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student (student_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
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
  status ENUM('pending','scheduled','sent','delivered','cancelled') DEFAULT 'pending',
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

INSERT INTO courses(course_name, course_code) VALUES ('Bachelor of Science in Information Technology', 'BSIT'), ('Bachelor of Science in Computer Science', 'BSCS')
ON DUPLICATE KEY UPDATE course_name=VALUES(course_name);

INSERT INTO sections(section_name) VALUES ('BSIT2A'),('BSIT3B')
ON DUPLICATE KEY UPDATE section_name=VALUES(section_name);

INSERT INTO users(first_name, last_name, middle_initial, usn, role, email, password, section_id) VALUES
 ('Admin', 'User', NULL, NULL, 'admin', 'admin@school.com', 'admin123', NULL),
 ('Teacher', 'One', NULL, NULL, 'teacher', 'teacher1@school.com', 'teacher123', NULL),
 ('Student', 'One', NULL, 'USN-001', 'student', 'student1@school.com', 'student123', 1),
 ('Student', 'Two', NULL, 'USN-002', 'student', 'student2@school.com', 'student123', 2)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), middle_initial=VALUES(middle_initial);

INSERT INTO subjects(subject_name, teacher_id)
SELECT 'WebDev', id FROM users WHERE email='teacher1@school.com'
ON DUPLICATE KEY UPDATE subject_name=VALUES(subject_name);

INSERT IGNORE INTO student_subjects(student_id, subject_id)
SELECT u.id, s.id
FROM users u, subjects s
WHERE u.email IN ('student1@school.com','student2@school.com')
  AND s.subject_name='WebDev';
