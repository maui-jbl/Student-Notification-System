const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  detached: true,
  stdio: ['ignore', 'inherit', 'inherit']
});

server.unref();

console.log('Server PID:', server.pid);

setTimeout(() => {
  const mqtt = require('mqtt');
  const client = mqtt.connect('mqtt://127.0.0.1:1884', { reconnectPeriod: 500 });
  
  client.on('connect', () => {
    console.log('SUCCESS: MQTT client connected!');
    client.end();
    process.exit(0);
  });
  
  client.on('error', (err) => {
    console.log('MQTT error:', err.message);
  });
}, 2000);

setTimeout(() => {
  console.log('Test timed out');
  process.exit(1);
}, 6000);