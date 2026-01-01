const { Video, Project, sequelize } = require('../models');

/**
 * Get export job status by jobId
 * GET /api/export/:jobId
 */
const getExportStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    // Find Video with matching jobId in metadata and include Project to verify ownership
    // Query JSONB field: metadata->>'jobId' using PostgreSQL JSONB operator
    // jobId is a UUID, so it's safe to use in literal (UUIDs have a fixed format)
    const video = await Video.findOne({
      where: sequelize.where(
        sequelize.fn('jsonb_extract_path_text', sequelize.col('metadata'), 'jobId'),
        jobId
      ),
      include: [
        {
          model: Project,
          as: 'project',
          where: { userId },
          attributes: ['id', 'userId'], // Only include what we need for verification
        },
      ],
    });

    if (!video) {
      return res.status(404).json({
        error: 'Export job not found or you do not have access to it',
      });
    }

    // Extract format and resolution from metadata
    const format = video.metadata?.format || null;
    const resolution = video.resolution || null;

    // Build response
    const response = {
      jobId,
      status: video.status, // processing | ready | failed
      updatedAt: video.updatedAt,
      format,
      resolution,
      logs: [], // Optional: if Redis logs were enabled, fetch and attach here
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExportStatus,
};
