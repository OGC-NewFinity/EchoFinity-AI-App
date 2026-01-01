const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getExportStatus } = require('../controllers/exportController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/export/:jobId - Get export job status
router.get('/:jobId', getExportStatus);

module.exports = router;
