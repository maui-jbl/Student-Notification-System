const cron = require('node-cron');
const pool = require('../config/db');
const { dispatchNotification } = require('../services/notificationService');

function startScheduler() {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM notifications WHERE status='scheduled' AND scheduled_at <= NOW()"
      );
      for (const n of rows) {
        await dispatchNotification(n);
        await pool.query("UPDATE notifications SET status='sent' WHERE id=?", [n.id]);
      }
    } catch (e) {
      console.error('[Scheduler] Error:', e.message);
    }
  });
}

module.exports = { startScheduler };
