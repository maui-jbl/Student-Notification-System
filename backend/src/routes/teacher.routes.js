const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { dispatchNotification } = require('../services/notificationService');

const router = express.Router();
router.use(authenticate, authorize('teacher', 'admin'));

router.get('/my-subjects', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM subjects WHERE teacher_id = ? ORDER BY id DESC', [req.user.id]);
  res.json(rows);
});

router.get('/sections', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM sections ORDER BY section_name');
  res.json(rows);
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, message, subject_id, section_id, priority = 'Normal', scheduled_at = null } = req.body;
    const [result] = await pool.query(
      `INSERT INTO notifications(title,message,sender_id,subject_id,section_id,priority,scheduled_at,status)
       VALUES(?,?,?,?,?,?,?,?)`,
      [title, message, req.user.id, subject_id, section_id, priority, scheduled_at, scheduled_at ? 'scheduled' : 'sent']
    );

    const [rows] = await pool.query('SELECT * FROM notifications WHERE id=?', [result.insertId]);
    const notification = rows[0];

    if (!scheduled_at) {
      await dispatchNotification(notification);
    }

    res.json({ message: 'Notification created', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/notifications/history', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT n.*, s.subject_name, sec.section_name
     FROM notifications n
     JOIN subjects s ON s.id=n.subject_id
     JOIN sections sec ON sec.id=n.section_id
     WHERE n.sender_id=?
     ORDER BY n.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

module.exports = router;
