const pool = require('./src/config/db');

async function createCoursesTable() {
  try {
    // Create courses table
    await pool.query(`CREATE TABLE IF NOT EXISTS courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_name VARCHAR(100) NOT NULL,
      course_code VARCHAR(50) UNIQUE NOT NULL
    )`);
    
    // Check if course_id column exists before adding
    const [columns] = await pool.query(`SHOW COLUMNS FROM subjects LIKE 'course_id'`);
    if (columns.length === 0) {
      await pool.query(`ALTER TABLE subjects ADD COLUMN course_id INT NULL`);
      await pool.query(`ALTER TABLE subjects ADD CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL`);
    }
    
    console.log('Courses table created successfully');
  } catch (error) {
    console.error('Error creating courses table:', error.message);
  } finally {
    process.exit(0);
  }
}

createCoursesTable();