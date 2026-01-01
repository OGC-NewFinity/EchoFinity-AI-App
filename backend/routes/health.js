const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const { redisClient } = require('../config/redis');

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    let dbStatus = 'ok';
    try {
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'error';
    }

    // Check Redis connection
    let redisStatus = 'ok';
    try {
      if (!redisClient.isOpen) {
        redisStatus = 'error';
      } else {
        await redisClient.ping();
      }
    } catch (error) {
      redisStatus = 'error';
    }

    const statusCode = dbStatus === 'ok' && redisStatus === 'ok' ? 200 : 503;

    res.status(statusCode).json({
      db: dbStatus,
      redis: redisStatus,
    });
  } catch (error) {
    res.status(503).json({
      db: 'error',
      redis: 'error',
      error: error.message,
    });
  }
});

module.exports = router;
