const { Video } = require('../models');
const { videoExportQueue } = require('../config/queue');
const aiService = require('../services/aiService');

/**
 * Retry helper function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @param {string} taskName - Name of the task for logging
 * @returns {Promise<any>} Result of the function or null if all retries fail
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000, taskName = 'Task') {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 1) {
        console.log(`${taskName} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.error(`${taskName} failed on attempt ${attempt}/${maxRetries}:`, error.message);

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff: 1s, 2s, 4s
        console.log(`${taskName} retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`${taskName} failed after ${maxRetries} attempts. Last error:`, lastError?.message);
  return null;
}

/**
 * Process video export jobs with AI preprocessing
 * Includes scene detection, subtitle generation, and color correction
 */
const processVideoExport = async job => {
  // Extract format and resolution for potential future use
  // eslint-disable-next-line no-unused-vars
  const { videoId, format, resolution, preset = 'cinematic' } = job.data;

  try {
    console.log(`Starting video export job ${job.id} for video ${videoId}`);

    // Find the video record
    const video = await Video.findByPk(videoId);
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    // Verify video is in processing status
    if (video.status !== 'processing') {
      console.log(`Video ${videoId} is not in processing status (current: ${video.status})`);
      return { message: 'Video status is not processing, skipping' };
    }

    // Get video path (use filePath from video record)
    const videoPath = video.filePath;

    // Initialize metadata object with existing metadata and export start time
    const metadata = {
      ...video.metadata,
      exportStartedAt: new Date().toISOString(),
    };

    // Track AI processing results
    let scenesResult = null;
    let subtitlesResult = null;
    let colorCorrectionResult = null;
    let aiSuccessCount = 0;
    let aiFailureCount = 0;

    // 1. Scene Detection with retry logic
    console.log(`[Job ${job.id}] Starting scene detection for video: ${videoPath}`);
    scenesResult = await retryWithBackoff(
      async () => {
        const scenes = await aiService.detectScenes(videoPath);
        if (!scenes || scenes.length === 0) {
          throw new Error('Scene detection returned empty result');
        }
        return scenes;
      },
      3,
      1000,
      `Scene detection (Job ${job.id})`
    );

    if (scenesResult) {
      metadata.scenes = scenesResult;
      aiSuccessCount++;
      console.log(
        `[Job ${job.id}] Scene detection completed: ${scenesResult.length} scenes detected`
      );
    } else {
      aiFailureCount++;
      console.error(`[Job ${job.id}] Scene detection failed after all retries`);
    }

    // 2. Subtitle Generation with retry logic
    console.log(`[Job ${job.id}] Starting subtitle generation for video: ${videoPath}`);
    subtitlesResult = await retryWithBackoff(
      async () => {
        const subtitles = await aiService.generateSubtitles(videoPath);
        if (!subtitles || subtitles.length === 0) {
          throw new Error('Subtitle generation returned empty result');
        }
        return subtitles;
      },
      3,
      1000,
      `Subtitle generation (Job ${job.id})`
    );

    if (subtitlesResult) {
      metadata.subtitles = subtitlesResult;
      aiSuccessCount++;
      console.log(
        `[Job ${job.id}] Subtitle generation completed: ${subtitlesResult.length} subtitles generated`
      );
    } else {
      aiFailureCount++;
      console.error(`[Job ${job.id}] Subtitle generation failed after all retries`);
    }

    // 3. Color Correction with retry logic
    console.log(
      `[Job ${job.id}] Starting color correction for video: ${videoPath} with preset: ${preset}`
    );
    colorCorrectionResult = await retryWithBackoff(
      async () => {
        const result = await aiService.applyColorCorrection(videoPath, preset);
        if (!result || !result.correctedPath) {
          throw new Error('Color correction returned invalid result');
        }
        return result;
      },
      3,
      1000,
      `Color correction (Job ${job.id})`
    );

    if (colorCorrectionResult) {
      metadata.colorCorrectedPath = colorCorrectionResult.correctedPath;
      aiSuccessCount++;
      console.log(
        `[Job ${job.id}] Color correction completed: ${colorCorrectionResult.correctedPath}`
      );
    } else {
      aiFailureCount++;
      console.error(`[Job ${job.id}] Color correction failed after all retries`);
    }

    // Determine final status based on AI processing results
    let finalStatus;
    if (aiSuccessCount === 3) {
      // All AI calls succeeded
      finalStatus = 'ready';
      console.log(`[Job ${job.id}] All AI processing tasks completed successfully`);
    } else if (aiSuccessCount > 0) {
      // Some AI calls succeeded, some failed
      finalStatus = 'partial';
      metadata.partialCompletion = true;
      metadata.aiSuccessCount = aiSuccessCount;
      metadata.aiFailureCount = aiFailureCount;
      console.log(
        `[Job ${job.id}] Partial AI processing completion: ${aiSuccessCount}/3 tasks succeeded`
      );
    } else {
      // All AI calls failed
      finalStatus = 'failed';
      metadata.aiProcessingFailed = true;
      console.error(`[Job ${job.id}] All AI processing tasks failed`);
    }

    // Simulate FFmpeg processing (mock)
    const processingTime = 5000; // 5 seconds mock processing time
    await new Promise(resolve => setTimeout(resolve, processingTime));

    metadata.processedAt = new Date().toISOString();
    metadata.processingTime = `${processingTime}ms`;

    // Update video record with results
    await video.update({
      status: finalStatus,
      metadata,
    });

    console.log(
      `[Job ${job.id}] Video export job completed for video ${videoId} with status: ${finalStatus}`
    );
    return {
      success: true,
      videoId,
      status: finalStatus,
      message: `Video processed with ${aiSuccessCount}/3 AI tasks succeeded`,
      aiResults: {
        scenes: scenesResult ? scenesResult.length : 0,
        subtitles: subtitlesResult ? subtitlesResult.length : 0,
        colorCorrection: !!colorCorrectionResult,
      },
    };
  } catch (error) {
    console.error(`Error processing video export job ${job.id}:`, error);

    // Update video status to "failed" on critical error
    try {
      const video = await Video.findByPk(videoId);
      if (video) {
        await video.update({
          status: 'failed',
          metadata: {
            ...video.metadata,
            error: error.message,
            failedAt: new Date().toISOString(),
          },
        });
      }
    } catch (updateError) {
      console.error('Error updating video status to failed:', updateError);
    }

    throw error; // Re-throw to mark job as failed
  }
};

// Set up queue processor
// Process up to 2 video export jobs concurrently
videoExportQueue.process(2, async job => {
  // Only process 'export' jobs
  if (job.name === 'export') {
    return await processVideoExport(job);
  }
  // Skip other job types (if any)
  return { message: `Unknown job type: ${job.name}` };
});

console.log('✓ Video export queue processor initialized with AI integration');

module.exports = {
  processVideoExport,
};
