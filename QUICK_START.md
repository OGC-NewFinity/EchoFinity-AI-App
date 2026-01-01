# EchoFinity Quick Start Guide

This guide provides quick commands to get each part of the stack running.

## Prerequisites

- Node.js 18+ 
- Python 3.10+
- PostgreSQL 14+ (for backend)
- Redis 6+ (for backend)
- React Native CLI or Expo CLI (for mobile)

---

## 🟩 Part 1: Mobile App — React Native

**Location**: Project root (not in `mobile/` subdirectory)

```bash
# From project root
npm install

# Start Metro bundler
npm start

# Run on Android (in separate terminal)
npm run android

# Run on iOS (macOS only, in separate terminal)
cd ios && pod install && cd ..
npm run ios
```

**Expected**: App launches with OnboardingScreen, prompts for camera/mic permissions

---

## 🟩 Part 2: Backend API — Node.js

**Location**: `backend/` directory

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database and Redis credentials

# Test database connection
npm run migrate

# Start development server
npm run dev
```

**Expected**: Server runs on http://localhost:4000  
**Health Check**: http://localhost:4000/api/health

---

## 🟩 Part 3: AI Service — Python FastAPI

**Location**: `ai-service/` directory

```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt

# (Optional) Set up environment
cp .env.example .env

# Start AI service
python app.py
```

**Expected**: Service runs on http://localhost:5000  
**Health Check**: http://localhost:5000/health

---

## Testing All Services

### Backend Health Check
```bash
curl http://localhost:4000/api/health
```

### AI Service Health Check
```bash
curl http://localhost:5000/health
```

### Mobile App
- Should launch without red screen
- Should display OnboardingScreen initially
- Should prompt for permissions when accessing camera/mic

---

## Troubleshooting

### Backend Issues
- **Database connection error**: Ensure PostgreSQL is running and credentials in `.env` are correct
- **Redis connection error**: Ensure Redis is running (optional, app can work without it)
- **Port 4000 in use**: Change `PORT` in `.env`

### AI Service Issues
- **Python not found**: Ensure Python 3.10+ is installed and in PATH
- **Import errors**: Run `pip install -r requirements.txt`
- **Port 5000 in use**: Change `PORT` in `.env`

### Mobile App Issues
- **Red screen**: Check Metro bundler is running (`npm start`)
- **Build errors**: Run `npm install` again
- **iOS pod errors**: Run `cd ios && pod install && cd ..`
- **Android build errors**: Ensure Android Studio and SDK are properly configured

---

For detailed validation report, see [VALIDATION_REPORT.md](./VALIDATION_REPORT.md)
