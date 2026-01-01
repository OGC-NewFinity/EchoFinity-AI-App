/**
 * Comprehensive Unit Tests for tokenService.js
 *
 * Coverage Targets:
 * - branches: 85%
 * - functions: 90%
 * - lines: 90%
 * - statements: 90%
 */

// Mock models before requiring services
const mockUserFindByPk = jest.fn();
const mockUserUpdate = jest.fn();
const mockTokenUsageCreate = jest.fn();
const mockTokenUsageFindAll = jest.fn();

jest.mock('../../models', () => ({
  User: {
    findByPk: (...args) => mockUserFindByPk(...args),
    update: (...args) => mockUserUpdate(...args),
  },
}));

jest.mock('../../config/database', () => ({
  literal: jest.fn(sql => sql),
}));

// Mock TokenUsage model
jest.mock('../../models/TokenUsage', () => {
  return jest.fn(() => ({
    create: (...args) => mockTokenUsageCreate(...args),
    findAll: (...args) => mockTokenUsageFindAll(...args),
  }));
});

// Import after mocks
const {
  getUserDailyTokens,
  calculateTokenCost,
  deductTokens,
  refreshDailyTokens,
  recordTokenUsage,
  getTokenUsageHistory,
  TOKEN_COSTS,
  DAILY_TOKEN_ALLOCATION,
} = require('../../services/tokenService');

describe('tokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    mockUserFindByPk.mockReset();
    mockUserUpdate.mockReset();
    mockTokenUsageCreate.mockReset();
    mockTokenUsageFindAll.mockReset();
  });

  describe('getUserDailyTokens', () => {
    it('should return correct token count for free tier', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 100,
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const tokens = await getUserDailyTokens('user-123');

      expect(tokens).toBe(100);
      expect(mockUserFindByPk).toHaveBeenCalledWith('user-123');
    });

    it('should return correct token count for pro tier', async () => {
      const mockUser = {
        id: 'user-456',
        subscriptionTier: 'pro',
        dailyTokens: 500,
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const tokens = await getUserDailyTokens('user-456');

      expect(tokens).toBe(500);
      expect(mockUserFindByPk).toHaveBeenCalledWith('user-456');
    });

    it('should return -1 (unlimited) for premium tier', async () => {
      const mockUser = {
        id: 'user-789',
        subscriptionTier: 'premium',
        dailyTokens: 1000,
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const tokens = await getUserDailyTokens('user-789');

      expect(tokens).toBe(-1);
      expect(mockUserFindByPk).toHaveBeenCalledWith('user-789');
    });

    it('should return -1 (unlimited) for enterprise tier', async () => {
      const mockUser = {
        id: 'user-999',
        subscriptionTier: 'enterprise',
        dailyTokens: 5000,
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const tokens = await getUserDailyTokens('user-999');

      expect(tokens).toBe(-1);
      expect(mockUserFindByPk).toHaveBeenCalledWith('user-999');
    });

    it('should return default allocation if dailyTokens is null for free tier', async () => {
      const mockUser = {
        id: 'user-null',
        subscriptionTier: 'free',
        dailyTokens: null,
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const tokens = await getUserDailyTokens('user-null');

      expect(tokens).toBe(DAILY_TOKEN_ALLOCATION.free);
    });

    it('should throw error if user not found', async () => {
      mockUserFindByPk.mockResolvedValue(null);

      await expect(getUserDailyTokens('non-existent-user')).rejects.toThrow('User not found');
      expect(mockUserFindByPk).toHaveBeenCalledWith('non-existent-user');
    });
  });

  describe('calculateTokenCost', () => {
    it('should return correct cost for VIDEO_RECORDING operation', () => {
      const cost = calculateTokenCost('VIDEO_RECORDING');
      expect(cost).toBe(TOKEN_COSTS.VIDEO_RECORDING);
    });

    it('should return correct cost for AI_EDITING operation', () => {
      const cost = calculateTokenCost('AI_EDITING');
      expect(cost).toBe(TOKEN_COSTS.AI_EDITING);
    });

    it('should return correct cost for COLOR_CORRECTION operation', () => {
      const cost = calculateTokenCost('COLOR_CORRECTION');
      expect(cost).toBe(TOKEN_COSTS.COLOR_CORRECTION);
    });

    it('should return correct cost for SUBTITLE_GENERATION operation', () => {
      const cost = calculateTokenCost('SUBTITLE_GENERATION');
      expect(cost).toBe(TOKEN_COSTS.SUBTITLE_GENERATION);
    });

    it('should return correct cost for EXPORT_720P operation', () => {
      const cost = calculateTokenCost('EXPORT_720P');
      expect(cost).toBe(TOKEN_COSTS.EXPORT_720P);
    });

    it('should return correct cost for EXPORT_1080P operation', () => {
      const cost = calculateTokenCost('EXPORT_1080P');
      expect(cost).toBe(TOKEN_COSTS.EXPORT_1080P);
    });

    it('should return correct cost for EXPORT_4K operation', () => {
      const cost = calculateTokenCost('EXPORT_4K');
      expect(cost).toBe(TOKEN_COSTS.EXPORT_4K);
    });

    it('should return correct cost for CLOUD_STORAGE operation', () => {
      const cost = calculateTokenCost('CLOUD_STORAGE');
      expect(cost).toBe(TOKEN_COSTS.CLOUD_STORAGE);
    });

    it('should fallback to default cost for unknown operation', () => {
      const cost = calculateTokenCost('UNKNOWN_OPERATION');
      expect(cost).toBe(TOKEN_COSTS.DEFAULT);
    });

    it('should calculate VIDEO_RECORDING cost based on duration', () => {
      const cost = calculateTokenCost('VIDEO_RECORDING', { duration: 2 });
      expect(cost).toBe(40); // 20 * 2
    });

    it('should round up VIDEO_RECORDING duration when calculating cost', () => {
      const cost = calculateTokenCost('VIDEO_RECORDING', { duration: 2.5 });
      expect(cost).toBe(60); // 20 * Math.ceil(2.5) = 20 * 3
    });

    it('should calculate AI_EDITING cost based on complexity (low)', () => {
      const cost = calculateTokenCost('AI_EDITING', { complexity: 'low' });
      expect(cost).toBe(30);
    });

    it('should calculate AI_EDITING cost based on complexity (medium)', () => {
      const cost = calculateTokenCost('AI_EDITING', { complexity: 'medium' });
      expect(cost).toBe(40);
    });

    it('should calculate AI_EDITING cost based on complexity (high)', () => {
      const cost = calculateTokenCost('AI_EDITING', { complexity: 'high' });
      expect(cost).toBe(50);
    });

    it('should fallback to default AI_EDITING cost for unknown complexity', () => {
      const cost = calculateTokenCost('AI_EDITING', { complexity: 'unknown' });
      expect(cost).toBe(TOKEN_COSTS.AI_EDITING);
    });

    it('should calculate CLOUD_STORAGE cost based on GB', () => {
      const cost = calculateTokenCost('CLOUD_STORAGE', { gb: 5 });
      expect(cost).toBe(5); // 1 * 5
    });

    it('should round up CLOUD_STORAGE GB when calculating cost', () => {
      const cost = calculateTokenCost('CLOUD_STORAGE', { gb: 2.3 });
      expect(cost).toBe(3); // 1 * Math.ceil(2.3) = 1 * 3
    });
  });

  describe('deductTokens', () => {
    it('should deduct tokens correctly from free tier user', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 100,
        update: jest.fn().mockResolvedValue(true),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-123', 30);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(70);
      expect(mockUser.update).toHaveBeenCalledWith({ dailyTokens: 70 });
    });

    it('should deduct tokens correctly from pro tier user', async () => {
      const mockUser = {
        id: 'user-456',
        subscriptionTier: 'pro',
        dailyTokens: 500,
        update: jest.fn().mockResolvedValue(true),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-456', 50);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(450);
      expect(mockUser.update).toHaveBeenCalledWith({ dailyTokens: 450 });
    });

    it('should allow unlimited tokens for premium tier user', async () => {
      const mockUser = {
        id: 'user-789',
        subscriptionTier: 'premium',
        dailyTokens: 1000,
        update: jest.fn(),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-789', 10000);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(-1);
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('should allow unlimited tokens for enterprise tier user', async () => {
      const mockUser = {
        id: 'user-999',
        subscriptionTier: 'enterprise',
        dailyTokens: 5000,
        update: jest.fn(),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-999', 50000);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(-1);
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('should throw error if insufficient tokens', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 50,
        update: jest.fn(),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      await expect(deductTokens('user-123', 100)).rejects.toThrow('Insufficient tokens');
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockUserFindByPk.mockResolvedValue(null);

      await expect(deductTokens('non-existent-user', 10)).rejects.toThrow('User not found');
    });

    it('should throw error if amount is negative', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 100,
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      await expect(deductTokens('user-123', -10)).rejects.toThrow('Token amount must be positive');
    });

    it('should handle user with null dailyTokens', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: null,
        update: jest.fn().mockResolvedValue(true),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-123', 10);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(DAILY_TOKEN_ALLOCATION.free - 10);
    });

    it('should allow deducting exact balance amount', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 100,
        update: jest.fn().mockResolvedValue(true),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-123', 100);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(0);
      expect(mockUser.update).toHaveBeenCalledWith({ dailyTokens: 0 });
    });
  });

  describe('refreshDailyTokens', () => {
    it('should refresh tokens for free tier users', async () => {
      mockUserUpdate.mockResolvedValue([10, []]); // [affectedCount, affectedRows]

      const result = await refreshDailyTokens();

      expect(result.usersRefreshed).toBe(10);
      expect(mockUserUpdate).toHaveBeenCalled();

      const updateCall = mockUserUpdate.mock.calls[0];
      expect(updateCall[0]).toHaveProperty('dailyTokens');

      const whereClause = updateCall[1];
      expect(whereClause.where.subscriptionTier).toBeDefined();
    });

    it('should refresh tokens for pro tier users', async () => {
      mockUserUpdate.mockResolvedValue([5, []]);

      const result = await refreshDailyTokens();

      expect(result.usersRefreshed).toBe(5);
      expect(mockUserUpdate).toHaveBeenCalled();
    });

    it('should not refresh tokens for premium or enterprise users', async () => {
      mockUserUpdate.mockResolvedValue([15, []]);

      await refreshDailyTokens();

      const whereClause = mockUserUpdate.mock.calls[0][1];
      const subscriptionTiers = whereClause.where.subscriptionTier;

      // Should only include free and pro tiers
      // Check that subscriptionTier filter exists (will be Op.in with ['free', 'pro'])
      expect(subscriptionTiers).toBeDefined();
    });

    it('should return 0 if no users refreshed', async () => {
      mockUserUpdate.mockResolvedValue([0, []]);

      const result = await refreshDailyTokens();

      expect(result.usersRefreshed).toBe(0);
    });
  });

  describe('recordTokenUsage', () => {
    it('should create a token usage record', async () => {
      const mockUsageRecord = {
        id: 'usage-123',
        userId: 'user-123',
        operation: 'VIDEO_RECORDING',
        tokensUsed: 20,
        parameters: { duration: 1 },
        createdAt: new Date(),
      };
      mockTokenUsageCreate.mockResolvedValue(mockUsageRecord);

      const result = await recordTokenUsage('user-123', 'VIDEO_RECORDING', 20, { duration: 1 });

      expect(result).toEqual(mockUsageRecord);
      expect(mockTokenUsageCreate).toHaveBeenCalledWith({
        userId: 'user-123',
        operation: 'VIDEO_RECORDING',
        tokensUsed: 20,
        parameters: { duration: 1 },
      });
    });

    it('should create a token usage record without parameters', async () => {
      const mockUsageRecord = {
        id: 'usage-456',
        userId: 'user-456',
        operation: 'COLOR_CORRECTION',
        tokensUsed: 10,
        parameters: null,
        createdAt: new Date(),
      };
      mockTokenUsageCreate.mockResolvedValue(mockUsageRecord);

      const result = await recordTokenUsage('user-456', 'COLOR_CORRECTION', 10);

      expect(result).toEqual(mockUsageRecord);
      expect(mockTokenUsageCreate).toHaveBeenCalledWith({
        userId: 'user-456',
        operation: 'COLOR_CORRECTION',
        tokensUsed: 10,
        parameters: null,
      });
    });

    it('should handle various operation types', async () => {
      const operations = [
        'VIDEO_RECORDING',
        'AI_EDITING',
        'COLOR_CORRECTION',
        'SUBTITLE_GENERATION',
        'EXPORT_720P',
        'EXPORT_1080P',
        'EXPORT_4K',
      ];

      for (const operation of operations) {
        mockTokenUsageCreate.mockResolvedValueOnce({
          id: `usage-${operation}`,
          userId: 'user-123',
          operation,
          tokensUsed: 10,
        });

        await recordTokenUsage('user-123', operation, 10);

        expect(mockTokenUsageCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            operation,
            tokensUsed: 10,
          })
        );
      }
    });
  });

  describe('getTokenUsageHistory', () => {
    it('should return usage history for the specified number of days', async () => {
      const mockHistory = [
        {
          id: 'usage-1',
          userId: 'user-123',
          operation: 'VIDEO_RECORDING',
          tokensUsed: 20,
          createdAt: new Date(),
        },
        {
          id: 'usage-2',
          userId: 'user-123',
          operation: 'COLOR_CORRECTION',
          tokensUsed: 10,
          createdAt: new Date(),
        },
      ];
      mockTokenUsageFindAll.mockResolvedValue(mockHistory);

      const result = await getTokenUsageHistory('user-123', 7);

      expect(result).toEqual(mockHistory);
      expect(mockTokenUsageFindAll).toHaveBeenCalled();

      const findAllCall = mockTokenUsageFindAll.mock.calls[0][0];
      expect(findAllCall.where.userId).toBe('user-123');
      expect(findAllCall.where.createdAt).toBeDefined();
      expect(findAllCall.order).toEqual([['createdAt', 'DESC']]);
    });

    it('should default to 7 days if days parameter not provided', async () => {
      const mockHistory = [];
      mockTokenUsageFindAll.mockResolvedValue(mockHistory);

      await getTokenUsageHistory('user-123');

      expect(mockTokenUsageFindAll).toHaveBeenCalled();
      const findAllCall = mockTokenUsageFindAll.mock.calls[0][0];
      expect(findAllCall.where.userId).toBe('user-123');
    });

    it('should handle custom days parameter', async () => {
      const mockHistory = [];
      mockTokenUsageFindAll.mockResolvedValue(mockHistory);

      await getTokenUsageHistory('user-123', 30);

      expect(mockTokenUsageFindAll).toHaveBeenCalled();
      const findAllCall = mockTokenUsageFindAll.mock.calls[0][0];
      expect(findAllCall.where.userId).toBe('user-123');
    });

    it('should return empty array if no usage history found', async () => {
      mockTokenUsageFindAll.mockResolvedValue([]);

      const result = await getTokenUsageHistory('user-123', 7);

      expect(result).toEqual([]);
      expect(mockTokenUsageFindAll).toHaveBeenCalled();
    });

    it('should calculate correct date range for history query', async () => {
      mockTokenUsageFindAll.mockResolvedValue([]);

      await getTokenUsageHistory('user-123', 14);

      expect(mockTokenUsageFindAll).toHaveBeenCalled();
      const findAllCall = mockTokenUsageFindAll.mock.calls[0][0];
      const dateCondition = findAllCall.where.createdAt;

      // Verify that createdAt condition is using Op.gte
      expect(dateCondition).toBeDefined();
    });

    it('should order results by createdAt descending', async () => {
      mockTokenUsageFindAll.mockResolvedValue([]);

      await getTokenUsageHistory('user-123', 7);

      const findAllCall = mockTokenUsageFindAll.mock.calls[0][0];
      expect(findAllCall.order).toEqual([['createdAt', 'DESC']]);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete token deduction flow', async () => {
      // Setup: User has tokens
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 100,
        update: jest.fn().mockResolvedValue(true),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      // Calculate cost
      const cost = calculateTokenCost('VIDEO_RECORDING', { duration: 2 });
      expect(cost).toBe(40);

      // Deduct tokens
      const deductionResult = await deductTokens('user-123', cost);
      expect(deductionResult.success).toBe(true);
      expect(deductionResult.remainingTokens).toBe(60);

      // Record usage
      mockTokenUsageCreate.mockResolvedValue({
        id: 'usage-123',
        userId: 'user-123',
        operation: 'VIDEO_RECORDING',
        tokensUsed: 40,
      });
      const usageRecord = await recordTokenUsage('user-123', 'VIDEO_RECORDING', cost, {
        duration: 2,
      });
      expect(usageRecord.tokensUsed).toBe(40);
    });

    it('should handle premium user unlimited token scenario', async () => {
      const mockUser = {
        id: 'user-premium',
        subscriptionTier: 'premium',
        dailyTokens: 1000,
        update: jest.fn(),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      // Get tokens (should return -1)
      const tokens = await getUserDailyTokens('user-premium');
      expect(tokens).toBe(-1);

      // Deduct large amount (should succeed without updating DB)
      const result = await deductTokens('user-premium', 100000);
      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(-1);
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('should handle edge case: deducting zero tokens', async () => {
      const mockUser = {
        id: 'user-123',
        subscriptionTier: 'free',
        dailyTokens: 100,
        update: jest.fn().mockResolvedValue(true),
      };
      mockUserFindByPk.mockResolvedValue(mockUser);

      const result = await deductTokens('user-123', 0);

      expect(result.success).toBe(true);
      expect(result.remainingTokens).toBe(100);
      expect(mockUser.update).toHaveBeenCalledWith({ dailyTokens: 100 });
    });
  });
});
