const webPush = require('web-push');

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL || 'admin@school.com';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublicKey, vapidPrivateKey);
  console.log('[WebPush] VAPID configured');
} else {
  console.warn('[WebPush] VAPID keys missing — web push disabled');
}

module.exports = { webPush };
