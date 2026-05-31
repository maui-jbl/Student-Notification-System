const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'student_notification_system',
    waitForConnections: true,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teacher_subject_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT NOT NULL,
        subject_id INT NOT NULL,
        section_id INT NOT NULL,
        UNIQUE KEY uq_assignment (teacher_id, subject_id, section_id),
        FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ teacher_subject_sections table created');

    const [existing] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM teacher_subject_sections'
    );
    if (existing[0].cnt === 0) {
      const [teachers] = await pool.query(
        "SELECT id FROM users WHERE role='teacher' AND archived=0"
      );
      const [subjects] = await pool.query(
        'SELECT id, teacher_id FROM subjects WHERE archived=0 AND teacher_id IS NOT NULL'
      );
      const [sections] = await pool.query(
        'SELECT id FROM sections WHERE archived=0'
      );

      for (const sub of subjects) {
        const teacher = teachers.find(t => t.id === sub.teacher_id);
        if (!teacher) continue;
        for (const sec of sections) {
          await pool.query(
            'INSERT IGNORE INTO teacher_subject_sections (teacher_id, subject_id, section_id) VALUES (?,?,?)',
            [teacher.id, sub.id, sec.id]
          );
        }
      }
      console.log('✓ Existing subject-teacher assignments migrated');
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
