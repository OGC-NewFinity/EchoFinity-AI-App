/**
 * E2E Tests: Full Video Pipeline Flow
 * Tests: Authentication → Project Creation → Export → AI Processing → Metadata Storage
 */

const request = require('supertest');
const { createTestApp } = require('./app.test');

// Mock models
const mockUserFindOne = jest.fn();
const mockProjectCreate = jest.fn();
const mockProjectFindOne = jest.fn();
const mockProjectFindAll = jest.fn();
const mockProjectUpdate = jest.fn();
const mockProjectDestroy = jest.fn();
const mockVideoCreate = jest.fn();
const mockVideoFindByPk = jest.fn();
const mockVideoFindOne = jest.fn();
const mockVideoUpdate = jest.fn();

jest.mock('../../models', () => {
  const mockProject = {
    create: mockProjectCreate,
    findOne: mockProjectFindOne,
    findAll: mockProjectFindAll,
    update: mockProjectUpdate,
    destroy: mockProjectDestroy,
  };

  const mockVideo = {
    create: mockVideoCreate,
    findByPk: mockVideoFindByPk,
    findOne: mockVideoFindOne,
    update: mockVideoUpdate,
  };

  const mockUser = {
    findOne: mockUserFindOne,
    findByPk: jest.fn(),
  };

  return {
    User: mockUser,
    Project: mockProject,
    Video: mockVideo,
    sequelize: {
      where: jest.fn((fn, value) => ({ fn, value })),
      fn: jest.fn(fn => ({ fn })),
      col: jest.fn(col => ({ col })),
      literal: jest.fn(sql => sql),
    },
  };
});

// Mock JWT - must be set up before routes are loaded
const mockJwtVerify = jest.fn();
const mockJwtSign = jest.fn();

jest.mock('jsonwebtoken', () => ({
  verify: (...args) => mockJwtVerify(...args),
  sign: (...args) => mockJwtSign(...args),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(password => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(password === hash.replace('hashed_', ''))),
}));

// Mock token service
const mockGetUserDailyTokens = jest.fn();
const mockCalculateTokenCost = jest.fn();
const mockDeductTokens = jest.fn();
const mockRecordTokenUsage = jest.fn();

jest.mock('../../services/tokenService', () => ({
  getUserDailyTokens: mockGetUserDailyTokens,
  calculateTokenCost: mockCalculateTokenCost,
  deductTokens: mockDeductTokens,
  recordTokenUsage: mockRecordTokenUsage,
}));

// Import after mocks
const aiService = require('../../services/aiService');
const { videoExportQueue } = require('../../config/queue');

describe('Video Flow E2E Tests', () => {
  let app;
  let testToken;
  const testUserId = 'test-user-123';
  const testUserEmail = 'test@echofinity.com';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set default JWT_SECRET for auth middleware
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret';
    }

    // Create test JWT token string (simulated)
    testToken = 'test-token-12345';

    // Mock JWT sign to return our test token
    mockJwtSign.mockReturnValue(testToken);

    // Mock JWT verification - must handle token extraction from Bearer header
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    mockJwtVerify.mockImplementation((token, secret) => {
      // Auth middleware extracts token from "Bearer <token>", so we compare just the token part
      if (token === testToken && secret === jwtSecret) {
        return { userId: testUserId, email: testUserEmail };
      }
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      throw error;
    });

    // Create test app AFTER mocks are set up
    app = createTestApp();
  });

  describe('Authentication Flow', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app).post('/api/projects').send({ title: 'Test Project' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authorization');
    });

    it('should accept requests with valid Bearer token', async () => {
      mockProjectCreate.mockResolvedValue({
        id: 'project-123',
        title: 'Test Project',
        userId: testUserId,
        status: 'draft',
        createdAt: new Date(),
        toJSON: () => ({
          id: 'project-123',
          title: 'Test Project',
          userId: testUserId,
          status: 'draft',
        }),
      });

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ title: 'Test Project' });

      expect(response.status).toBe(201);
      expect(mockJwtVerify).toHaveBeenCalled();
    });

    it('should reject invalid token format', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', 'InvalidFormat token123')
        .send({ title: 'Test Project' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid authorization format');
    });
  });

  describe('Project Creation → Export Flow', () => {
    let projectId;
    let videoId;

    beforeEach(() => {
      projectId = 'project-123';
      videoId = 'video-123';

      // Mock project creation
      const mockProject = {
        id: projectId,
        title: 'My Video Project',
        userId: testUserId,
        status: 'draft',
        createdAt: new Date(),
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: projectId,
          title: 'My Video Project',
          userId: testUserId,
          status: 'draft',
        }),
      };

      mockProjectCreate.mockResolvedValue(mockProject);
      mockProjectFindOne.mockResolvedValue(mockProject);

      // Mock video creation
      const mockVideo = {
        id: videoId,
        filename: 'export_123.mp4',
        filePath: '/exports/123.mp4',
        resolution: '1080p',
        status: 'processing',
        projectId,
        metadata: {
          format: 'mp4',
          jobId: 'job-123',
        },
        update: jest.fn().mockResolvedValue(true),
        toJSON: () => ({
          id: videoId,
          filename: 'export_123.mp4',
          filePath: '/exports/123.mp4',
          resolution: '1080p',
          status: 'processing',
          projectId,
          metadata: {
            format: 'mp4',
            jobId: 'job-123',
          },
        }),
      };

      mockVideoCreate.mockResolvedValue(mockVideo);
      mockVideoFindByPk.mockResolvedValue(mockVideo);
    });

    it('should successfully create project and export video', async () => {
      // Step 1: Create project
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: 'My Video Project',
          description: 'Test video project',
          status: 'draft',
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.project).toBeDefined();
      expect(mockProjectCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My Video Project',
          userId: testUserId,
        })
      );

      // Step 2: Export video
      const exportResponse = await request(app)
        .post('/api/videos/export')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          projectId,
          format: 'mp4',
          resolution: '1080p',
        });

      expect(exportResponse.status).toBe(202);
      expect(exportResponse.body.jobId).toBeDefined();
      expect(exportResponse.body.status).toBe('queued');
      expect(mockProjectFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: projectId,
            userId: testUserId,
          }),
        })
      );
      expect(mockVideoCreate).toHaveBeenCalled();
      expect(videoExportQueue.add).toHaveBeenCalled();
    });

    it('should verify project ownership before export', async () => {
      // Mock project not found (wrong user)
      mockProjectFindOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/videos/export')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          projectId: 'wrong-project',
          format: 'mp4',
          resolution: '1080p',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Project not found');
      expect(mockVideoCreate).not.toHaveBeenCalled();
    });
  });

  describe('AI Processing Flow', () => {
    let videoId;

    beforeEach(() => {
      videoId = 'video-123';

      const mockVideo = {
        id: videoId,
        filename: 'test-video.mp4',
        filePath: '/videos/test-video.mp4',
        status: 'processing',
        metadata: {},
        update: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      mockVideoFindByPk.mockResolvedValue(mockVideo);
    });

    it('should call AI services for scene detection, subtitles, and color correction', async () => {
      // Simulate AI processing (normally done by videoProcessor job)
      const video = await require('../../models').Video.findByPk(videoId);

      // Simulate AI calls
      const scenes = await aiService.detectScenes(video.filePath);
      const subtitles = await aiService.generateSubtitles(video.filePath);
      const colorCorrected = await aiService.applyColorCorrection(video.filePath, 'cinematic');

      expect(aiService.detectScenes).toHaveBeenCalledWith(video.filePath);
      expect(scenes).toHaveLength(3);
      expect(scenes[0]).toHaveProperty('start');
      expect(scenes[0]).toHaveProperty('end');

      expect(aiService.generateSubtitles).toHaveBeenCalledWith(video.filePath);
      expect(subtitles).toHaveLength(3);
      expect(subtitles[0]).toHaveProperty('text');

      expect(aiService.applyColorCorrection).toHaveBeenCalledWith(video.filePath, 'cinematic');
      expect(colorCorrected).toHaveProperty('correctedPath');
    });

    it('should handle AI service partial failures gracefully', async () => {
      // Mock one service to fail
      aiService.generateSubtitles.mockRejectedValueOnce(new Error('Service unavailable'));

      const video = await require('../../models').Video.findByPk(videoId);

      // Scene detection should still work
      const scenes = await aiService.detectScenes(video.filePath);
      expect(scenes).toBeDefined();

      // Subtitle generation should fail
      await expect(aiService.generateSubtitles(video.filePath)).rejects.toThrow();

      // Color correction should still work
      const colorCorrected = await aiService.applyColorCorrection(video.filePath, 'cinematic');
      expect(colorCorrected).toBeDefined();
    });
  });

  describe('Export Status Check', () => {
    let jobId;
    let videoId;
    let projectId;

    beforeEach(() => {
      jobId = 'job-123';
      videoId = 'video-123';
      projectId = 'project-123';

      const mockVideo = {
        id: videoId,
        filename: 'export_123.mp4',
        filePath: '/exports/123.mp4',
        resolution: '1080p',
        status: 'ready',
        metadata: {
          format: 'mp4',
          jobId,
        },
        updatedAt: new Date(),
        project: {
          id: projectId,
          userId: testUserId,
        },
        toJSON: () => ({
          id: videoId,
          filename: 'export_123.mp4',
          filePath: '/exports/123.mp4',
          resolution: '1080p',
          status: 'ready',
          metadata: {
            format: 'mp4',
            jobId,
          },
          updatedAt: new Date(),
          project: {
            id: projectId,
            userId: testUserId,
          },
        }),
      };

      mockVideoFindOne.mockResolvedValue(mockVideo);
    });

    it('should return export job status', async () => {
      const response = await request(app)
        .get(`/api/export/${jobId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.jobId).toBe(jobId);
      expect(response.body.status).toBe('ready');
      expect(response.body.format).toBe('mp4');
      expect(response.body.resolution).toBe('1080p');
    });

    it('should reject status check for non-existent job', async () => {
      mockVideoFindOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/export/non-existent-job')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('Unauthorized Access', () => {
    it('should reject all protected routes without token', async () => {
      const endpoints = [
        { method: 'get', path: '/api/projects' },
        { method: 'post', path: '/api/projects' },
        { method: 'post', path: '/api/videos/export' },
        { method: 'get', path: '/api/export/job-123' },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
      }
    });
  });
});
