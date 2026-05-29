const pool = require('./src/config/db');

async function addCourseIdToSections() {
  try {
    // Check if course_id column exists
    const [columns] = await pool.query("SHOW COLUMNS FROM sections LIKE 'course_id'");
    if (columns.length === 0) {
      // Add course_id column
      await pool.query("ALTER TABLE sections ADD COLUMN course_id INT NULL");
      await pool.query("ALTER TABLE sections ADD CONSTRAINT fk_sections_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL");
      
      // Remove the old UNIQUE constraint and add composite constraint
      await pool.query("ALTER TABLE sections DROP INDEX section_name");
      await pool.query("ALTER TABLE sections ADD UNIQUE KEY uq_section (section_name, course_id)");
      
      console.log('Added course_id to sections table');
    } else {
      console.log('course_id column already exists');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

addCourseIdToSections();