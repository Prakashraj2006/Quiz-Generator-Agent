const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/syncscore';
mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic check route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'SyncScore AI Backend is running.' });
});

// Routes
const quizRoutes = require('./routes/quizRoutes');
const projectRoutes = require('./routes/projectRoutes');
app.use('/api/quiz', quizRoutes);
app.use('/api/projects', projectRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || []
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing
