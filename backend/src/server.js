require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./config/db');

const app = express();

// Ensure uploads directory exists
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://snu.acm.org',
  'https://snu.hosting.acm.org',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Create a router for all API routes
const router = express.Router();

// Serve static files from the uploads directory
router.use('/uploads', express.static(uploadDir));

// Import and mount routes
router.use('/api/auth', require('./routes/auth'));
router.use('/api/team', require('./routes/team'));
router.use('/api/events', require('./routes/events'));

// Health check route
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});
router.get('/', (req, res) => {
  res.send('ACM SNIOE Backend is successfully running!');
});
router.get('/api', (req, res) => {
  res.send('ACM SNIOE Backend API is successfully running!');
});

// Mount at both '/' (local dev) and '/backend' (cPanel production)
app.use('/', router);
app.use('/backend', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3001;

// Test DB Connection before starting the server
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully.');
    connection.release();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('CRITICAL ERROR: Failed to connect to the database. The app cannot start.', err);
    process.exit(1);
  });
