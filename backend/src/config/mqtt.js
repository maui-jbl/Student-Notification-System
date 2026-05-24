const mqtt = require('mqtt');
const { Aedes } = require('aedes');
const aedes = new Aedes();
const net = require('net');
const dotenv = require('dotenv');

dotenv.config();

const brokerPort = Number(process.env.MQTT_PORT || 1884);
const mqttHost = process.env.MQTT_HOST || '0.0.0.0';
const options = {};

if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

const brokerUrl = process.env.MQTT_BROKER_URL || `mqtt://127.0.0.1:${brokerPort}`;

// const server = net.createServer(aedes.handle);
// server.listen(brokerPort, mqttHost, () => {
//   console.log(`[MQTT] Broker listening on ${mqttHost}:${brokerPort}`);
// });

// server.on('error', (err) => {
//   console.error('[MQTT] Server error:', err.message);
// });

let mqttClient;
let reconnectTimer = null;

function connectClient() {
  mqttClient = mqtt.connect(brokerUrl, { ...options, reconnectPeriod: 2000 });

  mqttClient.on('connect', () => {
    console.log('[MQTT] Connected to broker:', brokerUrl);
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  mqttClient.on('error', (error) => {
    console.error('[MQTT] Error:', error.message);
  });
}

setTimeout(connectClient, 100);

aedes.on('client', (client) => {
  console.log('[MQTT] Client connected:', client.id);
});

aedes.on('clientDisconnect', (client) => {
  console.log('[MQTT] Client disconnected:', client.id);
});

function publishNotification(topic, payload) {
  return new Promise((resolve, reject) => {
    if (!mqttClient || !mqttClient.connected) {
      return reject(new Error('MQTT client not connected'));
    }
    mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

module.exports = { mqttClient, publishNotification };
