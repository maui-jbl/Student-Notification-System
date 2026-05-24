const mqtt = require('mqtt');

const brokerUrl = process.env.MQTT_URL || 'mqtt://127.0.0.1:1884';
console.log('Testing MQTT connection to:', brokerUrl);

const client = mqtt.connect(brokerUrl, { reconnectPeriod: 1000 });

let connected = false;

client.on('connect', () => {
  connected = true;
  console.log('Connected to MQTT broker');
  client.end();
});

client.on('error', (err) => {
  console.error('MQTT connection error:', err.message);
});

client.on('close', () => {
  console.log('Connection closed');
});

setTimeout(() => {
  if (!connected) {
    console.log('Connection timed out - check if broker is running');
    client.end();
    process.exit(1);
  }
}, 5000);