// routes/owner_routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const saltRounds = 10;
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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

// Owner Registration
router.post('/register', async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, password, phone_number, address } = req.body;
  if (!name || !email || !password || !phone_number || !address)
    return res.status(400).json({ message: 'All fields are required' });

  try {
    const hashedPassword = await hashPassword(password);
    const sql = 'INSERT INTO hostelowner (name, email, password, phone_number, address) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, phone_number, address], (err) => {
      if (err) return res.status(500).json({ message: 'Internal Server Error' });
      res.json({ message: 'Registration successful' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Password hashing error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  db.query('SELECT * FROM hostelowner WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const owner = results[0];
    bcrypt.compare(password, owner.password, (err, isMatch) => {
      if (err || !isMatch)
        return res.status(401).json({ message: 'Invalid email or password' });

      req.session.user = { id: owner.owner_id, email: owner.email };
      res.json({ message: 'Login successful', owner_id: owner.owner_id });
    });
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out' });
  });
});

// Forgot Password
router.post('/forgot-password', (req, res) => {
  const db = req.app.locals.db;
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  db.query('SELECT * FROM hostelowner WHERE email = ?', [email], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Email not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    db.query('UPDATE hostelowner SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [resetToken, resetTokenExpiry, email], (err) => {
        if (err) return res.status(500).json({ message: 'Token save error' });

        const resetUrl = `http://localhost:3000/reset-password-owner/${resetToken}`;
        const mailOptions = {
          from: 'help.hostelhub@gmail.com',
          to: email,
          subject: 'Password Reset - HostelHub',
          html: `<p>Click <a href='${resetUrl}'>here</a> to reset your password. Link expires in 1 hour.</p>`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) return res.status(500).json({ message: 'Failed to send email' });
          res.json({ message: 'Reset email sent' });
        });
      });
  });
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const db = req.app.locals.db;
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: 'Token and new password required' });

  db.query('SELECT * FROM hostelowner WHERE reset_token = ? AND reset_token_expiry > NOW()', [token], async (err, results) => {
    if (err || results.length === 0)
      return res.status(400).json({ message: 'Invalid or expired token' });

    try {
      const hashedPassword = await hashPassword(newPassword);
      db.query('UPDATE hostelowner SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?',
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

// Owner authentication middleware
function isOwner(req, res, next) {
  if (req.session && req.session.user && req.session.user.id) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized' });
}

// Protect all routes below this line
router.use(isOwner);

// Get owner profile
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const ownerId = req.params.id;
  db.query('SELECT owner_id, name, email, phone_number, address FROM hostelowner WHERE owner_id = ?', [ownerId], (err, results) => {
    if (err || results.length === 0)
      return res.status(404).json({ message: 'Owner not found' });
    res.json(results[0]);
  });
});

// Update owner profile
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const ownerId = req.params.id;
  const { email, phone_number } = req.body;
  if (!email || !phone_number)
    return res.status(400).json({ message: 'Email and phone are required' });

  db.query('UPDATE hostelowner SET email = ?, phone_number = ? WHERE owner_id = ?', [email, phone_number, ownerId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to update profile' });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Owner not found' });
    res.json({ message: 'Profile updated successfully' });
  });
});

// Get all hostels for a specific owner
router.get('/hostels/:ownerId', (req, res) => {
  const db = req.app.locals.db;
  const { ownerId } = req.params;

  const query = 'SELECT * FROM hosteldetails WHERE owner_id = ?';

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching hostels by owner:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Get all bookings for a specific owner
router.get('/bookings/:ownerId', (req, res) => {
  const db = req.app.locals.db;
  const { ownerId } = req.params;

  const query = `
    SELECT 
      b.booking_id,
      b.booking_date,
      b.status,
      s.name as student_name,
      s.email as student_email,
      h.name as hostel_name
    FROM bookings b
    JOIN student s ON b.student_id = s.student_id
    JOIN hosteldetails h ON b.hostel_id = h.hostel_id
    WHERE h.owner_id = ?
  `;

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching bookings by owner:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Session check
router.get('/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

module.exports = router;
