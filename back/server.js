// // server.js (clean version after refactoring)
// const express = require('express');
// const mysql = require('mysql2');
// const session = require('express-session');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const port = process.env.PORT || 5000;

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(bodyParser.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(session({
//   secret: 'your_secret_key',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }
// }));

// // MySQL database connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Balaji',
//   database: 'hostel',
//   connectTimeout: 10000,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Attach DB to app locals
// app.locals.db = db;

// // Connect to MySQL
// db.connect((err) => {
//   if (err) {
//     console.error('Database connection failed:', err.stack);
//     return;
//   }
//   console.log('Connected to MySQL database successfully.');
// });

// // Reconnection handler
// db.on('error', (err) => {
//   console.error('Database error:', err);
//   if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//     db.connect((err) => {
//       if (err) console.error('Reconnection failed:', err);
//       else console.log('Reconnected to database successfully.');
//     });
//   } else {
//     throw err;
//   }
// });

// // Route files
// const studentRoutes = require('./student_routes');
// const ownerRoutes = require('./owner_routes');
// const adminRoutes = require('./admin_routes');
// const hostelRoutes = require('./hostel_routes'); // <-- ADD THIS


// // Mount routes
// app.use('/api/students', studentRoutes);
// app.use('/api/owners', ownerRoutes);
// app.use('/api/admins', adminRoutes);
// app.use('/api/hostels', hostelRoutes); // <-- ADD THIS


// // Start server
// const server = app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// server.on('error', (err) => {
//   if (err.code === 'EADDRINUSE') {
//     console.error(`Port ${port} is already in use.`);
//     process.exit(1);
//   } else {
//     console.error('Server error:', err);
//   }
// });















































const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();


// Create the Express app
const app = express();
const port = process.env.PORT || 5000;
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// Configure CORS for localhost


// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

//versal
app.use(cors({
 origin: [
    'https://hostel-hub-git-balaji-tejas5124s-projects.vercel.app',
    'https://hostel-hub-tejas5124s-projects.vercel.app',
    'https://hostel-hub-three.vercel.app',
    'https://hostelhub.balajimore.info'
  ],
 // replace with actual URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'help.hostelhub@gmail.com', // Replace with your email
    pass: 'slkd hcnv pgns cxur'     // Replace with your app password
  }
});

// MySQL database connection for localhost


// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Balaji',
//     database: 'hostel',
//     connectTimeout: 10000, // 10 seconds
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });


//for versal 

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});




// Connect to MySQL with better error handling
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database successfully.');
});

// Handle database connection errors
db.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Attempting to reconnect to database...');
        db.connect((err) => {
            if (err) {
                console.error('Reconnection failed:', err);
            } else {
                console.log('Reconnected to database successfully.');
            }
        });
    } else {
        throw err;
    }
});

// Middleware
app.use(bodyParser.json());

// Session middleware

// app.use(session({
//   secret: 'your_secret_key', // Replace with your secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Set to true if using HTTPS
// }));



app.set('trust proxy', 1);  // ← tell Express it’s behind HTTPS proxy

app.use(session({
  secret: 'your_secret_key',     // use a strong, env‑based secret
  resave: false,                 // recommended
  saveUninitialized: false,      // don’t save empty sessions
  cookie: {
    httpOnly: true,              // JS on the client cannot access the cookie
    secure: true,                // ✅ cookie only sent over HTTPS
    sameSite: 'None'             // ✅ allows cross‑site cookie
  }
}));


// Function to hash password
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });
};

// Route to handle student login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM student WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (isMatch) {
        req.session.student = { id: user.student_id, email: user.email }; // Set session if needed
        res.status(200).json({ 
          message: 'Login successful',
          student_id: user.student_id // Include student_id in the response
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});

// Route to handle student logout
app.post('/student-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

// Route to handle student registration
app.post('/register', async (req, res) => {
  const { name, email, password, date_of_birth, phone_number, gender, address } = req.body;
  
  if (!name || !email || !password || !date_of_birth || !phone_number || !gender || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO student (name, email, password, date_of_birth, phone_number, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, date_of_birth, phone_number, gender, address];

    db.query(query, values, (err, results) => {
      if (err) 
      {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//owner session
app.get('/owner-session', (req, res) => {
  console.log('Checking session:', req.session);

  if (req.session.owner) {
    res.status(200).json({ message: 'Session active', owner: req.session.owner });
  } else {
    res.status(401).json({ message: 'Session expired' });
  }
});



// Route to handle owner login

// app.post('/owner-login', (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   const query = 'SELECT * FROM hostelowner WHERE email = ?';
//   db.query(query, [email], (err, results) => {
//     if (err) {
//       console.error('Error querying database:', err);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ message: 'Invalid email or password' });
//     }

//     const owner = results[0];

//     bcrypt.compare(password, owner.password, (err, isMatch) => {
//       if (err) {
//         console.error('Error comparing passwords:', err);
//         return res.status(500).json({ message: 'Internal Server Error' });
//       }

//       if (isMatch) {
//         req.session.user = { id: owner.owner_id, email: owner.email };
//         res.status(200).json({ 
//           message: 'Login successful', 
//           owner_id: owner.owner_id // Include owner_id in the response
//         });
//       } else {
//         res.status(401).json({ message: 'Invalid email or password' });
//       }
//     });
//   });
// });

//New Login  route

app.post('/owner-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM hostelowner WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const owner = results[0];

    bcrypt.compare(password, owner.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (isMatch) {
        req.session.owner = { id: owner.owner_id, email: owner.email }; // ✅ FIXED
        console.log('Login successful, session set:', req.session.owner);
        res.status(200).json({ 
          message: 'Login successful', 
          owner_id: owner.owner_id 
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});


// Route to handle owner logout
app.post('/owner-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

// Route to handle owner registration
app.post('/register_owner', async (req, res) => {
  const { name, email, password, phone_number, address } = req.body;

  if (!name || !email || !password || !phone_number || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO hostelowner (name, email, password, phone_number, address) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, phone_number, address];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/admin-login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM collegeadministration WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const admin = results[0];

    bcrypt.compare(password, admin.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (isMatch) {
        req.session.user = { id: admin.admin_id, email: admin.email };

        // Send admin_id in response
        res.status(200).json({ 
          message: 'Login successful',
          admin_id: admin.admin_id, 
          email: admin.email
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    });
  });
});


// Route to handle admin logout
app.post('/admin-logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.status(200).json({ message: 'Logged out.' });
  });
});

// Route to handle admin registration
app.post('/register_admin', async (req, res) => {
  const { name, email, password, phone_number, position } = req.body;

  if (!name || !email || !password || !phone_number || !position) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const query = 'INSERT INTO collegeadministration (name, email, password, phone_number, position) VALUES (?, ?, ?, ?, ?)';
    const values = [name, email, hashedPassword, phone_number, position];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle adding hostel details

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Your add-hostel route with image upload
app.post("/add-hostel", upload.single("image"), (req, res) => {
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);

  const { owner_id, name, address, description, total_rooms, available_rooms, rent, facilities, hostel_gender } = req.body;
  const image_path = req.file ? req.file.filename : null;

  if (!owner_id || !name || !address || !description || !total_rooms || !available_rooms || !rent || !image_path || !hostel_gender) {
    return res.status(400).json({ message: "All fields including image and hostel gender are required" });
  }

  // Validate hostel_gender
  if (!['boys', 'girls'].includes(hostel_gender)) {
    return res.status(400).json({ message: "Invalid hostel gender. Must be either 'boys' or 'girls'" });
  }

  let parsedFacilities = [];
  try {
    parsedFacilities = JSON.parse(facilities);
  } catch (error) {
    return res.status(400).json({ message: "Invalid facilities format" });
  }

  const approval_status = "pending";

  // Parse numeric fields to ensure correct values
  const parsedTotalRooms = parseInt(total_rooms, 10);
  const parsedAvailableRooms = parseInt(available_rooms, 10);
  
  // Validate rent is a positive number and has at most 2 decimal places
  const rentValue = parseFloat(rent);
  if (isNaN(rentValue) || rentValue <= 0) {
    return res.status(400).json({ message: "Rent must be a positive number" });
  }
  
  // Round to 2 decimal places to avoid floating point issues
  const roundedRent = Math.round(rentValue * 100) / 100;

  const query = `
    INSERT INTO hosteldetails 
    (owner_id, name, address, description, total_rooms, available_rooms, approval_status, rent, image_path, facilities, hostel_gender) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    owner_id,
    name,
    address,
    description,
    parsedTotalRooms,
    parsedAvailableRooms,
    approval_status,
    roundedRent,
    image_path,
    JSON.stringify(parsedFacilities),
    hostel_gender
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    res.status(200).json({ message: "Hostel added successfully" });
  });
});

// Route to handle removing a hostel
// Fetch hostels for a specific owner
// app.get('/owner-hostels/:ownerId', (req, res) => {
//   const ownerId = req.params.ownerId;

//   const query = `
//     SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path, facilities
//     FROM hosteldetails 
//     WHERE owner_id = ?
//   `;

//   db.query(query, [ownerId], (err, results) => {
//     if (err) {
//       console.error('Error fetching hostels:', err);
//       return res.status(500).json({ message: 'Internal Server Error' });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'No hostels found for this owner' });
//     }

//     res.status(200).json(results);
//   });
// });

// Route to fetch hostels for the owner with base64 image_path conversion
app.get('/owner-hostels/:ownerId', (req, res) => {
  const ownerId = req.params.ownerId;

  const query = `
    SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path, facilities, hostel_gender
    FROM hosteldetails 
    WHERE owner_id = ?
  `;

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching hostels:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No hostels found for this owner' });
    }

    // Process results to include proper image URLs
    const hostels = results.map(hostel => {
      const imagePath = hostel.image_path ? `/uploads/${hostel.image_path}` : null;
      console.log('Image path:', imagePath); // Debug log
      return {
        ...hostel,
        image_path: imagePath
      };
    });
  
    res.status(200).json(hostels);
  });
});




// Route to remove a hostel by ID
app.delete('/remove-hostel', (req, res) => {
  const { hostel_id } = req.body;

  if (!hostel_id) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  const deleteQuery = 'DELETE FROM hosteldetails WHERE hostel_id = ?';
  db.query(deleteQuery, [hostel_id], (err, results) => {
    if (err) {
      console.error('Error deleting hostel:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found or already removed' });
    }

    res.status(200).json({ message: 'Hostel removed successfully' });
  });
});





app.get('/api/hostels', (req, res) => {
  const sql = 'SELECT owner_id,hostel_id,name,address,description,total_rooms,available_rooms,rent,approval_status FROM hosteldetails';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching hostel details:', err);
      res.status(500).json({ message: 'Error fetching hostel details' });
    } else {
      res.json(results);
    }
  });
});


app.get('/api/students', (req, res) => {
  const sql = `
    SELECT 
      s.student_id, s.name, s.email, s.phone_number, s.address, s.date_of_birth, s.gender,
      h.name AS hostel_name
    FROM student s
    LEFT JOIN bookings b ON s.student_id = b.student_id AND b.booking_status = 'approved'
    LEFT JOIN hosteldetails h ON b.hostel_id = h.hostel_id
  `;
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
// Route to delete a student by ID
app.delete('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const query = 'DELETE FROM student WHERE student_id = ?';
  
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  });
});

// Make sure this route is in your server file (e.g., index.js)
app.put('/update-hostel', (req, res) => {
  const { hostel_id, owner_id, name, total_rooms, available_rooms, rent, address, description, facilities } = req.body;

  if (!hostel_id || !owner_id || !name || !total_rooms || !available_rooms || !rent || !address || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate rent is a positive number and has at most 2 decimal places
  const rentValue = parseFloat(rent);
  if (isNaN(rentValue) || rentValue <= 0) {
    return res.status(400).json({ message: "Rent must be a positive number" });
  }
  
  // Round to 2 decimal places to avoid floating point issues
  const roundedRent = Math.round(rentValue * 100) / 100;

  // Validate room numbers
  if (available_rooms > total_rooms) {
    return res.status(400).json({ message: "Available rooms cannot be more than total rooms" });
  }

  // Handle facilities data: Convert string to array if needed
  let facilitiesData;
  try {
    if (typeof facilities === 'string') {
      facilitiesData = JSON.stringify(facilities.split(',').map(f => f.trim()).filter(f => f));
    } else if (Array.isArray(facilities)) {
      facilitiesData = JSON.stringify(facilities);
    } else {
      facilitiesData = JSON.stringify([]);
    }
  } catch (err) {
    console.error('Error processing facilities:', err);
    return res.status(400).json({ message: 'Invalid facilities data' });
  }

  const query = `UPDATE hosteldetails
                 SET name = ?, total_rooms = ?, available_rooms = ?, rent = ?, 
                     address = ?, description = ?, facilities = ?
                 WHERE hostel_id = ? AND owner_id = ?`;

  db.query(query, [
    name,
    total_rooms,
    available_rooms,
    roundedRent,
    address,
    description,
    facilitiesData,
    hostel_id,
    owner_id
  ], (err, result) => {
    if (err) {
      console.error('Error updating hostel:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found or you do not have permission to update it' });
    }

    res.status(200).json({ message: 'Hostel updated successfully!' });
  });
});




// Route to approve a hostel
app.post('/api/hostels/approve/:hostelId', (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  // SQL query to update hostel approval status
  const query = 'UPDATE hosteldetails SET approval_status = ? WHERE hostel_id = ?';
  const values = ['approved', hostelId];

  // Execute the query
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating hostel approval status:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel approved successfully' });
  });
});
// In your backend file (e.g., `index.js` or `api.js`)

app.get('/api/hostels/non-approved', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hosteldetails WHERE approval_status = "not approved"'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/hostels/approve/:id', async (req, res) => {
  const hostelId = req.params.id;
  try {
    await pool.query(
      'UPDATE hosteldetails SET approval_status = "approved" WHERE hostel_id = ?',
      [hostelId]
    );
    res.status(200).json({ message: 'Hostel approved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Route to reject a hostel
app.post('/api/hostels/reject/:hostelId', (req, res) => {
  const hostelId = req.params.hostelId;

  // Validate input
  if (!hostelId) {
    return res.status(400).json({ message: 'Hostel ID is required' });
  }

  // SQL query to update hostel approval status
  const query = 'UPDATE hosteldetails SET approval_status = ? WHERE hostel_id = ?';
  const values = ['rejected', hostelId];

  // Execute the query
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating hostel rejection status:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.status(200).json({ message: 'Hostel rejected successfully' });
  });
});







// Route to fetch hostels for the logged-in owner
app.get('/api/owner-hostels', (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const ownerId = req.session.user.id;
  const query = 'SELECT * FROM hosteldetails WHERE owner_id = ?';

  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching hostels:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    const hostels = results.map(hostel => {
      const imageBuffer = hostel.image ? hostel.image.toString('base64') : null;
      const profilePicBuffer = hostel.profile_pic ? hostel.profile_pic.toString('base64') : null;

      return {
        ...hostel,
        image: imageBuffer ? `data:image/jpeg;base64,${imageBuffer}` : null,
        profile_pic: profilePicBuffer ? `data:image/jpeg;base64,${profilePicBuffer}` : null,
      };
    });

    res.status(200).json(hostels);
  });
});





// Fetch all hostels
app.get('/all-hostels', (req, res) => {
  const query = `
    SELECT hostel_id, name, address, description, rent, total_rooms, available_rooms, approval_status, image_path, hostel_gender 
    FROM hosteldetails
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching hostels:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    res.status(200).json(results);
  });
});



//count of hostels

app.get('/hostel-stats', async (req, res) => {
  try {
    const totalHostels = await db.query('SELECT COUNT(*) AS total FROM hostels');
    const approvedHostels = await db.query("SELECT COUNT(*) AS approved FROM hostels WHERE approval_status = 'approved'");
    const rejectedHostels = await db.query("SELECT COUNT(*) AS rejected FROM hostels WHERE approval_status = 'rejected'");
    
    res.json({
      total: totalHostels[0].total,
      approved: approvedHostels[0].approved,
      rejected: rejectedHostels[0].rejected,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hostel stats' });
  }
});


/// Route to fetch all hostels
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/stu_hostels', (req, res) => {
  db.query(
      'SELECT hostel_id, name, rent, address, description, total_rooms, available_rooms, approval_status, facilities, image_path FROM hosteldetails WHERE approval_status = "approved"',
      (error, rows) => {
          if (error) {
              console.error('Error fetching hostels:', error);
              res.status(500).json({ error: 'Internal server error' });
              return;
          }
          res.json(rows);
      }
  );
});



// Route to book a hostel
app.post('/book_hostel/:hostelId', (req, res) => {
  const { student_id, rent, room_number, booking_date } = req.body;
  const { hostelId } = req.params;

  // Fetch hostel_owner_id based on hostelId
  db.query('SELECT owner_id FROM hosteldetails WHERE hostel_id = ?', [hostelId], (error, results) => {
      if (error) return res.status(500).json({ error: error.message });

      const hostelOwnerId = results[0]?.owner_id;

      // Insert booking into the database
      db.query(
          'INSERT INTO bookings (student_id, hostel_id, rent, room_number, booking_date, hostel_owner_id) VALUES (?, ?, ?, ?, ?, ?)',
          [student_id, hostelId, rent, room_number, booking_date, hostelOwnerId],
          (error, results) => {
              if (error) return res.status(500).json({ error: error.message });
              res.status(200).json({ booking_id: results.insertId });
          }
      );
  });
});






app.post('/update_payment_status/:bookingId', (req, res) => {
  const { payment_status } = req.body;
  const { bookingId } = req.params;

  if (!payment_status || !bookingId) {
      return res.status(400).json({ message: 'Payment status and booking ID are required' });
  }

  const query = 'UPDATE bookings SET payment_status = ? WHERE booking_id = ?';
  db.query(query, [payment_status, bookingId], (err) => {
      if (err) {
          console.error('Error updating payment status:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
      }

      res.status(200).json({ message: 'Payment status updated successfully' });
  });
});



// Route to get student details
app.get('/student-details/:id', (req, res) => {
  const studentId = req.params.id;
  const query = 'SELECT student_id, name, email, phone_number, gender, address FROM student WHERE student_id = ?';
  
  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching student details:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json(results[0]);
  });
});

// Route to get student statistics
app.get('/student-stats/:id', (req, res) => {
  const studentId = req.params.id;
  
  // Get total bookings
  const totalBookingsQuery = 'SELECT COUNT(*) as total FROM bookings WHERE student_id = ?';
  
  // Get active bookings (bookings that haven't ended)
  const activeBookingsQuery = `
    SELECT COUNT(*) as active 
    FROM bookings 
    WHERE student_id = ? 
    AND booking_date <= CURDATE() 
    AND (end_date IS NULL OR end_date >= CURDATE())
  `;
  
  db.query(totalBookingsQuery, [studentId], (err, totalResults) => {
    if (err) {
      console.error('Error fetching total bookings:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    
    db.query(activeBookingsQuery, [studentId], (err, activeResults) => {
      if (err) {
        console.error('Error fetching active bookings:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      
      res.status(200).json({
        totalBookings: totalResults[0].total || 0,
        activeBookings: activeResults[0].active || 0
      });
    });
  });
});

// Route to get owner details
app.get('/owner-details/:id', (req, res) => {
  const ownerId = req.params.id;
  const query = 'SELECT owner_id, name, email, phone_number, address FROM hostelowner WHERE owner_id = ?';
  
  db.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error fetching owner details:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    
    res.status(200).json(results[0]);
  });
});

// Route to get admin details
app.get('/admin-details/:id', (req, res) => {
  const adminId = req.params.id;
  const query = 'SELECT admin_id, name, email, phone_number, position FROM collegeadministration WHERE admin_id = ?';
  
  db.query(query, [adminId], (err, results) => {
    if (err) {
      console.error('Error fetching admin details:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json(results[0]);
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please stop the other process or use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

// Route to get owner dashboard statistics
app.get('/owner-stats/:ownerId', async (req, res) => {
  const ownerId = req.params.ownerId;

  try {
    // Get total hostels
    const [totalHostels] = await db.query(
      'SELECT COUNT(*) as count FROM hosteldetails WHERE owner_id = ?',
      [ownerId]
    );

    // Get approved hostels
    const [approvedHostels] = await db.query(
      'SELECT COUNT(*) as count FROM hosteldetails WHERE owner_id = ? AND approval_status = "approved"',
      [ownerId]
    );

    // Get total available rooms
    const [availableRooms] = await db.query(
      'SELECT SUM(available_rooms) as total FROM hosteldetails WHERE owner_id = ?',
      [ownerId]
    );

    // Get total students (from bookings)
    const [totalStudents] = await db.query(
      'SELECT COUNT(DISTINCT student_id) as count FROM bookings WHERE hostel_owner_id = ?',
      [ownerId]
    );

    // Get pending bookings
    const [pendingBookings] = await db.query(
      'SELECT COUNT(*) as count FROM bookings WHERE hostel_owner_id = ? AND status = "pending"',
      [ownerId]
    );

    // Get total revenue
    const [totalRevenue] = await db.query(
      'SELECT SUM(rent) as total FROM bookings WHERE hostel_owner_id = ? AND status = "approved"',
      [ownerId]
    );

    res.json({
      totalHostels: totalHostels[0].count || 0,
      approvedHostels: approvedHostels[0].count || 0,
      availableRooms: availableRooms[0].total || 0,
      totalStudents: totalStudents[0].count || 0,
      pendingBookings: pendingBookings[0].count || 0,
      totalRevenue: totalRevenue[0].total || 0
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    res.status(500).json({ message: 'Error fetching owner statistics' });
  }
});



app.get('/student-session', (req, res) => {
  if (req.session.student) {
    res.status(200).json({ message: 'Student session active', student: req.session.student });
  } else {
    res.status(401).json({ message: 'Session expired' });
  }
});


// Add new booking request

// app.post('/add-booking', async (req, res) => {
//     const { hostel_id, student_id, check_in_date, check_out_date, total_amount, payment_status } = req.body;
    
//     try {
//         console.log('Received booking request:', req.body); // Debug log

//         // First check if the hostel has available rooms
//         db.query(
//             'SELECT available_rooms FROM hosteldetails WHERE hostel_id = ?',
//             [hostel_id],
//             (err, hostelResults) => {
//                 if (err) {
//                     console.error('Error checking hostel availability:', err);
//                     return res.status(500).json({ message: 'Error checking hostel availability' });
//                 }

//                 if (hostelResults.length === 0) {
//                     return res.status(404).json({ message: 'Hostel not found' });
//                 }

//                 if (hostelResults[0].available_rooms <= 0) {
//                     return res.status(400).json({ message: 'No rooms available in this hostel' });
//                 }

//                 // Insert the booking request

//                 const bookingQuery = `
//                     INSERT INTO bookings (
//                         hostel_id, 
//                         student_id, 
//                         check_in_date, 
//                         check_out_date, 
//                         total_amount, 
//                         payment_status,
//                         booking_status,
//                         created_at
//                     ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
//                 `;

//                 const bookingValues = [
//                     hostel_id,
//                     student_id,
//                     check_in_date,
//                     check_out_date || null,
//                     total_amount,
//                     payment_status || 'pending'
//                 ];

//                 console.log('Executing booking query with values:', bookingValues);

//                 db.query(bookingQuery, bookingValues, (err, result) => {
//                     if (err) {
//                         console.error('Error inserting booking:', err);
//                         return res.status(500).json({ message: 'Error adding booking request' });
//                     }

//                     res.status(201).json({
//                         message: 'Booking request submitted successfully',
//                         booking_id: result.insertId
//                     });
//                 });
//             }
//         );
//     } catch (error) {
//         console.error('Unexpected error in add-booking:', error);
//         res.status(500).json({ message: 'Unexpected error adding booking request' });
//     }
// });


// New Add new booking request
app.post('/add-booking', async (req, res) => {
    const {
        hostel_id,
        student_id,
        check_in_date,
        check_out_date,
        total_amount,
        payment_status
    } = req.body;

    console.log('📥 Received booking request:', req.body); // Debug log

    // ✅ Basic validation
    if (!hostel_id || !student_id || !check_in_date || !total_amount) {
        console.error('❌ Missing required fields');
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ Check availability
    db.query(
        'SELECT available_rooms FROM hosteldetails WHERE hostel_id = ?',
        [hostel_id],
        (err, hostelResults) => {
            if (err) {
                console.error('❌ Error checking hostel availability:', err);
                return res.status(500).json({ message: 'Error checking hostel availability' });
            }

            if (hostelResults.length === 0) {
                return res.status(404).json({ message: 'Hostel not found' });
            }

            if (hostelResults[0].available_rooms <= 0) {
                return res.status(400).json({ message: 'No rooms available in this hostel' });
            }

            // ✅ Insert booking
            const bookingQuery = `
                INSERT INTO bookings (
                    hostel_id, 
                    student_id, 
                    check_in_date, 
                    check_out_date, 
                    total_amount, 
                    payment_status,
                    booking_status
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
            `;

            const bookingValues = [
                hostel_id,
                student_id,
                check_in_date,
                check_out_date || null,
                total_amount,
                payment_status || 'pending'
            ];

            console.log('📦 Executing booking query with values:', bookingValues);

            db.query(bookingQuery, bookingValues, (err, result) => {
                if (err) {
                    console.error('❌ Error inserting booking:', err);
                    return res.status(500).json({ message: 'Error adding booking request' });
                }

                res.status(201).json({
                    message: '✅ Booking request submitted successfully',
                    booking_id: result.insertId
                });
            });
        }
    );
});


// Get booking requests for a hostel owner
app.get('/owner-bookings/:owner_id', (req, res) => {
    const { owner_id } = req.params;
    
    console.log('Fetching bookings for owner_id:', owner_id); // Debug log

    // First verify if the owner exists
    const ownerCheckQuery = 'SELECT owner_id FROM hostelowner WHERE owner_id = ?';
    
    db.query(ownerCheckQuery, [owner_id], (err, ownerResults) => {
        if (err) {
            console.error('Error checking owner:', err);
            return res.status(500).json({ message: 'Error verifying owner' });
        }

        if (ownerResults.length === 0) {
            console.log('Owner not found:', owner_id);
            return res.status(404).json({ message: 'Owner not found' });
        }

        // If owner exists, fetch their bookings
        const query = `
            SELECT 
                b.*,
                h.name as hostel_name,
                h.address as hostel_address,
                h.available_rooms,
                s.name as student_name,
                s.email as student_email,
                s.phone_number as student_phone
            FROM bookings b
            JOIN hosteldetails h ON b.hostel_id = h.hostel_id
            JOIN student s ON b.student_id = s.student_id
            WHERE h.owner_id = ?
            ORDER BY b.created_at DESC
        `;

        console.log('Executing bookings query for owner:', owner_id); // Debug log

        db.query(query, [owner_id], (err, results) => {
            if (err) {
                console.error('Error fetching owner bookings:', err);
                return res.status(500).json({ 
                    message: 'Error fetching booking requests',
                    error: err.message 
                });
            }

            console.log('Found bookings:', results.length); // Debug log
            res.json(results);
        });
    });
});

// Update booking status (approve/reject)
app.put('/update-booking-status/:booking_id', (req, res) => {
    const { booking_id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be approved, rejected, or pending' });
    }

    // First get the current booking status and hostel details
    const checkQuery = `
        SELECT b.booking_status, h.available_rooms, h.hostel_id, h.total_rooms
        FROM bookings b
        JOIN hosteldetails h ON b.hostel_id = h.hostel_id
        WHERE b.booking_id = ?
    `;

    db.query(checkQuery, [booking_id], (err, results) => {
        if (err) {
            console.error('Error checking booking details:', err);
            return res.status(500).json({ message: 'Error checking booking details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const currentStatus = results[0].booking_status;
        const availableRooms = parseInt(results[0].available_rooms, 10);
        const totalRooms = parseInt(results[0].total_rooms, 10);
        const hostelId = results[0].hostel_id;

        console.log('Current Status:', currentStatus);
        console.log('Available Rooms:', availableRooms);
        console.log('Total Rooms:', totalRooms);
        console.log('New Status:', status);

        // Handle status changes
        if (status === 'approved') {
            if (availableRooms <= 0) {
                return res.status(400).json({ message: 'No rooms available for approval' });
            }

            // First update the booking status
            const bookingUpdateQuery = 'UPDATE bookings SET booking_status = ? WHERE booking_id = ?';
            
            db.query(bookingUpdateQuery, [status, booking_id], (err) => {
                if (err) {
                    console.error('Error updating booking status:', err);
                    return res.status(500).json({ message: 'Error updating booking status' });
                }

                // Then update the available rooms
                const roomUpdateQuery = `
                    UPDATE hosteldetails 
                    SET available_rooms = ? 
                    WHERE hostel_id = ? AND available_rooms > 0
                `;
                
                const newAvailableRooms = availableRooms - 1;
                console.log('New Available Rooms:', newAvailableRooms);

                db.query(roomUpdateQuery, [newAvailableRooms, hostelId], (err, result) => {
                    if (err) {
                        console.error('Error updating available rooms:', err);
                        return res.status(500).json({ message: 'Error updating available rooms' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(400).json({ message: 'Failed to update available rooms' });
                    }

                    res.json({ 
                        message: 'Booking approved successfully',
                        available_rooms: newAvailableRooms
                    });
                });
            });
        } else if (status === 'rejected' && currentStatus === 'approved') {
            // First update the booking status
            const bookingUpdateQuery = 'UPDATE bookings SET booking_status = ? WHERE booking_id = ?';
            
            db.query(bookingUpdateQuery, [status, booking_id], (err) => {
                if (err) {
                    console.error('Error updating booking status:', err);
                    return res.status(500).json({ message: 'Error updating booking status' });
                }

                // Then update the available rooms
                const roomUpdateQuery = `
                    UPDATE hosteldetails 
                    SET available_rooms = ? 
                    WHERE hostel_id = ? AND available_rooms < total_rooms
                `;
                
                const newAvailableRooms = availableRooms + 1;
                console.log('New Available Rooms:', newAvailableRooms);

                db.query(roomUpdateQuery, [newAvailableRooms, hostelId], (err, result) => {
                    if (err) {
                        console.error('Error updating available rooms:', err);
                        return res.status(500).json({ message: 'Error updating available rooms' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(400).json({ message: 'Failed to update available rooms' });
                    }

                    res.json({ 
                        message: 'Booking rejected successfully',
                        available_rooms: newAvailableRooms
                    });
                });
            });
        } else {
            // For other status changes (like pending or rejecting a pending booking)
            const updateQuery = 'UPDATE bookings SET booking_status = ? WHERE booking_id = ?';
            
            db.query(updateQuery, [status, booking_id], (err) => {
                if (err) {
                    console.error('Error updating booking status:', err);
                    return res.status(500).json({ message: 'Error updating booking status' });
                }
                res.json({ message: 'Booking status updated successfully' });
            });
        }
    });
});

// Add payment status update endpoint
app.put('/update-payment-status/:booking_id', (req, res) => {
    const { booking_id } = req.params;
    const { status } = req.body;
    
    const query = 'UPDATE bookings SET payment_status = ? WHERE booking_id = ?';
    
    db.query(query, [status, booking_id], (err) => {
        if (err) {
            console.error('Error updating payment status:', err);
            return res.status(500).json({ message: 'Error updating payment status' });
        }

        res.json({ message: 'Payment status updated successfully' });
    });
});

// Get bookings for a student
app.get('/student-bookings/:student_id', (req, res) => {
    const { student_id } = req.params;
    
    // First verify if the student exists
    const studentCheckQuery = 'SELECT student_id FROM student WHERE student_id = ?';
    
    db.query(studentCheckQuery, [student_id], (err, studentResults) => {
        if (err) {
            console.error('Error checking student:', err);
            return res.status(500).json({ message: 'Error verifying student' });
        }

        if (studentResults.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // If student exists, fetch their bookings with hostel details
        const query = `
            SELECT 
                b.*,
                h.name as hostel_name,
                h.address as hostel_address,
                h.owner_id,
                ho.name as owner_name,
                ho.email as owner_email,
                ho.phone_number as owner_phone
            FROM bookings b
            JOIN hosteldetails h ON b.hostel_id = h.hostel_id
            JOIN hostelowner ho ON h.owner_id = ho.owner_id
            WHERE b.student_id = ?
            ORDER BY b.created_at DESC
        `;

        db.query(query, [student_id], (err, results) => {
            if (err) {
                console.error('Error fetching student bookings:', err);
                return res.status(500).json({ 
                    message: 'Error fetching bookings',
                    error: err.message 
                });
            }

            res.json(results);
        });
    });
});

// Update student profile
app.put('/update-student/:student_id', (req, res) => {
    const studentId = req.params.student_id;
    const { phone_number } = req.body;

    // Validate phone number
    if (!phone_number || !/^\d{10}$/.test(phone_number)) {
        return res.status(400).json({ 
            error: 'Invalid phone number. Please provide a valid 10-digit phone number.' 
        });
    }

    // First check if student exists
    const checkQuery = 'SELECT student_id FROM student WHERE student_id = ?';
    db.query(checkQuery, [studentId], (err, results) => {
        if (err) {
            console.error('Error checking student:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Update the phone number
        const updateQuery = 'UPDATE student SET phone_number = ? WHERE student_id = ?';
        db.query(updateQuery, [phone_number, studentId], (err, result) => {
            if (err) {
                console.error('Error updating student:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({ error: 'Failed to update phone number' });
            }

            // Fetch updated student details
            const fetchQuery = 'SELECT * FROM student WHERE student_id = ?';
            db.query(fetchQuery, [studentId], (err, updatedResults) => {
                if (err) {
                    console.error('Error fetching updated student:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.json(updatedResults[0]);
            });
        });
    });
});

// Update owner profile
app.put('/update-owner/:owner_id', (req, res) => {
    const ownerId = req.params.owner_id;
    const { phone_number } = req.body;

    // Validate phone number
    if (!phone_number || !/^\d{10}$/.test(phone_number)) {
        return res.status(400).json({ 
            error: 'Invalid phone number. Please provide a valid 10-digit phone number.' 
        });
    }

    // First check if owner exists
    const checkQuery = 'SELECT owner_id FROM hostelowner WHERE owner_id = ?';
    db.query(checkQuery, [ownerId], (err, results) => {
        if (err) {
            console.error('Error checking owner:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Owner not found' });
        }

        // Update the phone number
        const updateQuery = 'UPDATE hostelowner SET phone_number = ? WHERE owner_id = ?';
        db.query(updateQuery, [phone_number, ownerId], (err, result) => {
            if (err) {
                console.error('Error updating owner:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (result.affectedRows === 0) {
                return res.status(400).json({ error: 'Failed to update phone number' });
            }

            // Fetch updated owner details
            const fetchQuery = 'SELECT * FROM hostelowner WHERE owner_id = ?';
            db.query(fetchQuery, [ownerId], (err, updatedResults) => {
                if (err) {
                    console.error('Error fetching updated owner:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                res.json(updatedResults[0]);
            });
        });
    });
});

// Route to handle forgot password request for students
app.post('/forgot-password-student', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if email exists
    const query = 'SELECT * FROM student WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Email not found' });
      }

      const userName = results[0].name || '';

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // Store reset token in database
      const updateQuery = 'UPDATE student SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
      db.query(updateQuery, [resetToken, resetTokenExpiry, email], async (err) => {
        if (err) {
          console.error('Error updating reset token:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password-student/${resetToken}`;
        const mailOptions = {
          from: 'balajimore9193@gmail.com',
          to: email,
          subject: 'HostelHub Password Reset Request',
          html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #0056b3;">HostelHub Password Reset</h2>
              <p>Hi${userName ? ' ' + userName : ''},</p>
              <p>We received a request to reset your password for your <b>HostelHub</b> account.</p>
              <p>
                <a href="${resetUrl}" style="background: #0056b3; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Reset Password
                </a>
              </p>
              <p>If you did not request this, you can safely ignore this email.</p>
              <p>This link will expire in 1 hour.</p>
              <br>
              <p>Thanks,<br>The HostelHub Team</p>
              <hr>
              <small>
                This email was sent to you because you requested a password reset on HostelHub.<br>
                If you have any questions, contact us at help.hostelhub@gmail.com
              </small>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          res.status(200).json({ message: 'Password reset email sent' });
        } catch (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending reset email' });
        }
      });
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle forgot password request for owners
app.post('/forgot-password-owner', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if email exists
    const query = 'SELECT * FROM hostelowner WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Email not found' });
      }

      const ownerName = results[0].name || '';

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

      // Store reset token in database
      const updateQuery = 'UPDATE hostelowner SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
      db.query(updateQuery, [resetToken, resetTokenExpiry, email], async (err) => {
        if (err) {
          console.error('Error updating reset token:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Send reset email
         const resetUrl = `${process.env.FRONTEND_URL}/reset-password-owner/${resetToken}`;
        const mailOptions = {
          from: 'balajimore9193@gmail.com',
          to: email,
          subject: 'HostelHub Password Reset Request',
          html: `
            <div style="font-family: Arial, sans-serif; color: #222;">
              <h2 style="color: #0056b3;">HostelHub Password Reset</h2>
              <p>Hi${ownerName ? ' ' + ownerName : ''},</p>
              <p>We received a request to reset your password for your <b>HostelHub</b> account.</p>
              <p>
                <a href="${resetUrl}" style="background: #0056b3; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Reset Password
                </a>
              </p>
              <p>If you did not request this, you can safely ignore this email.</p>
              <p>This link will expire in 1 hour.</p>
              <br>
              <p>Thanks,<br>The HostelHub Team</p>
              <hr>
              <small>
                This email was sent to you because you requested a password reset on HostelHub.<br>
                If you have any questions, contact us at support@hostelhub.com
              </small>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          res.status(200).json({ message: 'Password reset email sent' });
        } catch (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending reset email' });
        }
      });
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle password reset for students
app.post('/reset-password-student', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // Find user with valid reset token
    const query = 'SELECT * FROM student WHERE reset_token = ? AND reset_token_expiry > NOW()';
    db.query(query, [token], async (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password and clear reset token
      const updateQuery = 'UPDATE student SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?';
      db.query(updateQuery, [hashedPassword, token], (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.status(200).json({ message: 'Password reset successful' });
      });
    });
  } catch (error) {
    console.error('Error in password reset:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to handle password reset for owners
// app.post('/reset-password-owner', async (req, res) => {
//   const { token, newPassword } = req.body;

//   if (!token || !newPassword) {
//     return res.status(400).json({ message: 'Token and new password are required' });
//   }

//   try {
//     // Find user with valid reset token
//     const query = 'SELECT * FROM hostelowner WHERE reset_token = ? AND reset_token_expiry > NOW()';
//     db.query(query, [token], async (err, results) => {
//       if (err) {
//         console.error('Error querying database:', err);
//         return res.status(500).json({ message: 'Internal Server Error' });
//       }

//       if (results.length === 0) {
//         return res.status(400).json({ message: 'Invalid or expired reset token' });
//       }

//       // Hash new password
//       const hashedPassword = await hashPassword(newPassword);

//       // Update password and clear reset token
//       const updateQuery = 'UPDATE hostelowner SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?';
//       db.query(updateQuery, [hashedPassword, token], (err) => {
//         if (err) {
//           console.error('Error updating password:', err);
//           return res.status(500).json({ message: 'Internal Server Error' });
//         }

//         res.status(200).json({ message: 'Password reset successful' });
//       });
//     });
//   } catch (error) {
//     console.error('Error in password reset:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// New

app.post('/reset-password-owner', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const query = 'SELECT * FROM hostelowner WHERE reset_token = ? AND reset_token_expiry > NOW()';
    db.query(query, [token], async (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const hashedPassword = await hashPassword(newPassword);

      const updateQuery = 'UPDATE hostelowner SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?';
      db.query(updateQuery, [hashedPassword, token], (err) => {
        if (err) {
          console.error('Error updating password:', err);
          return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.status(200).json({ message: 'Password reset successful' });
      });
    });
  } catch (error) {
    console.error('Error in password reset:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Update student profile (email and phone)
app.put('/student-update/:student_id', (req, res) => {
  const studentId = req.params.student_id;
  const { email, phone_number } = req.body;

  if (!email || !phone_number) {
    return res.status(400).json({ message: 'Email and phone number are required.' });
  }

  const updateQuery = 'UPDATE student SET email = ?, phone_number = ? WHERE student_id = ?';
  db.query(updateQuery, [email, phone_number, studentId], (err, result) => {
    if (err) {
      console.error('Error updating student:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

// Update owner profile (email and phone)
app.put('/owner-update/:owner_id', (req, res) => {
  const ownerId = req.params.owner_id;
  const { email, phone_number } = req.body;

  if (!email || !phone_number) {
    return res.status(400).json({ message: 'Email and phone number are required.' });
  }

  const updateQuery = 'UPDATE hostelowner SET email = ?, phone_number = ? WHERE owner_id = ?';
  db.query(updateQuery, [email, phone_number, ownerId], (err, result) => {
    if (err) {
      console.error('Error updating owner:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Owner not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

// Update admin profile (email and phone)
app.put('/admin-update/:admin_id', (req, res) => {
  const adminId = req.params.admin_id;
  const { email, phone_number } = req.body;

  if (!email || !phone_number) {
    return res.status(400).json({ message: 'Email and phone number are required.' });
  }

  const updateQuery = 'UPDATE collegeadministration SET email = ?, phone_number = ? WHERE admin_id = ?';
  db.query(updateQuery, [email, phone_number, adminId], (err, result) => {
    if (err) {
      console.error('Error updating admin:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

//add code for pull request or comparing previous code 
