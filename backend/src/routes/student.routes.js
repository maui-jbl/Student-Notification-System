const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, authorize('student'));

router.get('/subjects', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.* FROM student_subjects ss
     JOIN subjects s ON s.id=ss.subject_id
     WHERE ss.student_id=?`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/notifications', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT n.*, sub.subject_name, sec.section_name,
      CASE WHEN nr.id IS NULL THEN 0 ELSE 1 END AS is_read
     FROM notifications n
     JOIN subjects sub ON sub.id=n.subject_id
     JOIN sections sec ON sec.id=n.section_id
     JOIN student_subjects ss ON ss.subject_id=n.subject_id
     LEFT JOIN notification_reads nr ON nr.notification_id=n.id AND nr.student_id=?
     WHERE ss.student_id=? AND (n.status='sent' OR n.status='delivered')
     ORDER BY n.created_at DESC`,
    [req.user.id, req.user.id]
  );
  res.json(rows);
});

router.post('/notifications/:id/read', async (req, res) => {
  await pool.query(
    'INSERT IGNORE INTO notification_reads(notification_id,student_id,read_at) VALUES(?,?,NOW())',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Marked as read' });
});

router.post('/fcm-token', async (req, res) => {
  const { fcm_token } = req.body;
  if (!fcm_token) return res.status(400).json({ message: 'fcm_token is required' });

  await pool.query(
    `INSERT INTO fcm_tokens(student_id,fcm_token)
     VALUES(?,?)
     ON DUPLICATE KEY UPDATE fcm_token=VALUES(fcm_token), updated_at=NOW()`,
    [req.user.id, fcm_token]
  );
  res.json({ message: 'Token saved' });
});

module.exports = router;
