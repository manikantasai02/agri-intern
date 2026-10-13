// server/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes');

const app = express();

// Security and utility middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'AgriConnect Core API',
    timestamp: new Date().toISOString()
  });
});

// Mount domain routes with standard prefix
app.use('/api/v1', apiRoutes);

// Global 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware (Does NOT leak stack traces to client)
app.use((err, req, res, next) => {
  console.error('AgriConnect Server Exception:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected internal server error occurred.' 
      : err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌾 AgriConnect API Engine running on http://localhost:${PORT}`);
    console.log(`🌾 Health check available at http://localhost:${PORT}/health`);
  });
}

module.exports = app;
