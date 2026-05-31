const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/teachers', async (_req, res) => {
   try {
     const [teachers] = await pool.query("SELECT id, first_name, last_name, middle_initial, email FROM users WHERE role='teacher' AND archived=0");
     const [assignments] = await pool.query(
       `SELECT tsa.teacher_id, s.subject_name, sec.section_name
        FROM teacher_subject_sections tsa
        JOIN subjects s ON s.id=tsa.subject_id
        JOIN sections sec ON sec.id=tsa.section_id`
     );
     
     const teachersWithSubjects = teachers.map(teacher => ({
       ...teacher,
       subjects: assignments.filter(a => a.teacher_id === teacher.id)
         .map(a => `${a.subject_name} (${a.section_name})`).join(', ')
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
  try {
    await pool.query('UPDATE subjects SET teacher_id=NULL WHERE teacher_id=?', [req.params.id]);
    await pool.query("UPDATE users SET archived=1 WHERE id=? AND role='teacher'", [req.params.id]);
    res.json({ message: 'Teacher archived' });
  } catch (error) {
    console.error('Archive teacher error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/teachers/archived', async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, first_name, last_name, middle_initial, email FROM users WHERE role='teacher' AND archived=1 ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error('Get archived teachers error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/teachers/:id/restore', async (req, res) => {
  try {
    await pool.query("UPDATE users SET archived=0 WHERE id=? AND role='teacher'", [req.params.id]);
    res.json({ message: 'Teacher restored' });
  } catch (error) {
    console.error('Restore teacher error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/teachers/:id/subjects', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, subject_name FROM subjects WHERE teacher_id=?',
    [req.params.id]
  );
  res.json(rows);
});

router.delete('/teachers/:id/permanent', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    await conn.query('UPDATE subjects SET teacher_id=NULL WHERE teacher_id=?', [req.params.id]);
    await conn.query('DELETE FROM teacher_subject_sections WHERE teacher_id=?', [req.params.id]);
    await conn.query('DELETE FROM notifications WHERE sender_id=?', [req.params.id]);
    await conn.query("DELETE FROM users WHERE id=? AND role='teacher'", [req.params.id]);
    await conn.query('COMMIT');
    res.json({ message: 'Teacher permanently deleted' });
  } catch (error) {
    await conn.query('ROLLBACK');
    console.error('Permanent delete teacher error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    conn.release();
  }
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
    const [rows] = await pool.query('SELECT s.*, c.course_code FROM sections s LEFT JOIN courses c ON s.course_id = c.id WHERE s.archived=0 ORDER BY s.id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/sections/archived', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT s.*, c.course_code FROM sections s LEFT JOIN courses c ON s.course_id = c.id WHERE s.archived=1 ORDER BY s.id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get archived sections error:', error);
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
  try {
    await pool.query("UPDATE sections SET archived=1 WHERE id=?", [req.params.id]);
    res.json({ message: 'Section archived' });
  } catch (error) {
    console.error('Archive section error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/sections/:id/restore', async (req, res) => {
  try {
    await pool.query("UPDATE sections SET archived=0 WHERE id=?", [req.params.id]);
    res.json({ message: 'Section restored' });
  } catch (error) {
    console.error('Restore section error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/subjects', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
     FROM subjects s
     LEFT JOIN users u ON s.teacher_id=u.id
     WHERE s.archived=0
     ORDER BY s.id DESC`
  );
  res.json(rows);
});

router.get('/subjects/archived', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
     FROM subjects s
     LEFT JOIN users u ON s.teacher_id=u.id
     WHERE s.archived=1
     ORDER BY s.id DESC`
  );
  res.json(rows);
});

router.post('/subjects', async (req, res) => {
  const { subject_name, teacher_id } = req.body;
  try {
    await pool.query('INSERT INTO subjects(subject_name,teacher_id) VALUES(?,?)', [subject_name, teacher_id || null]);
    res.json({ message: 'Subject created' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: `Subject "${subject_name}" already exists` });
    }
    console.error('Create subject error:', error);
    res.status(500).json({ message: error.message });
  }
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

router.put('/subjects/:id', async (req, res) => {
  const { subject_name, teacher_id } = req.body;
  try {
    await pool.query('UPDATE subjects SET subject_name=?, teacher_id=? WHERE id=?', [subject_name, teacher_id || null, req.params.id]);
    res.json({ message: 'Subject updated' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: `Subject "${subject_name}" already exists` });
    }
    console.error('Update subject error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/subjects/:id', async (req, res) => {
  try {
    await pool.query("UPDATE subjects SET archived=1 WHERE id=?", [req.params.id]);
    res.json({ message: 'Subject archived' });
  } catch (error) {
    console.error('Archive subject error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/subjects/:id/restore', async (req, res) => {
  try {
    await pool.query("UPDATE subjects SET archived=0 WHERE id=?", [req.params.id]);
    res.json({ message: 'Subject restored' });
  } catch (error) {
    console.error('Restore subject error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Students CRUD
router.get('/students', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, sec.section_name
       FROM users u
       LEFT JOIN sections sec ON sec.id=u.section_id
       WHERE u.role='student' AND u.archived=0
       ORDER BY u.id DESC`
    );
    const [subjects] = await pool.query(
      `SELECT ss.student_id, s.subject_name
       FROM student_subjects ss
       JOIN subjects s ON s.id=ss.subject_id`
    );
    const studentsWithSubjects = rows.map(student => ({
      ...student,
      subjects: subjects.filter(sub => sub.student_id === student.id).map(sub => sub.subject_name).join(', ')
    }));
    res.json(studentsWithSubjects);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/students/archived', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.*, sec.section_name
       FROM users u
       LEFT JOIN sections sec ON sec.id=u.section_id
       WHERE u.role='student' AND u.archived=1
       ORDER BY u.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get archived students error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { first_name, last_name, middle_initial, email, password, usn, section_id, subject_ids } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'first_name, last_name, email, and password are required' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.query('START TRANSACTION');
      const [result] = await conn.query(
        'INSERT INTO users(first_name,last_name,middle_initial,usn,email,password,role,section_id) VALUES(?,?,?,?,?,?,?,?)',
        [first_name, last_name, middle_initial || null, usn || null, email, password, 'student', section_id || null]
      );
      if (Array.isArray(subject_ids) && subject_ids.length > 0) {
        const values = subject_ids.map(sid => [result.insertId, sid]);
        await conn.query('INSERT IGNORE INTO student_subjects(student_id,subject_id) VALUES ?', [values]);
      }
      await conn.query('COMMIT');
      res.json({ message: 'Student created', insertId: result.insertId });
    } catch (error) {
      await conn.query('ROLLBACK');
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email or USN already exists' });
    }
    console.error('Create student error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const { first_name, last_name, middle_initial, email, password, usn, section_id, subject_ids } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: 'first_name, last_name, and email are required' });
    }
    const conn = await pool.getConnection();
    try {
      await conn.query('START TRANSACTION');
      if (password) {
        await conn.query(
          'UPDATE users SET first_name=?, last_name=?, middle_initial=?, usn=?, email=?, password=?, section_id=? WHERE id=? AND role=?',
          [first_name, last_name, middle_initial || null, usn || null, email, password, section_id || null, req.params.id, 'student']
        );
      } else {
        await conn.query(
          'UPDATE users SET first_name=?, last_name=?, middle_initial=?, usn=?, email=?, section_id=? WHERE id=? AND role=?',
          [first_name, last_name, middle_initial || null, usn || null, email, section_id || null, req.params.id, 'student']
        );
      }
      await conn.query('DELETE FROM student_subjects WHERE student_id=?', [req.params.id]);
      if (Array.isArray(subject_ids) && subject_ids.length > 0) {
        const values = subject_ids.map(sid => [req.params.id, sid]);
        await conn.query('INSERT IGNORE INTO student_subjects(student_id,subject_id) VALUES ?', [values]);
      }
      await conn.query('COMMIT');
      res.json({ message: 'Student updated' });
    } catch (error) {
      await conn.query('ROLLBACK');
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email or USN already exists' });
    }
    console.error('Update student error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    await pool.query("UPDATE users SET archived=1 WHERE id=? AND role='student'", [req.params.id]);
    res.json({ message: 'Student archived' });
  } catch (error) {
    console.error('Archive student error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/students/:id/restore', async (req, res) => {
  try {
    await pool.query("UPDATE users SET archived=0 WHERE id=? AND role='student'", [req.params.id]);
    res.json({ message: 'Student restored' });
  } catch (error) {
    console.error('Restore student error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Teacher-Subject-Section Assignments CRUD
router.get('/assignments', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tsa.id, tsa.teacher_id, tsa.subject_id, tsa.section_id,
              CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
              s.subject_name, sec.section_name, c.course_code
       FROM teacher_subject_sections tsa
       JOIN users u ON u.id=tsa.teacher_id
       JOIN subjects s ON s.id=tsa.subject_id
       JOIN sections sec ON sec.id=tsa.section_id
       LEFT JOIN courses c ON c.id=sec.course_id
       ORDER BY tsa.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/assignments', async (req, res) => {
  const { teacher_id, subject_id, section_id } = req.body;
  if (!teacher_id || !subject_id || !section_id) {
    return res.status(400).json({ message: 'teacher_id, subject_id, and section_id are required' });
  }
  try {
    await pool.query(
      'INSERT IGNORE INTO teacher_subject_sections (teacher_id, subject_id, section_id) VALUES (?,?,?)',
      [teacher_id, subject_id, section_id]
    );
    res.json({ message: 'Assignment created' });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/assignments/:id', async (req, res) => {
  const { teacher_id, subject_id, section_id } = req.body;
  if (!teacher_id || !subject_id || !section_id) {
    return res.status(400).json({ message: 'teacher_id, subject_id, and section_id are required' });
  }
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      await connection.query('DELETE FROM teacher_subject_sections WHERE id=?', [req.params.id]);
      await connection.query(
        'INSERT IGNORE INTO teacher_subject_sections (teacher_id, subject_id, section_id) VALUES (?,?,?)',
        [teacher_id, subject_id, section_id]
      );
      await connection.commit();
      res.json({ message: 'Assignment updated' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/assignments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM teacher_subject_sections WHERE id=?', [req.params.id]);
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/teachers/:id/assignments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tsa.id, tsa.subject_id, tsa.section_id,
              s.subject_name, sec.section_name
       FROM teacher_subject_sections tsa
       JOIN subjects s ON s.id=tsa.subject_id
       JOIN sections sec ON sec.id=tsa.section_id
       WHERE tsa.teacher_id=?
       ORDER BY s.subject_name, sec.section_name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
