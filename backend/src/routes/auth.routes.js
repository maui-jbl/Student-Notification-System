const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];
    if (user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

    const sectionName = user.section_id
      ? (await pool.query('SELECT section_name FROM sections WHERE id=? LIMIT 1', [user.section_id]))[0][0]?.section_name || null
      : null;

    const fullName = [user.first_name, user.middle_initial ? user.middle_initial + '.' : '', user.last_name].filter(Boolean).join(' ');
    const token = jwt.sign(
      { id: user.id, role: user.role, name: fullName, section_id: user.section_id, section_name: sectionName },
      process.env.JWT_SECRET || 'super_secret_jwt_key',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: fullName,
        role: user.role,
        email: user.email,
        section_id: user.section_id,
        section_name: sectionName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
