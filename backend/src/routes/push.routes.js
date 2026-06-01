const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return res.status(400).json({ message: 'Invalid subscription object' });
    }

    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE endpoint=VALUES(endpoint), p256dh=VALUES(p256dh), auth=VALUES(auth)`,
      [req.user.id, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth]
    );

    res.json({ message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('[Push Subscribe]', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/unsubscribe', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM push_subscriptions WHERE user_id=?', [req.user.id]);
    res.json({ message: 'Unsubscribed from push notifications' });
  } catch (error) {
    console.error('[Push Unsubscribe]', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
