// routes/hostel_routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Add Hostel
router.post('/add-hostel', upload.single('image'), (req, res) => {
  const db = req.app.locals.db;
  const {
    owner_id, name, address, description,
    total_rooms, available_rooms, rent,
    facilities, hostel_gender
  } = req.body;
  const image_path = req.file ? req.file.filename : null;

  if (!owner_id || !name || !address || !description || !total_rooms || !available_rooms || !rent || !image_path || !hostel_gender)
    return res.status(400).json({ message: 'All fields including image are required' });

  let parsedFacilities;
  try {
    parsedFacilities = JSON.stringify(JSON.parse(facilities));
  } catch {
    return res.status(400).json({ message: 'Invalid facilities format' });
  }

  const approval_status = 'pending';
  const roundedRent = Math.round(parseFloat(rent) * 100) / 100;

  const query = `INSERT INTO hosteldetails (owner_id, name, address, description, total_rooms, available_rooms, approval_status, rent, image_path, facilities, hostel_gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [owner_id, name, address, description, total_rooms, available_rooms, approval_status, roundedRent, image_path, parsedFacilities, hostel_gender];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    res.json({ message: 'Hostel added successfully' });
  });
});

// Update Hostel
router.put('/update-hostel', (req, res) => {
  const db = req.app.locals.db;
  const { hostel_id, owner_id, name, total_rooms, available_rooms, rent, address, description, facilities } = req.body;

  if (!hostel_id || !owner_id || !name || !total_rooms || !available_rooms || !rent || !address || !description)
    return res.status(400).json({ message: 'Missing required fields' });

  const roundedRent = Math.round(parseFloat(rent) * 100) / 100;

  let facilitiesData;
  try {
    facilitiesData = typeof facilities === 'string' ? JSON.stringify(facilities.split(',').map(f => f.trim())) : JSON.stringify(facilities);
  } catch {
    return res.status(400).json({ message: 'Invalid facilities format' });
  }

  const query = `UPDATE hosteldetails SET name=?, total_rooms=?, available_rooms=?, rent=?, address=?, description=?, facilities=? WHERE hostel_id=? AND owner_id=?`;
  const values = [name, total_rooms, available_rooms, roundedRent, address, description, facilitiesData, hostel_id, owner_id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Hostel not found or no permission' });
    res.json({ message: 'Hostel updated successfully' });
  });
});

// Remove Hostel
router.delete('/remove-hostel', (req, res) => {
  const db = req.app.locals.db;
  const { hostel_id } = req.body;
  if (!hostel_id) return res.status(400).json({ message: 'Hostel ID is required' });

  db.query('DELETE FROM hosteldetails WHERE hostel_id = ?', [hostel_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Hostel not found' });
    res.json({ message: 'Hostel removed successfully' });
  });
});

// Approve / Reject / Fetch hostels
router.post('/approve-hostel/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('UPDATE hosteldetails SET approval_status = "approved" WHERE hostel_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    res.json({ message: 'Hostel approved successfully' });
  });
});

router.post('/reject-hostel/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('UPDATE hosteldetails SET approval_status = "rejected" WHERE hostel_id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    res.json({ message: 'Hostel rejected successfully' });
  });
});

router.get('/non-approved-hostels', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM hosteldetails WHERE approval_status = "not approved"', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// View all hostels
router.get('/all-hostels', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM hosteldetails', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    res.json(rows);
  });
});

// View owner-specific hostels
router.get('/owner-hostels/:ownerId', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM hosteldetails WHERE owner_id = ?', [req.params.ownerId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Internal Server Error' });
    res.json(rows);
  });
});

// Book hostel
router.post('/book/:hostelId', (req, res) => {
  const db = req.app.locals.db;
  const { student_id, rent, room_number, booking_date } = req.body;
  db.query('SELECT owner_id FROM hosteldetails WHERE hostel_id = ?', [req.params.hostelId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Hostel not found' });
    const hostelOwnerId = results[0].owner_id;

    const sql = 'INSERT INTO bookings (student_id, hostel_id, rent, room_number, booking_date, hostel_owner_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [student_id, req.params.hostelId, rent, room_number, booking_date, hostelOwnerId], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ booking_id: result.insertId });
    });
  });
});

// Dashboard stats: owner
router.get('/owner-stats/:ownerId', (req, res) => {
  const db = req.app.locals.db;
  const ownerId = req.params.ownerId;

  const queries = {
    totalHostels: 'SELECT COUNT(*) as count FROM hosteldetails WHERE owner_id = ?',
    approvedHostels: 'SELECT COUNT(*) as count FROM hosteldetails WHERE owner_id = ? AND approval_status = "approved"',
    availableRooms: 'SELECT SUM(available_rooms) as total FROM hosteldetails WHERE owner_id = ?',
    totalStudents: 'SELECT COUNT(DISTINCT student_id) as count FROM bookings WHERE hostel_owner_id = ?',
    pendingBookings: 'SELECT COUNT(*) as count FROM bookings WHERE hostel_owner_id = ? AND status = "pending"',
    totalRevenue: 'SELECT SUM(rent) as total FROM bookings WHERE hostel_owner_id = ? AND status = "approved"'
  };

  const results = {};
  const keys = Object.keys(queries);
  let completed = 0;

  keys.forEach((key) => {
    db.query(queries[key], [ownerId], (err, rows) => {
      if (err) return res.status(500).json({ message: `Error fetching ${key}` });
      results[key] = rows[0].count || rows[0].total || 0;
      if (++completed === keys.length) res.json(results);
    });
  });
});

// Dashboard stats: student
router.get('/student-stats/:id', (req, res) => {
  const db = req.app.locals.db;
  const studentId = req.params.id;

  const totalQuery = 'SELECT COUNT(*) as total FROM bookings WHERE student_id = ?';
  const activeQuery = 'SELECT COUNT(*) as active FROM bookings WHERE student_id = ? AND booking_date <= CURDATE() AND (end_date IS NULL OR end_date >= CURDATE())';

  db.query(totalQuery, [studentId], (err, total) => {
    if (err) return res.status(500).json({ message: 'Error fetching total bookings' });
    db.query(activeQuery, [studentId], (err, active) => {
      if (err) return res.status(500).json({ message: 'Error fetching active bookings' });
      res.json({ totalBookings: total[0].total, activeBookings: active[0].active });
    });
  });
});

module.exports = router;
