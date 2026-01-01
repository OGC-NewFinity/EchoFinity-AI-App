module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['node'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off', // Allow console.log for server-side logging
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
    'node/no-unpublished-require': 'off', // Allow dev dependencies in tests
    'node/no-extraneous-require': 'off', // Allow test frameworks
  },
  ignorePatterns: ['node_modules/', 'coverage/', '*.config.js', 'tests/setup.js'],
};
