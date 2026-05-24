const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

let firebaseEnabled = false;

try {
  const serviceAccountPath = path.join(process.cwd(), 'firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseEnabled = true;
    console.log('[FCM] Firebase initialized');
  } else {
    console.log('[FCM] firebase-service-account.json not found. FCM disabled.');
  }
} catch (error) {
  console.error('[FCM] Initialization failed:', error.message);
}

async function sendFcmToTokens(tokens, title, body, data = {}) {
  if (!firebaseEnabled || !tokens.length) return { successCount: 0, failureCount: 0 };

  const message = {
    tokens,
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
  };

  return admin.messaging().sendEachForMulticast(message);
}

module.exports = { sendFcmToTokens, firebaseEnabled };
