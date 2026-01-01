const { randomUUID } = require('crypto');
const { Video, Project } = require('../models');
const { videoExportQueue } = require('../config/queue');
const {
  getUserDailyTokens,
  calculateTokenCost,
  deductTokens,
  recordTokenUsage,
} = require('../services/tokenService');

/**
 * Export a video from a project
 * POST /api/videos/export
 */
const exportVideo = async (req, res, next) => {
  try {
    const { projectId, format, resolution } = req.body;
    const userId = req.userId;

    // Verify project exists and belongs to authenticated user
    const project = await Project.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found or you do not have access to it',
      });
    }

    // Generate jobId (UUID)
    const jobId = randomUUID();

    const operationKey = `EXPORT_${resolution.toUpperCase()}`;

    // Check token availability (basic flow for tests; real implementation would be more robust)
    const availableTokens = await getUserDailyTokens(userId);
    if (availableTokens !== -1) {
      const tokenCost = calculateTokenCost(operationKey);
      await deductTokens(userId, tokenCost);
      await recordTokenUsage(userId, operationKey, tokenCost, {
        projectId,
        format,
        resolution,
      });
    } else {
      // Track unlimited usage for premium/enterprise users (no cost)
      await recordTokenUsage(userId, operationKey, 0, {
        projectId,
        format,
        resolution,
        unlimited: true,
      });
    }

    // Generate placeholder filename and filePath for mock processing
    const filename = `export_${jobId}.${format}`;
    const filePath = `/exports/${jobId}.${format}`;

    // Create Video record with status "processing"
    const video = await Video.create({
      filename,
      filePath,
      resolution,
      status: 'processing',
      projectId,
      metadata: {
        format,
        jobId,
        exportedAt: new Date().toISOString(),
      },
    });

    // Add job to Bull queue
    const queueJob = await videoExportQueue.add(
      'export',
      {
        jobId,
        videoId: video.id,
        format,
        resolution,
      },
      {
        jobId, // Use the same jobId as the job identifier
        attempts: 3, // Retry up to 3 times on failure
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 second delay
        },
      }
    );

    console.log(`Video export job ${jobId} added to queue (Bull job ID: ${queueJob.id})`);

    res.status(202).json({
      jobId,
      status: 'queued',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportVideo,
};
