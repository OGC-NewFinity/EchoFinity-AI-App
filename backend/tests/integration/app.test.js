/**
 * Test App Bootstrap
 * Sets up Express app for integration/E2E testing with all mocks configured
 */

const express = require('express');
const cors = require('cors');

// Mock all external services BEFORE importing routes
jest.mock('../../config/database', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    literal: jest.fn(sql => sql),
    where: jest.fn((fn, value) => ({ fn, value })),
    fn: jest.fn(fn => ({ fn })),
    col: jest.fn(col => ({ col })),
  };
  return mockSequelize;
});

jest.mock('../../config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(true),
}));

// Mock queue - define mockAdd inside the factory to ensure it's a jest.fn()
jest.mock('../../config/queue', () => {
  const mockAdd = jest.fn().mockResolvedValue({
    id: 'mock-job-id',
    data: {},
  });
  return {
    videoExportQueue: {
      add: mockAdd,
      on: jest.fn(),
      process: jest.fn(),
    },
  };
});

jest.mock('../../jobs/videoProcessor', () => ({
  // Mock video processor - don't start any workers
}));

// Mock AI Service
jest.mock('../../services/aiService', () => ({
  detectScenes: jest.fn().mockResolvedValue([
    { start: 0, end: 5 },
    { start: 5, end: 10 },
    { start: 10, end: 15 },
  ]),
  generateSubtitles: jest.fn().mockResolvedValue([
    { start: 0, end: 2, text: 'Hello world' },
    { start: 2, end: 4, text: 'This is a test' },
    { start: 4, end: 6, text: 'Welcome to EchoFinity' },
  ]),
  applyColorCorrection: jest.fn().mockResolvedValue({
    correctedPath: '/mock/color-corrected-video.mp4',
  }),
}));

// Mock file system
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock video data')),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  statSync: jest.fn().mockReturnValue({ size: 1024 * 1024 }), // 1MB
}));

// Mock child_process for FFmpeg
jest.mock('child_process', () => ({
  spawn: jest.fn(() => ({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn((event, callback) => {
      if (event === 'close') {
        setTimeout(() => callback(0), 10); // Simulate successful exit
      }
    }),
  })),
  exec: jest.fn((cmd, callback) => {
    setTimeout(() => callback(null, { stdout: '', stderr: '' }), 10);
  }),
}));

// Create Express app instance (without starting server)
function createTestApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Routes (required after mocks are set up)
  // Note: Routes are loaded here because mocks above are hoisted by Jest
  app.use('/api', require('../../routes/health'));
  app.use('/api/auth', require('../../routes/auth'));
  app.use('/api/projects', require('../../routes/projects'));
  app.use('/api/videos', require('../../routes/videos'));
  app.use('/api/export', require('../../routes/export'));

  // Error handler (must be last)
  app.use(require('../../middleware/errorHandler'));

  return app;
}

// Export mockQueueAdd for use in tests (access the mocked function)
// Note: This must be done after the mock is set up, so we get it from the mocked module
const { videoExportQueue } = require('../../config/queue');
const mockQueueAdd = videoExportQueue.add;

module.exports = {
  createTestApp,
  mockQueueAdd,
};
