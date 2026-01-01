const { randomUUID } = require('crypto');
const { Video, Project } = require('../models');
const { videoExportQueue } = require('../config/queue');

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
