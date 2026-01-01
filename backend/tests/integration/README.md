# Integration & E2E Tests

Comprehensive integration and end-to-end tests for the EchoFinity backend API using Jest and Supertest.

## Overview

These tests validate full API flows end-to-end, ensuring services, controllers, middleware, and token logic work together under realistic conditions.

## Test Files

- **`app.test.js`** - Test app bootstrap with all mocks configured
- **`videoFlow.e2e.test.js`** - Full video pipeline flow tests
- **`exportFlow.e2e.test.js`** - Export flow with token deduction tests

## Mocking Strategy

All external dependencies are fully mocked:

### External Services

- **AI Services** (`services/aiService.js`): All AI functions return fixed, predictable responses
- **Database**: Sequelize models mocked with Jest spies
- **File System**: `fs` module mocked for file operations
- **Queue System**: Bull queue mocked to prevent actual job processing
- **Redis**: Connection mocked to prevent external dependencies
- **FFmpeg**: Child process execution mocked

### Authentication

- JWT tokens mocked with test user credentials
- Auth middleware validated through actual token verification flow

## Running Tests

```bash
# Run all integration tests
npm run test -- tests/integration

# Run specific test file
npm run test -- tests/integration/videoFlow.e2e.test.js

# Run with coverage
npm run test:coverage -- tests/integration

# Run in watch mode
npm run test:watch -- tests/integration
```

## Test Scenarios

### Video Flow E2E Tests (`videoFlow.e2e.test.js`)

1. **Authentication Flow**
   - Reject requests without token
   - Accept requests with valid Bearer token
   - Reject invalid token format

2. **Project Creation → Export Flow**
   - Create project successfully
   - Export video with proper ownership verification
   - Verify project ownership before export

3. **AI Processing Flow**
   - Call AI services (scene detection, subtitles, color correction)
   - Handle AI service partial failures gracefully

4. **Export Status Check**
   - Return export job status
   - Reject status check for non-existent jobs

5. **Unauthorized Access**
   - Reject all protected routes without token

### Export Flow E2E Tests (`exportFlow.e2e.test.js`)

1. **Successful Export with Token Deduction**
   - Deduct tokens for free tier users
   - Calculate correct token cost for different resolutions

2. **Insufficient Tokens**
   - Block export when user has insufficient tokens

3. **Premium User Unlimited Tokens**
   - Allow unlimited exports for premium users
   - Allow unlimited exports for enterprise users

4. **Invalid Export Parameters**
   - Reject invalid format
   - Reject invalid resolution
   - Reject missing/invalid projectId

5. **Token Usage Recording**
   - Record token usage after successful export

6. **Export Job Status with Token Verification**
   - Return export status for completed jobs
   - Verify project ownership when checking status

## CI/CD Compatibility

These tests are designed to run headless and don't require:

- PostgreSQL database
- Redis server
- FFmpeg installation
- Python AI service
- External network access

All dependencies are mocked, making tests fast and reliable in CI environments.

## Coverage Goals

- **Integration Scope**: Routes, Controllers, Service interactions, Middleware chaining
- **Coverage Target**: Stability over percentages - all critical paths executed at least once
- **No unhandled promise rejections**
- **No real external calls**

## Environment Variables

Test environment variables are set in `tests/setup.js`:

- `NODE_ENV=test`
- `JWT_SECRET` (defaults to test secret)
- Database and Redis configs (mocked, not used)

See `env.test.example` in the backend root for all available test environment variables.

## Notes

- Tests use isolated test data per test case
- Mocks are reset between tests
- No real database connections or file system operations
- All async operations are properly awaited
- Test timeout set to 10 seconds for integration tests
