/**
 * Token Service
 * Manages token consumption, daily limits, and usage tracking
 */

const { User } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Token cost configuration
const TOKEN_COSTS = {
  VIDEO_RECORDING: 20, // per minute
  AI_EDITING: 40, // per video (average of 30-50)
  COLOR_CORRECTION: 10,
  SUBTITLE_GENERATION: 15,
  EXPORT_720P: 5,
  EXPORT_1080P: 10,
  EXPORT_4K: 20,
  CLOUD_STORAGE: 1, // per GB/month
  DEFAULT: 10, // fallback for unknown operations
};

// Daily token allocation by tier
const DAILY_TOKEN_ALLOCATION = {
  free: 100,
  pro: 500,
  premium: -1, // unlimited
  enterprise: -1, // unlimited
};

// Get TokenUsage model (dynamic require to avoid circular dependency)
let TokenUsage;
function getTokenUsageModel() {
  if (!TokenUsage) {
    const TokenUsageModel = require('../models/TokenUsage');
    TokenUsage = TokenUsageModel(sequelize, require('sequelize').DataTypes);
  }
  return TokenUsage;
}

/**
 * Get user's current daily token balance based on subscription tier
 * @param {string} userId - User ID
 * @returns {Promise<number>} Current daily token balance
 * @throws {Error} If user not found
 */
async function getUserDailyTokens(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Premium and Enterprise tiers have unlimited tokens
  if (user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise') {
    return -1; // -1 represents unlimited
  }

  return (
    user.dailyTokens || DAILY_TOKEN_ALLOCATION[user.subscriptionTier] || DAILY_TOKEN_ALLOCATION.free
  );
}

/**
 * Calculate token cost for an operation
 * @param {string} operation - Operation type (e.g., 'VIDEO_RECORDING', 'EXPORT_1080P')
 * @param {object} parameters - Optional parameters (e.g., { duration: 2 } for minutes)
 * @returns {number} Token cost
 */
function calculateTokenCost(operation, parameters = {}) {
  const baseCost = TOKEN_COSTS[operation] || TOKEN_COSTS.DEFAULT;

  // Handle parameter-based calculations
  if (operation === 'VIDEO_RECORDING' && parameters.duration) {
    // duration in minutes
    return baseCost * Math.ceil(parameters.duration);
  }

  if (operation === 'AI_EDITING' && parameters.complexity) {
    // complexity: 'low' = 30, 'medium' = 40, 'high' = 50
    const complexityMap = { low: 30, medium: 40, high: 50 };
    return complexityMap[parameters.complexity] || baseCost;
  }

  if (operation === 'CLOUD_STORAGE' && parameters.gb) {
    return baseCost * Math.ceil(parameters.gb);
  }

  return baseCost;
}

/**
 * Deduct tokens from user's balance
 * @param {string} userId - User ID
 * @param {number} amount - Amount of tokens to deduct
 * @returns {Promise<{success: boolean, remainingTokens: number}>}
 * @throws {Error} If insufficient tokens or user not found
 */
async function deductTokens(userId, amount) {
  if (amount < 0) {
    throw new Error('Token amount must be positive');
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Premium and Enterprise tiers have unlimited tokens
  if (user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise') {
    return {
      success: true,
      remainingTokens: -1, // unlimited
    };
  }

  const currentBalance =
    user.dailyTokens ||
    DAILY_TOKEN_ALLOCATION[user.subscriptionTier] ||
    DAILY_TOKEN_ALLOCATION.free;

  if (currentBalance < amount) {
    throw new Error('Insufficient tokens');
  }

  const newBalance = currentBalance - amount;

  await user.update({ dailyTokens: newBalance });

  return {
    success: true,
    remainingTokens: newBalance,
  };
}

/**
 * Refresh daily tokens for all users (should be called at midnight)
 * Premium and Enterprise users are skipped as they have unlimited tokens
 * @returns {Promise<{usersRefreshed: number}>}
 */
async function refreshDailyTokens() {
  const result = await User.update(
    {
      dailyTokens: sequelize.literal(`
        CASE 
          WHEN "subscriptionTier" = 'free' THEN ${DAILY_TOKEN_ALLOCATION.free}
          WHEN "subscriptionTier" = 'pro' THEN ${DAILY_TOKEN_ALLOCATION.pro}
          ELSE "dailyTokens"
        END
      `),
    },
    {
      where: {
        subscriptionTier: {
          [Op.in]: ['free', 'pro'],
        },
      },
    }
  );

  return {
    usersRefreshed: result[0], // Sequelize update returns [affectedCount, affectedRows]
  };
}

/**
 * Record token usage in history
 * @param {string} userId - User ID
 * @param {string} operation - Operation type
 * @param {number} tokensUsed - Number of tokens used
 * @param {object} parameters - Optional parameters
 * @returns {Promise<object>} Created usage record
 */
async function recordTokenUsage(userId, operation, tokensUsed, parameters = null) {
  const TokenUsage = getTokenUsageModel();

  const usageRecord = await TokenUsage.create({
    userId,
    operation,
    tokensUsed,
    parameters,
  });

  return usageRecord;
}

/**
 * Get token usage history for a user
 * @param {string} userId - User ID
 * @param {number} days - Number of days to look back (default: 7)
 * @returns {Promise<Array>} Array of usage records
 */
async function getTokenUsageHistory(userId, days = 7) {
  const TokenUsage = getTokenUsageModel();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const usageHistory = await TokenUsage.findAll({
    where: {
      userId,
      createdAt: {
        [Op.gte]: startDate,
      },
    },
    order: [['createdAt', 'DESC']],
  });

  return usageHistory;
}

module.exports = {
  getUserDailyTokens,
  calculateTokenCost,
  deductTokens,
  refreshDailyTokens,
  recordTokenUsage,
  getTokenUsageHistory,
  // Export constants for testing
  TOKEN_COSTS,
  DAILY_TOKEN_ALLOCATION,
};
