# CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## CI Workflow (ci.yml)

### Triggers

- **Pull Requests** (to `main` or `develop`):
  - Unit tests (Node.js 18.x and 20.x)
  - Lint (ESLint + Prettier format check)

- **Push to `main` or `develop`**:
  - Unit tests (Node.js 18.x and 20.x)
  - Integration tests (Node.js 20.x only)
  - Lint (ESLint + Prettier format check)
  - Quality gate (coverage validation)

### Jobs

#### 1. Unit Tests
- Runs on multiple Node.js versions (18.x, 20.x)
- Uses `npm run test:unit` (excludes integration tests)
- Uploads coverage reports to Codecov (Node 20.x only)

#### 2. Integration Tests
- Runs only on push to `main`
- Uses `npm run test -- tests/integration`
- All external services are mocked (no DB/Redis/AI service required)
- Uploads test artifacts

#### 3. Lint
- Runs ESLint with `npm run lint`
- Checks code formatting with `npm run format:check`
- Fails CI if any linting or formatting issues found

#### 4. Quality Gate
- Runs full test suite with coverage
- Validates coverage thresholds (85% branches, 90% functions/lines/statements)
- Fails if any previous job failed

### Environment Variables

- `NODE_ENV=test` (always set)
- `JWT_SECRET` (from GitHub secrets or defaults to test secret)

### Quality Gates

CI will fail if:
- ❌ Any test fails
- ❌ Coverage thresholds not met
- ❌ ESLint errors found
- ❌ Prettier formatting issues
- ❌ Any job exits with non-zero status

### Future CD Jobs

The workflow includes commented-out jobs for future deployment:
- Docker build
- AWS Lambda deployment

These can be enabled when deployment infrastructure is ready.

## Local Testing

To test CI jobs locally:

```bash
cd backend

# Run unit tests
npm run test:unit

# Run integration tests
npm run test -- tests/integration

# Run linting
npm run lint

# Check formatting
npm run format:check

# Full coverage check
npm run test:coverage
```

## Troubleshooting

### Tests failing in CI but passing locally
- Ensure all dependencies are committed to `package-lock.json`
- Check that environment variables match `.env.test.example`
- Verify Node.js version compatibility

### Lint/format failures
- Run `npm run lint:fix` to auto-fix ESLint issues
- Run `npm run format` to auto-format code
- Commit the changes

### Coverage threshold failures
- Review coverage report: `npm run test:coverage`
- Add tests for uncovered code paths
- Adjust thresholds in `jest.config.js` if necessary
