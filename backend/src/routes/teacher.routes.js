const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { dispatchNotification } = require('../services/notificationService');

const router = express.Router();
router.use(authenticate, authorize('teacher', 'admin'));

router.get('/my-subjects', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT s.*, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
     FROM subjects s
     JOIN teacher_subject_sections tsa ON tsa.subject_id=s.id
     LEFT JOIN users u ON u.id=tsa.teacher_id
     WHERE tsa.teacher_id=? AND s.archived=0
     ORDER BY s.subject_name`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/all-subjects', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.*, CONCAT(u.first_name, ' ', u.last_name) AS teacher_name
     FROM subjects s
     LEFT JOIN users u ON s.teacher_id=u.id
     WHERE s.archived=0
     ORDER BY s.id DESC`
  );
  res.json(rows);
});

router.get('/sections', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT sec.*, c.course_code FROM sections sec
     JOIN teacher_subject_sections tsa ON tsa.section_id=sec.id
     LEFT JOIN courses c ON c.id=sec.course_id
     WHERE tsa.teacher_id=? AND sec.archived=0
     ORDER BY sec.section_name`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/assigned-combos', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT tsa.subject_id, tsa.section_id, s.subject_name, sec.section_name
     FROM teacher_subject_sections tsa
     JOIN subjects s ON s.id=tsa.subject_id
     JOIN sections sec ON sec.id=tsa.section_id
     WHERE tsa.teacher_id=? AND s.archived=0 AND sec.archived=0
     ORDER BY s.subject_name, sec.section_name`,
    [req.user.id]
  );
  res.json(rows);
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, message, subject_id, section_id, priority = 'Normal', scheduled_at = null } = req.body;

    const [combo] = await pool.query(
      `SELECT id FROM teacher_subject_sections WHERE teacher_id=? AND subject_id=? AND section_id=?`,
      [req.user.id, subject_id, section_id]
    );
    if (!combo.length) {
      return res.status(403).json({ message: 'You are not assigned to teach this subject to this section' });
    }

    const status = scheduled_at ? 'scheduled' : 'pending';
    const [result] = await pool.query(
      `INSERT INTO notifications(title,message,sender_id,subject_id,section_id,priority,scheduled_at,status)
       VALUES(?,?,?,?,?,?,?,?)`,
      [title, message, req.user.id, subject_id, section_id, priority, scheduled_at, status]
    );

    const [rows] = await pool.query('SELECT * FROM notifications WHERE id=?', [result.insertId]);
    const notification = rows[0];

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

router.put('/notifications/:id/edit', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM notifications WHERE id=? AND sender_id=?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Notification not found' });
    if (rows[0].status !== 'pending' && rows[0].status !== 'scheduled') {
      return res.status(400).json({ message: 'Only pending or scheduled notifications can be edited' });
    }

    const { title, message, priority, scheduled_at } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    await pool.query(
      `UPDATE notifications SET title=?, message=?, priority=?, scheduled_at=? WHERE id=?`,
      [title, message, priority || 'Normal', scheduled_at || null, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM notifications WHERE id=?', [req.params.id]);
    res.json({ message: 'Notification updated', notification: updated[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/notifications/:id/cancel', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM notifications WHERE id=? AND sender_id=?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Notification not found' });
    if (rows[0].status === 'sent' || rows[0].status === 'delivered' || rows[0].status === 'cancelled') {
      return res.status(400).json({ message: `Cannot cancel a ${rows[0].status} notification` });
    }
    await pool.query("UPDATE notifications SET status='cancelled' WHERE id=?", [req.params.id]);
    res.json({ message: 'Notification cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/notifications/:id/complete', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE id=? AND sender_id=?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Notification not found' });
    if (rows[0].status === 'sent' || rows[0].status === 'delivered' || rows[0].status === 'cancelled') {
      return res.status(400).json({ message: `Cannot complete a ${rows[0].status} notification` });
    }
    await pool.query("UPDATE notifications SET status='sent' WHERE id=?", [req.params.id]);
    rows[0].status = 'sent';
    await dispatchNotification(rows[0]);
    res.json({ message: 'Notification completed and sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM notifications WHERE id=? AND sender_id=?`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Notification not found' });
    if (rows[0].status !== 'cancelled') {
      return res.status(400).json({ message: 'Only cancelled notifications can be deleted' });
    }
    await pool.query('DELETE FROM notifications WHERE id=?', [req.params.id]);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
