const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/teachers', async (_req, res) => {
  const [rows] = await pool.query("SELECT id,name,email FROM users WHERE role='teacher'");
  res.json(rows);
});

router.post('/teachers', async (req, res) => {
  const { name, email, password } = req.body;
  await pool.query('INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)', [name, email, password, 'teacher']);
  res.json({ message: 'Teacher created' });
});

router.get('/sections', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM sections ORDER BY id DESC');
  res.json(rows);
});

router.post('/sections', async (req, res) => {
  await pool.query('INSERT INTO sections(section_name) VALUES(?)', [req.body.section_name]);
  res.json({ message: 'Section created' });
});

router.get('/subjects', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, u.name AS teacher_name
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

module.exports = router;
