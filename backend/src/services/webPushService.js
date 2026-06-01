const pool = require('../config/db');
const { webPush } = require('../config/webPush');

async function sendWebPushToStudents(subjectId, sectionId, title, body, data = {}) {
  const [rows] = await pool.query(
    `SELECT DISTINCT ps.endpoint, ps.p256dh, ps.auth
     FROM push_subscriptions ps
     JOIN student_subjects ss ON ss.student_id = ps.user_id
     JOIN users u ON u.id = ss.student_id
     WHERE ss.subject_id = ? AND u.section_id = ?`,
    [subjectId, sectionId]
  );

  if (!rows.length) return { success: 0, failed: 0 };

  let success = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      await webPush.sendNotification({
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      }, JSON.stringify({ title, body, ...data }), {
        TTL: 86400,
      });
      success++;
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        await pool.query(
          'DELETE FROM push_subscriptions WHERE endpoint=?',
          [row.endpoint]
        );
      }
      failed++;
    }
  }

  return { success, failed };
}

module.exports = { sendWebPushToStudents };
