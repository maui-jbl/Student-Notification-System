const { spawn } = require('child_process');
const mqtt = require('mqtt');
const path = require('path');

// Start server
const server = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit'
});

// Wait for server to start, then test
setTimeout(() => {
  const client = mqtt.connect('mqtt://127.0.0.1:1884', { reconnectPeriod: 1000 });
  
  client.on('connect', () => {
    console.log('SUCCESS: MQTT client connected!');
    client.end();
    process.exit(0);
  });
  
  client.on('error', (err) => {
    console.log('MQTT error:', err.message);
  });
  
  setTimeout(() => {
    console.log('Test timed out');
    client.end();
    process.exit(1);
  }, 5000);
}, 2000);

server.on('close', (code) => {
  process.exit(code);
});