const pool = require('../config/db');
const { publishNotification } = require('../config/mqtt');
const { sendFcmToTokens } = require('../config/firebase');

function topicOf(sectionName, subjectName) {
  return `school/${sectionName}/${subjectName}`;
}

async function dispatchNotification(notification) {
  const [sectionRows] = await pool.query('SELECT section_name FROM sections WHERE id = ?', [notification.section_id]);
  const [subjectRows] = await pool.query('SELECT subject_name FROM subjects WHERE id = ?', [notification.subject_id]);
  if (!sectionRows.length || !subjectRows.length) return;

  const sectionName = sectionRows[0].section_name;
  const subjectName = subjectRows[0].subject_name;
  const topic = topicOf(sectionName, subjectName);

  const mqttPayload = {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    priority: notification.priority,
    section: sectionName,
    subject: subjectName,
    created_at: notification.created_at,
  };

  await publishNotification(topic, mqttPayload);

  const [tokenRows] = await pool.query(
    `SELECT DISTINCT ft.fcm_token
     FROM fcm_tokens ft
     JOIN student_subjects ss ON ss.student_id = ft.student_id
     JOIN users u ON u.id = ss.student_id
     WHERE ss.subject_id = ? AND u.section_id = ?`,
    [notification.subject_id, notification.section_id]
  );

  const tokens = tokenRows.map((r) => r.fcm_token).filter(Boolean);
  await sendFcmToTokens(tokens, notification.title, notification.message, {
    notificationId: notification.id,
    topic,
  });
}

module.exports = { dispatchNotification, topicOf };
