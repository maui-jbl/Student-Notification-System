const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { mqttClient } = require('./config/mqtt');
const { startScheduler } = require('./jobs/scheduler');

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const teacherRoutes = require('./routes/teacher.routes');
const studentRoutes = require('./routes/student.routes');
const pushRoutes = require('./routes/push.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    const mqttConnected = mqttClient && mqttClient.connected;
    res.json({ status: 'ok', mqttConnected: mqttConnected || false });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/push', pushRoutes);

startScheduler();

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
