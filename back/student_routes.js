// routes/student_routes.js
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

// Register
router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, password, date_of_birth, phone_number, gender, address } = req.body;

  if (!name || !email || !password || !date_of_birth || !phone_number || !gender || !address)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const hashedPassword = await hashPassword(password);
    const sql = 'INSERT INTO student (name, email, password, date_of_birth, phone_number, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, date_of_birth, phone_number, gender, address];

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      res.json({ message: 'Registration successful' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Error hashing password' });
  }
});

// Login
router.post('/login', (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  db.query('SELECT * FROM student WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch)
        return res.status(401).json({ message: 'Invalid email or password' });

      req.session.user = { id: user.student_id, email: user.email };
      res.json({ message: 'Login successful', student_id: user.student_id });
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Could not log out.' });
    res.json({ message: 'Logged out.' });
  });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  db.query('SELECT * FROM student WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    db.query(
      'UPDATE student SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, resetTokenExpiry, email],
      (err) => {
        if (err) return res.status(500).json({ message: 'Failed to set reset token' });

        const resetUrl = `http://localhost:3000/reset-password-student/${resetToken}`;
        const mailOptions = {
          from: 'help.hostelhub@gmail.com',
          to: email,
          subject: 'Password Reset - HostelHub',
          html: `<p>Click <a href='${resetUrl}'>here</a> to reset your password. Link expires in 1 hour.</p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) return res.status(500).json({ message: 'Failed to send reset email' });
          res.json({ message: 'Password reset email sent' });
        });
      }
    );
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const db = req.app.locals.db;
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token and new password are required' });

  db.query('SELECT * FROM student WHERE reset_token = ? AND reset_token_expiry > NOW()', [token], async (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ message: 'Invalid or expired reset token' });

    try {
      const hashedPassword = await hashPassword(newPassword);
      db.query('UPDATE student SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
        [hashedPassword, token],
        (err) => {
          if (err) return res.status(500).json({ message: 'Failed to update password' });
          res.json({ message: 'Password reset successful' });
        });
    } catch (err) {
      res.status(500).json({ message: 'Error hashing new password' });
    }
  });
});

// Student Profile
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const studentId = req.params.id;
  db.query('SELECT student_id, name, email, phone_number, gender, address FROM student WHERE student_id = ?', [studentId], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Student not found' });
    res.json(results[0]);
  });
});

// Update Student Profile
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { email, phone_number } = req.body;
  const studentId = req.params.id;

  if (!email || !phone_number)
    return res.status(400).json({ message: 'Email and phone number are required.' });

  db.query('UPDATE student SET email = ?, phone_number = ? WHERE student_id = ?', [email, phone_number, studentId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Profile updated successfully' });
  });
});

module.exports = router;
