# EchoFinity Backend API

Node.js + Express + Sequelize backend API for EchoFinity video editing platform.

[![CI](https://github.com/ogcnewfinity/echofinity/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ogcnewfinity/echofinity/actions/workflows/ci.yml)

## Features

- RESTful API for video project management
- JWT-based authentication
- Token-based usage tracking
- Video export with AI processing queue
- PostgreSQL database with Sequelize ORM
- Redis for queue management
- Comprehensive test coverage (unit + integration)

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Queue**: Bull (Redis-backed)
- **Testing**: Jest + Supertest
- **Linting**: ESLint
- **Formatting**: Prettier

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 12+
- Redis 6+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure database and Redis in .env file
```

### Environment Variables

See `.env.example` for required environment variables:

- `JWT_SECRET` - Secret key for JWT token signing
- `DB_*` - PostgreSQL database credentials
- `REDIS_*` - Redis connection details
- `AI_SERVICE_URL` - Python AI service endpoint

### Development

```bash
# Start development server
npm run dev

# Run database migrations
npm run migrate

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format
```

## API Documentation

### Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `POST /api/videos/export` - Export video
- `GET /api/export/:jobId` - Get export job status
- `GET /api/health` - Health check

## Testing

### Unit Tests

```bash
npm run test:unit
```

Tests for individual functions and modules.

### Integration Tests

```bash
npm run test -- tests/integration
```

End-to-end tests for full API flows.

### Test Coverage

```bash
npm run test:coverage
```

Coverage thresholds:

- Branches: 85%
- Functions: 90%
- Lines: 90%
- Statements: 90%

## CI/CD

GitHub Actions CI pipeline runs automatically on:

- Pull requests (unit tests + lint)
- Push to main (full test suite + integration tests)

See `.github/workflows/ci.yml` for details.

## Project Structure

```
backend/
├── config/          # Database, Redis, queue configuration
├── controllers/     # Request handlers
├── middleware/      # Auth, validation, error handling
├── models/          # Sequelize models
├── routes/          # Express route definitions
├── services/        # Business logic (AI, tokens)
├── jobs/            # Background job processors
├── tests/           # Test files
│   ├── integration/ # E2E tests
│   └── setup.js     # Test configuration
└── server.js        # Application entry point
```

## License

Proprietary - OGC NewFinity
