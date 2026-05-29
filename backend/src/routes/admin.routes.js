const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/teachers', async (_req, res) => {
   try {
     const [teachers] = await pool.query("SELECT id, first_name, last_name, middle_initial, email FROM users WHERE role='teacher'");
     const [subjects] = await pool.query('SELECT id, teacher_id, subject_name FROM subjects');
     
     const teachersWithSubjects = teachers.map(teacher => ({
       ...teacher,
       subjects: subjects.filter(s => s.teacher_id === teacher.id).map(s => s.subject_name).join(', ')
     }));
     res.json(teachersWithSubjects);
   } catch (error) {
     console.error('Get teachers error:', error);
     res.status(500).json({ message: error.message });
   }
 });

router.put('/teachers/:id', async (req, res) => {
   try {
     const { first_name, last_name, middle_initial, email, password } = req.body;
     if (!first_name || !last_name || !email) {
       return res.status(400).json({ message: 'Missing required fields: first_name, last_name, email' });
     }
     if (password) {
       await pool.query('UPDATE users SET first_name=?, last_name=?, middle_initial=?, email=?, password=? WHERE id=? AND role=?', 
         [first_name, last_name, middle_initial || null, email, password, req.params.id, 'teacher']);
     } else {
       await pool.query('UPDATE users SET first_name=?, last_name=?, middle_initial=?, email=? WHERE id=? AND role=?', 
         [first_name, last_name, middle_initial || null, email, req.params.id, 'teacher']);
     }
     res.json({ message: 'Teacher updated' });
   } catch (error) {
     console.error('Update teacher error:', error);
     res.status(500).json({ message: error.message });
   }
 });

router.delete('/teachers/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('UPDATE subjects SET teacher_id=NULL WHERE teacher_id=?', [req.params.id]);
    await conn.query('DELETE FROM users WHERE id=? AND role=?', [req.params.id, 'teacher']);
    await conn.query('COMMIT');
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    await conn.query('ROLLBACK');
    throw error;
  } finally {
    conn.release();
  }
});

router.get('/teachers/:id/subjects', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, subject_name FROM subjects WHERE teacher_id=?',
    [req.params.id]
  );
  res.json(rows);
});

router.put('/teachers/:id/subjects', async (req, res) => {
   const { subject_ids } = req.body;
   const conn = await pool.getConnection();
   try {
     await conn.query('START TRANSACTION');
     await conn.query('UPDATE subjects SET teacher_id=NULL WHERE teacher_id=?', [req.params.id]);
     if (Array.isArray(subject_ids) && subject_ids.length > 0) {
       const placeholders = subject_ids.map(() => '?').join(',');
       await conn.query(`UPDATE subjects SET teacher_id=? WHERE id IN (${placeholders})`, [req.params.id, ...subject_ids]);
     }
     await conn.query('COMMIT');
     res.json({ message: 'Subjects assigned' });
   } catch (error) {
     await conn.query('ROLLBACK');
     console.error('Subject assignment error:', error);
     throw error;
   } finally {
     conn.release();
   }
 });

router.post('/teachers', async (req, res) => {
   try {
     const { first_name, last_name, middle_initial, email, password } = req.body;
     const [result] = await pool.query('INSERT INTO users(first_name,last_name,middle_initial,email,password,role) VALUES(?,?,?,?,?,?)', [first_name, last_name, middle_initial || null, email, password, 'teacher']);
     res.json({ message: 'Teacher created', insertId: result.insertId });
   } catch (error) {
     console.error('Create teacher error:', error);
     res.status(500).json({ message: error.message });
   }
 });

router.get('/sections', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.*, c.course_code FROM sections s LEFT JOIN courses c ON s.course_id = c.id ORDER BY s.id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/sections', async (req, res) => {
  const { section_name, course_id } = req.body;
  try {
    await pool.query('INSERT INTO sections(section_name, course_id) VALUES(?,?)', [section_name, course_id || null]);
    res.json({ message: 'Section created' });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/sections/:id', async (req, res) => {
  const { section_name, course_id } = req.body;
  try {
    await pool.query('UPDATE sections SET section_name=?, course_id=? WHERE id=?', [section_name, course_id || null, req.params.id]);
    res.json({ message: 'Section updated' });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/sections/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('UPDATE users SET section_id=NULL WHERE section_id=?', [req.params.id]);
    await conn.query('DELETE FROM sections WHERE id=?', [req.params.id]);
    await conn.query('COMMIT');
    res.json({ message: 'Section deleted' });
  } catch (error) {
    await conn.query('ROLLBACK');
    console.error('Delete section error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
});

router.get('/subjects', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
     FROM subjects s
     LEFT JOIN users u ON s.teacher_id=u.id
     ORDER BY s.id DESC`
  );
  res.json(rows);
});

router.post('/subjects', async (req, res) => {
  const { subject_name, teacher_id } = req.body;
  await pool.query('INSERT INTO subjects(subject_name,teacher_id) VALUES(?,?)', [subject_name, teacher_id || null]);
  res.json({ message: 'Subject created' });
});

// Courses CRUD
router.get('/courses', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM courses ORDER BY id DESC');
  res.json(rows);
});

router.post('/courses', async (req, res) => {
  const { course_name, course_code } = req.body;
  try {
    await pool.query('INSERT INTO courses(course_name,course_code) VALUES(?,?)', [course_name, course_code]);
    res.json({ message: 'Course created' });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/courses/:id', async (req, res) => {
  const { course_name, course_code } = req.body;
  try {
    await pool.query('UPDATE courses SET course_name=?, course_code=? WHERE id=?', [course_name, course_code, req.params.id]);
    res.json({ message: 'Course updated' });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/courses/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('UPDATE subjects SET course_id=NULL WHERE course_id=?', [req.params.id]);
    await conn.query('DELETE FROM courses WHERE id=?', [req.params.id]);
    await conn.query('COMMIT');
    res.json({ message: 'Course deleted' });
  } catch (error) {
    await conn.query('ROLLBACK');
    console.error('Delete course error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
