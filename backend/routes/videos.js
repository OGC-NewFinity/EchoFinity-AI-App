const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateVideoExport } = require('../middleware/validation');
const { exportVideo } = require('../controllers/videoController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/videos/export - Export a video from a project
router.post('/export', validateVideoExport, exportVideo);

module.exports = router;
