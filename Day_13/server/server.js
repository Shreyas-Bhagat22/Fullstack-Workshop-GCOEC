const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env in server folder, or parent directory
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to current working directory .env

const { checkSupabaseConnection } = require('./config/supabase');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Verify Supabase configuration and connectivity
checkSupabaseConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/tasks', taskRoutes);

// Catch-all for API 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Fallback route for single-page application navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Centralized Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 TaskFlow Server is running on port ${PORT}`);
  console.log(`🌐 Frontend accessible at http://localhost:${PORT}`);
  console.log(`📡 API accessible at http://localhost:${PORT}/api/tasks`);
  console.log(`⚡ Database: Supabase PostgreSQL`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`💥 Unhandled Rejection: ${err.message}`);
});

module.exports = { app, server };
