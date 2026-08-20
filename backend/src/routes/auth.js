const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// Public route: Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route: Verify token
router.get('/verify', authenticateToken, (req, res) => {
  // If middleware passes, token is valid
  res.json({ valid: true, user: req.user });
});

// Protected route: Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    // Get current user from DB
    const [rows] = await db.query('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    const admin = rows[0];

    // Check current password
    const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    await db.query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
