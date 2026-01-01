const Queue = require('bull');

// Build Redis connection configuration for Bull
const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

// Add password if provided
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

// Create video export queue
const videoExportQueue = new Queue('video-export', {
  redis: redisConfig,
});

// Queue event handlers
videoExportQueue.on('error', error => {
  console.error('Queue error:', error);
});

videoExportQueue.on('waiting', jobId => {
  console.log(`Job ${jobId} is waiting`);
});

videoExportQueue.on('active', job => {
  console.log(`Job ${job.id} is now active`);
});

videoExportQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed`, result);
});

videoExportQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = {
  videoExportQueue,
};
