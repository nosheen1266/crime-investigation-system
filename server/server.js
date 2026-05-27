require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// 1. IMPORT YOUR DATABASE HERE SO IT RUNS AND STAYS ALIVE
const { poolPromise } = require('./config/db'); 

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://elegant-empanada-3aeca2.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/citizen', require('./routes/citizenRoutes'));
app.use('/api/officer', require('./routes/officerRoutes'));
app.use('/api/forensic', require('./routes/forensicRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// 2. WAIT FOR DATABASE POOL, THEN LISTEN ON PORT
poolPromise.then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error("❌ Failed to start server due to database error:", err);
});