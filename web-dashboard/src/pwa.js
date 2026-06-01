const API = import.meta.env.VITE_API_URL || '/api';

export async function setupPWA(token) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('[PWA] Push not supported by this browser');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('[PWA] Service worker registered');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[PWA] Notification permission denied');
      return;
    }

    const vapidPublicKey = 'BGbrn5SebjqQRIgTmRUi10h0sEaiPcLn0U6pAu8ataj5-7Q1N66ebLNGna3pp8Q6qTQqZCwDARYTir_BP1e2Y3g';

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    await fetch(`${API}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subscription }),
    });

    console.log('[PWA] Push subscription saved');
  } catch (err) {
    console.error('[PWA] Setup error:', err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
