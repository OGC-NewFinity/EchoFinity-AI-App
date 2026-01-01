require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));

// Centralized error handler (must be last middleware)
app.use(errorHandler);

// Initialize database connection and sync models
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully.');

    // Sync models (force: false to avoid dropping existing tables)
    await sequelize.sync({ force: false });
    console.log('✓ Database models synced successfully.');
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database credentials in .env are correct');
    console.error('3. Database "echofinity" exists');
    process.exit(1);
  }
}

// Initialize Redis connection
async function initializeRedis() {
  try {
    await connectRedis();
  } catch (error) {
    console.error('✗ Redis connection failed:');
    console.error(error.message);
    console.error('\nPlease check:');
    console.error('1. Redis is running');
    console.error('2. Redis credentials in .env are correct');
    // Don't exit on Redis failure - app can still work without Redis
  }
}

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
  await initializeDatabase();
  await initializeRedis();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();

module.exports = app;
