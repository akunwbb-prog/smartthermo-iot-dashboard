const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDataStore } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const statusRoutes = require('./routes/status');
const historyRoutes = require('./routes/history');
const settingsRoutes = require('./routes/settings');
const iotRoutes = require('./routes/iot');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize data store
initializeDataStore();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Logging
app.use(morgan('combined'));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? [] : '*',
  credentials: true
}));

// Body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ limit: '16kb', extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/iot', iotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    app: process.env.APP_NAME || 'SmartThermo',
    version: process.env.APP_VERSION || '2.0.0'
  });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║        SmartThermo IoT Dashboard        ║`);
  console.log(`║          Version 2.0.0 (Pro)            ║`);
  console.log(`╠════════════════════════════════════════╣`);
  console.log(`║ Server running at port ${PORT.toString().padEnd(26)} ║`);
  console.log(`║ Environment: ${process.env.NODE_ENV.padEnd(24)} ║`);
  console.log(`║ URL: http://localhost:${PORT.toString().padEnd(20)} ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});

module.exports = app;
