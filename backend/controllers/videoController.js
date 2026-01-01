const { randomUUID } = require('crypto');
const { Video, Project } = require('../models');
const { videoExportQueue } = require('../config/queue');
const {
  calculateTokenCost,
  deductTokens,
  recordTokenUsage,
  getUserDailyTokens,
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

    // Calculate token cost for export operation
    const operation = `EXPORT_${resolution.toUpperCase()}`;
    const tokenCost = calculateTokenCost(operation);

    // Check user's daily token balance
    const userTokens = await getUserDailyTokens(userId);

    // Deduct tokens for free/pro users (premium/enterprise bypass deduction)
    if (userTokens >= 0) {
      // User has limited tokens (free or pro tier)
      try {
        await deductTokens(userId, tokenCost);
      } catch (error) {
        if (error.message === 'Insufficient tokens') {
          return res.status(402).json({
            error: 'Insufficient tokens',
            message: `Export requires ${tokenCost} tokens, but you have ${userTokens} tokens remaining`,
          });
        }
        throw error; // Re-throw other errors
      }
    }
    // Premium/Enterprise users (userTokens === -1) bypass token deduction

    // Generate jobId (UUID)
    const jobId = randomUUID();

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

    const queueJobId = queueJob?.id || 'unknown';
    console.log(`Video export job ${jobId} added to queue (Bull job ID: ${queueJobId})`);

    // Record token usage (only for limited tier users)
    if (userTokens >= 0) {
      await recordTokenUsage(userId, operation, tokenCost, {
        format,
        resolution,
        jobId,
        videoId: video.id,
      });
    }

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
