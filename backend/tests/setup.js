/**
 * Jest Global Setup
 * Runs before all tests to configure test environment
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt';
process.env.DB_NAME = process.env.DB_NAME || 'echofinity_test';
process.env.REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

// Suppress console logs during tests (optional - remove if you want to see logs)
// const originalConsoleLog = console.log;
// console.log = jest.fn();

// Global test teardown
afterAll(async () => {
  // Cleanup if needed
  jest.clearAllMocks();
});
