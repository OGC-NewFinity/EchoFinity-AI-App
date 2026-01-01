module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/*.e2e.test.js'],
  collectCoverageFrom: [
    'services/**/*.js',
    'controllers/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000, // 10 seconds timeout for integration tests
};
