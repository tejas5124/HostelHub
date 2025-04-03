const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// ✅ MySQL Database Connection (hoshub)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "hoshub",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL (hoshub)");
});

// ✅ Helper Function: Get Table Name by Role
const getTableByRole = (role) => {
  switch (role) {
    case "student":
      return "students";
    case "hostel_owner":
      return "hostel_owners";
    case "college_admin":
      return "admins";
    default:
      throw new Error("Invalid role");
  }
};

// ✅ Configure Storage for File Uploads
const hostelStorage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ✅ Configure Storage for Room Images
const roomStorage = multer.diskStorage({
  destination: "./uploads/rooms/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadHostel = multer({ storage: hostelStorage });
const uploadRoom = multer({ storage: roomStorage });

/* ==========================
 ✅ AUTH ROUTES (Register & Login)
========================== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone_number, password, role } = req.body;

    if (!name || !email || !phone_number || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const tableName = getTableByRole(role);

    const [existingUser] = await db
      .promise()
      .query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .promise()
      .query(
        `INSERT INTO ${tableName} (name, email, phone_number, password) VALUES (?, ?, ?, ?)`,
        [name, email, phone_number, hashedPassword]
      );

    return res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const roles = ["student", "hostel_owner", "college_admin"];
    let user = null;
    let userRole = "";

    for (const role of roles) {
      const tableName = getTableByRole(role);
      const [result] = await db.promise().query(
        `SELECT * FROM ${tableName} WHERE email = ?`,
        [email]
      );
      if (result.length) {
        user = result[0];
        userRole = role;
        break;
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: userRole,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});



app.post("/hostels", uploadHostel.single("image"), (req, res) => {
  const { owner_id, hostel_name, location, total_rooms, available_rooms, rent_per_month, amenities, gender_specific, contact_number } = req.body;
  
  if (!owner_id) return res.status(400).json({ error: "Owner ID is required!" });

  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    INSERT INTO hosteldetails (owner_id, hostel_name, location, total_rooms, available_rooms, rent_per_month, amenities, gender_specific, contact_number, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [owner_id, hostel_name, location, total_rooms, available_rooms, rent_per_month, amenities, gender_specific, contact_number, imageUrl], (err, result) => {
    if (err) return res.status(500).json({ error: "Error adding hostel" });

    res.status(201).json({ 
      message: "✅ Hostel added successfully!", 
      hostel_id: result.insertId,
      image_url: imageUrl 
    });
  });
});


app.put("/hostels/:id", uploadHostel.single("image"), (req, res) => {
  const { id } = req.params;
  const {
    hostel_name,
    location,
    total_rooms,
    available_rooms,
    rent_per_month,
    amenities,
    gender_specific,
    contact_number
  } = req.body;

  let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  // Update Query (With or Without Image)
  let query = `
    UPDATE hosteldetails 
    SET hostel_name=?, location=?, total_rooms=?, available_rooms=?, rent_per_month=?, amenities=?, gender_specific=?, contact_number=?
  `;

  let values = [hostel_name, location, total_rooms, available_rooms, rent_per_month, amenities, gender_specific, contact_number];

  if (imageUrl) {
    query += ", image_url=?";
    values.push(imageUrl);
  }

  query += " WHERE id=?";
  values.push(id);

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ Error updating hostel:", err);
      return res.status(500).json({ error: "Error updating hostel" });
    }
    res.json({ message: "✅ Hostel updated successfully!" });
  });
});

app.get("/hostels/admin", async (req, res) => {
  try {
    const query = `
      SELECT h.*, 
             o.name AS owner_name, 
             o.email AS owner_email, 
             o.phone_number AS owner_phone  
      FROM hosteldetails h
      JOIN hostel_owners o ON h.owner_id = o.id
    `;
    
    const [hostels] = await db.promise().query(query);
    res.json(hostels);
  } catch (error) {
    console.error("❌ Error fetching hostels:", error.message); // Log error details
    res.status(500).json({ error: "Failed to fetch hostels", details: error.message });
  }
});

app.put("/hostels/update-status/:id", async (req, res) => {
  const { id } = req.params;
  const { approval_status } = req.body;

  // Validate input
  if (!approval_status || !["Pending", "Approved", "Rejected"].includes(approval_status)) {
    return res.status(400).json({ error: "Invalid approval status!" });
  }

  try {
    // Update hostel approval status in database
    const [result] = await db.promise().execute(
      "UPDATE hosteldetails SET approval_status = ? WHERE id = ?",
      [approval_status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Hostel not found!" });
    }

    res.json({ success: true, message: `Hostel status updated to ${approval_status}` });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database update failed!" });
  }
});

app.get("/hostels/approved-rejected", async (req, res) => {
  try {
    const [approved] = await db.promise().query(
      "SELECT * FROM hosteldetails WHERE approval_status = 'approved'"
    );

    const [rejected] = await db.promise().query(
      "SELECT * FROM hosteldetails WHERE approval_status = 'rejected'"
    );

    const [pending] = await db.promise().query(
      "SELECT * FROM hosteldetails WHERE approval_status = 'pending'"
    );

    // console.log("✅ Approved:", approved.length);
    // console.log("❌ Rejected:", rejected.length);
    // console.log("⏳ Pending:", pending.length);

    res.json({ approved, rejected, pending });
  } catch (error) {
    console.error("❌ Error fetching approved/rejected/pending hostels:", error.message);
    res.status(500).json({ error: "Failed to fetch hostels", details: error.message });
  }
});

app.get("/hostels", (req, res) => {
  const { owner_id } = req.query;

  if (!owner_id) return res.status(400).json({ error: "Owner ID is required" });

  db.query("SELECT * FROM hosteldetails WHERE owner_id = ?", [owner_id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching hostels" });

    res.json(results);
  });
});

app.get('/api/hostels', async (req, res) => {
  try {
      const query = 'SELECT * FROM hosteldetails';
      const [rows] = await db.promise().query(query);
      res.json(rows);
  } catch (error) {
      console.error('Error fetching hostels:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/hostels/status/:status', async (req, res) => {
  try {
      const { status } = req.params;
      const query = 'SELECT * FROM hosteldetails WHERE approval_status = ?';
      const [rows] = await db.promise().query(query, [status]);

      res.json(rows);
  } catch (error) {
      console.error('Error fetching hostels by status:', error);
      res.status(500).json({ message: 'Server error' });
  }
});
app.get("/api/hostels/available", async (req, res) => {
  try {
    const query = `
      SELECT h.*, 
             o.name AS owner_name, 
             o.email AS owner_email, 
             o.phone_number AS owner_phone  
      FROM hosteldetails h
      JOIN hostel_owners o ON h.owner_id = o.id
      WHERE h.available_rooms > 0  -- Only available hostels
    `;
    
    const [hostels] = await db.promise().query(query);
    res.json(hostels);
  } catch (error) {
    console.error("❌ Error fetching available hostels:", error.message);
    res.status(500).json({ error: "Failed to fetch available hostels", details: error.message });
  }
});

app.get("/api/rooms/:hostel_id", async (req, res) => {
  const { hostel_id } = req.params;
  try {
      const sql = "SELECT * FROM rooms WHERE hostel_id = ?";
      const [rooms] = await db.promise().query(sql, [parseInt(hostel_id)]);
      
      if (!rooms.length) {
        return res.status(404).json({ message: "No rooms found for this hostel." });
      }

      res.json({ rooms });
  } catch (err) {
      console.error("❌ Error fetching rooms:", err);
      res.status(500).json({ error: "Failed to fetch rooms", details: err.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { student_id, hostel_id } = req.body;

  if (!student_id || !hostel_id) {
    return res.status(400).json({ error: "Student ID and Hostel ID are required!" });
  }

  try {
    // Fetch student details
    const [student] = await db.promise().query(
      "SELECT name, email FROM students WHERE id = ?",
      [student_id]
    );

    if (student.length === 0) {
      return res.status(404).json({ error: "Student not found!" });
    }

    const { name, email } = student[0];

    // Check if hostel has available rooms
    const [hostel] = await db.promise().query(
      "SELECT available_rooms FROM hosteldetails WHERE id = ?",
      [hostel_id]
    );

    if (hostel.length === 0) {
      return res.status(404).json({ error: "Hostel not found!" });
    }

    if (hostel[0].available_rooms <= 0) {
      return res.status(400).json({ error: "No rooms available in this hostel!" });
    }

    // Insert booking record
    await db.promise().query(
      "INSERT INTO bookings (student_id, student_name, student_email, hostel_id, status) VALUES (?, ?, ?, ?, 'Pending')",
      [student_id, name, email, hostel_id]
    );

    // Reduce available rooms count
    await db.promise().query(
      "UPDATE hosteldetails SET available_rooms = available_rooms - 1 WHERE id = ?",
      [hostel_id]
    );

    res.status(201).json({ message: "✅ Hostel booked successfully!" });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ error: "Database error! Booking failed." });
  }
});

app.put("/api/bookings/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value!" });
  }

  try {
    const [result] = await db.promise().execute(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found!" });
    }

    res.json({ message: `Booking status updated to ${status}` });
  } catch (error) {
    console.error("Booking Update Error:", error);
    res.status(500).json({ error: "Failed to update booking!" });
  }
});

app.get("/api/bookings/student/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const [bookings] = await db.promise().query(
      `SELECT b.id, b.booking_date, b.status, 
              h.hostel_name, h.location, h.rent_per_month
       FROM bookings b
       JOIN hosteldetails h ON b.hostel_id = h.id
       WHERE b.student_id = ?`,
      [student_id]
    );

    res.json(bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({ error: "Failed to fetch bookings!" });
  }
});



app.delete("/hostels/:id", (req, res) => {
  const { id } = req.params;

  // First, get the image URL to delete the file (optional)
  db.query("SELECT image_url FROM hosteldetails WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching image:", err);
      return res.status(500).json({ error: "Error deleting hostel" });
    }

    const imageUrl = results[0]?.image_url;

    // Delete Hostel from Database
    db.query("DELETE FROM hosteldetails WHERE id = ?", [id], (err) => {
      if (err) {
        console.error("❌ Error deleting hostel:", err);
        return res.status(500).json({ error: "Error deleting hostel" });
      }

      // Optionally delete the image file (requires 'fs' module)
      if (imageUrl) {
        const fs = require("fs");
        fs.unlink(`.${imageUrl}`, (err) => {
          if (err) console.error("⚠️ Error deleting image file:", err);
        });
      }

      res.json({ message: "✅ Hostel deleted successfully!" });
    });
  });
});
// ➤ Get Rooms by Hostel ID
app.get("/rooms", async (req, res) => {
  try {
    const { hostel_id } = req.query;
    if (!hostel_id) {
      return res.status(400).json({ error: "⚠️ Hostel ID is required!" });
    }

    const sql = "SELECT * FROM rooms WHERE hostel_id = ?";
    const [rooms] = await db.promise().execute(sql, [hostel_id]);

    res.status(200).json({ success: true, rooms: rooms.length > 0 ? rooms : [] });
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ➤ Add Room
app.post("/rooms", uploadRoom.single("image"), async (req, res) => {
  try {
    const { owner_id, hostel_id, room_number, room_type, rent_per_month, amenities, availability } = req.body;
    const image_url = req.file ? `/uploads/rooms/${req.file.filename}` : null;

    if (!owner_id || !hostel_id || !room_number || !room_type || !rent_per_month || !amenities || availability === undefined) {
      return res.status(400).json({ error: "⚠️ All fields are required!" });
    }

    const sql = `INSERT INTO rooms (owner_id, hostel_id, room_number, room_type, rent_per_month, amenities, availability, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await db.promise().execute(sql, [owner_id, hostel_id, room_number, room_type, rent_per_month, amenities, availability, image_url]);

    res.status(201).json({ message: "✅ Room added successfully!" });
  } catch (error) {
    console.error("❌ Error adding room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ➤ Update Room
app.put("/rooms/:id", uploadRoom.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { owner_id, hostel_id, room_number, room_type, rent_per_month, amenities, availability } = req.body;
    const image_url = req.file ? `/uploads/rooms/${req.file.filename}` : null;

    if (!owner_id || !hostel_id || !room_number || !room_type || !rent_per_month || !amenities || availability === undefined) {
      return res.status(400).json({ error: "⚠️ All fields are required!" });
    }

    let sql = `UPDATE rooms SET owner_id=?, hostel_id=?, room_number=?, room_type=?, rent_per_month=?, amenities=?, availability=?`;
    let params = [owner_id, hostel_id, room_number, room_type, rent_per_month, amenities, availability];

    if (image_url) {
      sql += `, image_url=?`;
      params.push(image_url);
    }

    sql += ` WHERE id=?`;
    params.push(id);

    await db.promise().execute(sql, params);

    res.status(200).json({ message: "✅ Room updated successfully!" });
  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ➤ Delete Room
app.delete("/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = "DELETE FROM rooms WHERE id = ?";
    await db.promise().execute(sql, [id]);

    res.status(200).json({ message: "✅ Room deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Server Listen
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
