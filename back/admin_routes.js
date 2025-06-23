// routes/admin_routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const saltRounds = 10;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'help.hostelhub@gmail.com',
    pass: 'slkd hcnv pgns cxur'
  }
});

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
}

// Admin registration
router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, password, phone_number, position } = req.body;
  if (!name || !email || !password || !phone_number || !position)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const hashedPassword = await hashPassword(password);
    const sql = 'INSERT INTO collegeadministration (name, email, password, phone_number, position) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, phone_number, position];
    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      res.json({ message: 'Admin registered successfully' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error hashing password' });
  }
});

// Admin login
router.post('/login', (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  db.query('SELECT * FROM collegeadministration WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const admin = results[0];
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err || !isMatch)
        return res.status(401).json({ message: 'Invalid email or password' });

      req.session.user = { id: admin.admin_id, email: admin.email };
      res.json({ message: 'Login successful', admin_id: admin.admin_id });
    });
  });
});

// Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// Forgot password
router.post('/forgot-password', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  db.query('SELECT * FROM collegeadministration WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    db.query('UPDATE collegeadministration SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, resetTokenExpiry, email], (err) => {
        if (err) return res.status(500).json({ message: 'Token save failed' });

        const resetUrl = `http://localhost:3000/reset-password-admin/${resetToken}`;
        const mailOptions = {
          from: 'help.hostelhub@gmail.com',
          to: email,
          subject: 'Password Reset - HostelHub (Admin)',
          html: `<p>Click <a href='${resetUrl}'>here</a> to reset your password. Link expires in 1 hour.</p>`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) return res.status(500).json({ message: 'Failed to send reset email' });
          res.json({ message: 'Reset email sent' });
        });
      });
  });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const db = req.app.locals.db;
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token and new password are required' });

  db.query('SELECT * FROM collegeadministration WHERE reset_token = ? AND reset_token_expiry > NOW()', [token], async (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ message: 'Invalid or expired token' });

    try {
      const hashedPassword = await hashPassword(newPassword);
      db.query('UPDATE collegeadministration SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
        [hashedPassword, token], (err) => {
          if (err) return res.status(500).json({ message: 'Failed to update password' });
          res.json({ message: 'Password reset successful' });
        });
    } catch (err) {
      res.status(500).json({ message: 'Error hashing password' });
    }
  });
});

// Get admin profile
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const adminId = req.params.id;
  db.query('SELECT admin_id, name, email, phone_number, position FROM collegeadministration WHERE admin_id = ?', [adminId], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Admin not found' });
    res.json(results[0]);
  });
});

// Update admin profile
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { email, phone_number } = req.body;
  const adminId = req.params.id;

  if (!email || !phone_number)
    return res.status(400).json({ message: 'Email and phone are required' });

  db.query('UPDATE collegeadministration SET email = ?, phone_number = ? WHERE admin_id = ?',
    [email, phone_number, adminId], (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to update profile' });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Admin not found' });
      res.json({ message: 'Profile updated successfully' });
    });
});

module.exports = router;
