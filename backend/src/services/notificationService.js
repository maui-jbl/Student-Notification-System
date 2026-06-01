const pool = require('../config/db');
const { publishNotification } = require('../config/mqtt');
const { sendWebPushToStudents } = require('./webPushService');

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

  try {
    await publishNotification(topic, mqttPayload);
  } catch (mqttErr) {
    console.error('[dispatchNotification] MQTT publish failed:', mqttErr.message);
  }

  const wpResult = await sendWebPushToStudents(
    notification.subject_id,
    notification.section_id,
    notification.title,
    notification.message,
    { notificationId: String(notification.id), topic }
  );
  if (wpResult.success > 0 || wpResult.failed > 0) {
    console.log(`[WebPush] ${wpResult.success} ok, ${wpResult.failed} failed`);
  }
}

module.exports = { dispatchNotification, topicOf };
