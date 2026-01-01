---
title: EchoFinity - Tech Stack & Development Guide (JavaScript)
version: 1.0
updated: 2025
status: active
---

# EchoFinity - Tech Stack & Development Guide (JavaScript)

**Application**: EchoFinity - AI-Powered Video Creation & Editing Platform  
**Developer**: OGC NewFinity  
**Primary Language**: JavaScript (Node.js for backend, React Native for mobile)  
**Version**: 1.0

---

## Architecture Overview

EchoFinity follows a modern, scalable architecture with four primary layers:

1. **Mobile Frontend** (iOS & Android)
2. **Backend API & Orchestration**
3. **AI Processing & Media Services**
4. **Cloud Infrastructure & Storage**

Each layer uses JavaScript-based technologies optimized for rapid development and production-grade performance.

---

## Layer 1: Mobile Frontend

### Recommended Framework: React Native

**Why React Native?**
- Single JavaScript codebase for both iOS and Android
- 60+ FPS performance with native compilation
- Hot reload for rapid iteration during development
- Excellent support for audio/video processing
- Large ecosystem of libraries for media handling
- Familiar to JavaScript developers (no need to learn Swift or Kotlin)

**Primary Language: JavaScript (ES6+)**

JavaScript provides the foundation for React Native development with modern features including async/await, destructuring, arrow functions, and modules.

**Key Dependencies for React Native**

| Package | Purpose | Version |
|---------|---------|---------|
| `react-native` | Core framework | ^0.73.0 |
| `react-native-camera` | Camera access and recording | ^4.2.1 |
| `react-native-video` | Video playback and preview | ^5.2.1 |
| `react-native-audio-recorder-player` | Audio recording and playback | ^3.5.3 |
| `react-native-waveform-view` | Waveform visualization | ^1.0.0 |
| `react-native-gesture-handler` | Gesture recognition | ^2.14.0 |
| `react-native-reanimated` | Smooth animations | ^3.6.0 |
| `@react-navigation/native` | Navigation between screens | ^6.1.9 |
| `axios` | HTTP client for API communication | ^1.6.0 |
| `zustand` | State management (lightweight) | ^4.4.0 |
| `react-native-mmkv` | Local storage (fast, efficient) | ^2.10.0 |
| `react-native-fs` | File system access | ^2.20.0 |
| `react-native-video-processing` | Video editing and processing | ^1.0.0 |
| `react-native-ffmpeg` | FFmpeg integration for video processing | ^0.5.0 |
| `react-native-firebase` | Firebase integration | ^18.0.0 |
| `react-native-stripe-sdk` | Stripe payment integration | ^0.37.0 |

**Project Structure**

```
EchoFinity/
├── app/
│   ├── screens/
│   │   ├── OnboardingScreen.js
│   │   ├── RecordingScreen.js
│   │   ├── EditingScreen.js
│   │   ├── ExportScreen.js
│   │   └── LibraryScreen.js
│   ├── components/
│   │   ├── VideoRecorder.js
│   │   ├── Timeline.js
│   │   ├── WaveformDisplay.js
│   │   ├── EffectsPanel.js
│   │   └── ExportOptions.js
│   ├── services/
│   │   ├── api.js
│   │   ├── videoService.js
│   │   ├── audioService.js
│   │   ├── storageService.js
│   │   └── tokenService.js
│   ├── store/
│   │   ├── projectStore.js
│   │   ├── authStore.js
│   │   └── tokenStore.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── App.js
│   └── index.js
├── ios/
├── android/
├── package.json
└── app.json
```

**Development Workflow in React Native**

1. **Use Expo for rapid development** (optional, but recommended for faster iteration)
   ```bash
   npx create-expo-app EchoFinity
   cd EchoFinity
   npm start
   ```

2. **Or use React Native CLI for native modules**
   ```bash
   npx react-native init EchoFinity
   cd EchoFinity
   npm start
   ```

3. **Hot reload during development** - Changes appear instantly without rebuilding

4. **Test on physical devices** - Use Expo Go app or native emulators

---

## Layer 2: Backend API

### Recommended Framework: Node.js + Express

**Why Node.js + Express?**
- JavaScript across frontend and backend (single language)
- Non-blocking I/O perfect for handling concurrent requests
- Excellent performance for real-time operations
- Massive npm ecosystem with thousands of packages
- Easy deployment on AWS Lambda, Heroku, or traditional servers
- Rapid development with minimal boilerplate

**Primary Language: JavaScript (ES6+)**

JavaScript on the backend provides the same modern features as the frontend, enabling code sharing and consistent patterns.

**Key Dependencies**

| Package | Purpose | Version |
|---------|---------|---------|
| `express` | Web framework | ^4.18.0 |
| `dotenv` | Environment variable management | ^16.3.0 |
| `axios` | HTTP client for external APIs | ^1.6.0 |
| `jsonwebtoken` | JWT authentication | ^9.1.0 |
| `bcryptjs` | Password hashing | ^2.4.3 |
| `multer` | File upload handling | ^1.4.5 |
| `sharp` | Image processing | ^0.32.0 |
| `fluent-ffmpeg` | Video processing wrapper | ^2.1.2 |
| `aws-sdk` | AWS service integration | ^2.1500.0 |
| `bull` | Job queue for async processing | ^4.11.0 |
| `redis` | Caching and session management | ^4.6.0 |
| `mongoose` | MongoDB ODM (if using MongoDB) | ^7.5.0 |
| `pg` | PostgreSQL client | ^8.11.0 |
| `cors` | Cross-origin resource sharing | ^2.8.5 |
| `helmet` | Security headers | ^7.1.0 |
| `express-validator` | Input validation | ^7.0.0 |
| `winston` | Logging | ^3.11.0 |
| `jest` | Testing framework | ^29.7.0 |
| `supertest` | HTTP testing | ^6.3.3 |

**Project Structure**

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── videos.js
│   │   ├── export.js
│   │   └── subscription.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── videoController.js
│   │   └── exportController.js
│   ├── services/
│   │   ├── videoService.js
│   │   ├── aiService.js
│   │   ├── storageService.js
│   │   ├── tokenService.js
│   │   └── subscriptionService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Video.js
│   │   └── Subscription.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── config/
│   │   ├── database.js
│   │   ├── aws.js
│   │   └── stripe.js
│   ├── jobs/
│   │   ├── videoProcessing.js
│   │   └── tokenRefresh.js
│   └── index.js
├── tests/
│   ├── auth.test.js
│   ├── videos.test.js
│   └── export.test.js
├── .env.example
├── package.json
└── README.md
```

**Example Express Server Setup**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const videoRoutes = require('./routes/videos');

dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // JSON parsing
app.use(express.urlencoded({ extended: true })); // URL encoding

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/videos', videoRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

---

## Layer 3: AI Processing & Media Services

### Video Analysis & Processing: Python + Node.js Wrapper

**Why Python for AI?**
- Rich libraries for audio/video analysis (librosa, OpenCV, moviepy)
- Excellent for machine learning (TensorFlow, PyTorch)
- Strong data science ecosystem
- Easy integration with Node.js via child processes or APIs

**Python Dependencies**

| Package | Purpose | Version |
|---------|---------|---------|
| `librosa` | Audio analysis (BPM, key detection) | ^0.10.0 |
| `pydub` | Audio processing | ^0.25.1 |
| `opencv-python` | Video and image processing | ^4.8.0 |
| `moviepy` | Video editing and composition | ^1.0.3 |
| `numpy` | Numerical computing | ^1.24.0 |
| `scipy` | Scientific computing | ^1.11.0 |
| `scikit-learn` | Machine learning | ^1.3.0 |
| `tensorflow` | Deep learning (optional, for advanced features) | ^2.13.0 |
| `flask` | Web framework for Python API | ^3.0.0 |
| `flask-cors` | CORS support for Flask | ^4.0.0 |
| `python-dotenv` | Environment variables | ^1.0.0 |

**Node.js Wrapper for Python Services**

```javascript
const { spawn } = require('child_process');

async function analyzeVideo(videoPath) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['./scripts/analyze_video.py', videoPath]);
    let data = '';

    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`));
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
}

module.exports = { analyzeVideo };
```

**Python Analysis Script Example**

```python
import librosa
import json
import sys

def analyze_video(video_path):
    # Load audio from video
    y, sr = librosa.load(video_path, sr=None)
    
    # BPM detection
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    
    # Spectral analysis
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    
    # Zero crossing rate (noisiness)
    zcr = librosa.feature.zero_crossing_rate(y)
    
    return {
        "bpm": float(tempo),
        "beats": beats.tolist(),
        "spectral_centroid": float(spectral_centroid.mean()),
        "zcr": float(zcr.mean()),
        "duration": float(librosa.get_duration(y=y, sr=sr))
    }

if __name__ == "__main__":
    video_path = sys.argv[1]
    result = analyze_video(video_path)
    print(json.dumps(result))
```

### Video Processing: FFmpeg + Node.js

**FFmpeg Integration**

```javascript
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

async function generateVideo(clips, audioFile, outputPath) {
  return new Promise((resolve, reject) => {
    let command = ffmpeg();

    // Add video clips
    clips.forEach((clip) => {
      command.input(clip.path)
        .inputOptions([`-ss ${clip.start}`, `-t ${clip.duration}`]);
    });

    // Add audio
    command.input(audioFile);

    // Concat filter
    const filterComplex = clips.map((_, i) => `[${i}:v]`).join('') + 
                          `concat=n=${clips.length}:v=1:a=0[v]`;

    command
      .complexFilter(filterComplex, ['v'])
      .output(outputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
        '-c:a aac',
        '-b:a 128k'
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

module.exports = { generateVideo };
```

### AI API Integration

**Runway API Integration Example**

```javascript
const axios = require('axios');

async function generateVideoWithAI(prompt, style, duration) {
  try {
    const response = await axios.post(
      'https://api.runwayml.com/v1/generate',
      {
        prompt,
        style,
        duration,
        format: 'mp4'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.video_url;
  } catch (error) {
    console.error('Runway API error:', error);
    throw error;
  }
}

module.exports = { generateVideoWithAI };
```

---

## Layer 4: Database

### Primary Database: PostgreSQL

**Why PostgreSQL?**
- Relational data model suits video projects and user data
- JSONB support for flexible metadata storage
- Excellent performance and scalability
- Strong ecosystem and community support
- Free and open-source

**Node.js ORM: Sequelize or Prisma**

**Using Sequelize (Recommended for JavaScript developers)**

```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subscriptionTier: {
    type: DataTypes.ENUM('free', 'pro', 'premium', 'enterprise'),
    defaultValue: 'free'
  },
  dailyTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
});

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  clips: DataTypes.JSONB,
  metadata: DataTypes.JSONB,
  status: {
    type: DataTypes.ENUM('draft', 'editing', 'processing', 'completed'),
    defaultValue: 'draft'
  }
});

User.hasMany(Project);
Project.belongsTo(User);

module.exports = { sequelize, User, Project };
```

### Caching Layer: Redis

**Redis Integration**

```javascript
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function cacheProjectData(projectId, data) {
  await client.setEx(`project:${projectId}`, 3600, JSON.stringify(data));
}

async function getCachedProjectData(projectId) {
  const cached = await client.get(`project:${projectId}`);
  return cached ? JSON.parse(cached) : null;
}

module.exports = { client, cacheProjectData, getCachedProjectData };
```

---

## Layer 5: Cloud Infrastructure

### Recommended: AWS

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Lambda** | Serverless compute for API endpoints | Node.js runtime |
| **S3** | Media storage (videos, clips, exports) | AWS SDK |
| **RDS** | PostgreSQL database | Sequelize ORM |
| **CloudFront** | CDN for video delivery | AWS SDK |
| **SQS** | Message queue for async jobs | Bull + AWS SDK |
| **EC2** | Video rendering servers (optional) | Docker + Node.js |
| **Cognito** | User authentication | AWS SDK |
| **SNS** | Push notifications | AWS SDK |

**AWS SDK Integration**

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function uploadVideoToS3(filePath, fileName) {
  const fileContent = require('fs').readFileSync(filePath);

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `videos/${fileName}`,
    Body: fileContent,
    ContentType: 'video/mp4'
  };

  return s3.upload(params).promise();
}

async function getVideoUrl(fileName) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `videos/${fileName}`,
    Expires: 3600 // URL valid for 1 hour
  };

  return s3.getSignedUrl('getObject', params);
}

module.exports = { uploadVideoToS3, getVideoUrl };
```

---

## Development Workflow in Cursor

### 1. Project Setup

**Initialize React Native Project**
```bash
npx react-native init EchoFinity
cd EchoFinity
npm install
```

**Initialize Backend Project**
```bash
mkdir backend
cd backend
npm init -y
npm install express dotenv axios jsonwebtoken bcryptjs multer sharp fluent-ffmpeg aws-sdk bull redis
npm install --save-dev jest supertest nodemon
```

### 2. Using Cursor for Development

**Cursor Prompts for React Native**

- "Generate a React Native component for video recording with real-time preview"
- "Create a timeline component for video editing with drag-and-drop reordering"
- "Write a waveform visualization component using react-native-reanimated"
- "Generate a state management store using Zustand for managing video projects"

**Cursor Prompts for Backend**

- "Create an Express middleware for JWT authentication"
- "Generate a service for uploading videos to AWS S3"
- "Write a controller for handling video export requests"
- "Create a job queue for processing videos asynchronously using Bull"

**Cursor Prompts for Python**

- "Write a Python script using librosa to detect BPM and beat markers from audio"
- "Generate a function to analyze video clips for optimal cut points"
- "Create a color grading function using OpenCV"

### 3. Testing

**React Native Testing**

```bash
npm test
```

**Backend Testing with Jest**

```bash
npm test -- --watch
```

**Example Test**

```javascript
const request = require('supertest');
const app = require('../src/index');

describe('POST /api/videos/export', () => {
  it('should export a video with specified quality', async () => {
    const response = await request(app)
      .post('/api/videos/export')
      .set('Authorization', 'Bearer token')
      .send({
        projectId: '123',
        quality: '1080p'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('videoUrl');
  });
});
```

### 4. Deployment

**Deploy React Native to App Stores**

```bash
# iOS
cd ios
pod install
cd ..
npx react-native run-ios --configuration Release

# Android
npx react-native run-android --variant=release
```

**Deploy Backend to AWS Lambda**

```bash
# Package the application
npm run build
zip -r lambda-function.zip dist node_modules

# Deploy using AWS CLI
aws lambda update-function-code \
  --function-name echofinity-api \
  --zip-file fileb://lambda-function.zip
```

---

## Complete Tech Stack Summary

| Layer | Technology | Language | Purpose |
|-------|-----------|----------|---------|
| **Mobile Frontend** | React Native | JavaScript | iOS & Android app |
| **Backend API** | Node.js + Express | JavaScript | REST API & orchestration |
| **State Management** | Zustand | JavaScript | Client-side state |
| **Video Analysis** | Python + Librosa | Python | BPM, beat detection, analysis |
| **Video Processing** | FFmpeg + Node.js | JavaScript | Video rendering & encoding |
| **Database** | PostgreSQL + Sequelize | JavaScript (ORM) | Data persistence |
| **Caching** | Redis | Any | Performance optimization |
| **Cloud** | AWS | YAML/JSON | Infrastructure |
| **Testing** | Jest + Supertest | JavaScript | Quality assurance |
| **Payments** | Stripe | JavaScript | Subscription management |

---

## Environment Variables (.env)

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=echofinity
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET=echofinity-videos

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d

# Stripe
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_publishable_key

# API Keys
RUNWAY_API_KEY=your_runway_key
KLING_API_KEY=your_kling_key

# Server
PORT=3000
NODE_ENV=development
```

---

## Learning Resources

### JavaScript & Node.js
- **Node.js Official Docs**: https://nodejs.org/docs/
- **Express.js Guide**: https://expressjs.com/
- **JavaScript.info**: https://javascript.info/

### React Native
- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **React Native Community**: https://github.com/react-native-community

### Database & ORM
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Sequelize Docs**: https://sequelize.org/
- **Redis Docs**: https://redis.io/docs/

### AWS & DevOps
- **AWS Lambda Guide**: https://docs.aws.amazon.com/lambda/
- **AWS S3 Guide**: https://docs.aws.amazon.com/s3/
- **Docker Docs**: https://docs.docker.com/

### Video Processing
- **FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **Librosa Documentation**: https://librosa.org/doc/latest/

---

## Cursor-Specific Tips

### 1. Code Generation
Ask Cursor to generate complete features:
- "Generate a complete CRUD service for managing video projects"
- "Create a React Native screen for video editing with timeline"
- "Write an Express controller for handling video exports"

### 2. Code Review
Use Cursor to review code for best practices:
- "Review this React Native component for performance issues"
- "Check this Express middleware for security vulnerabilities"
- "Suggest improvements to this video processing function"

### 3. Documentation
Ask Cursor to generate documentation:
- "Generate JSDoc comments for this API endpoint"
- "Create API documentation in OpenAPI format"
- "Write a README with setup instructions"

### 4. Refactoring
Use Cursor to improve code structure:
- "Refactor this component to use custom hooks"
- "Extract this logic into a reusable service"
- "Optimize this database query for performance"

---

## Development Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1: MVP** | 12 weeks | Recording, basic AI editing, 720p export, free tier |
| **Phase 2: Feature Expansion** | 8 weeks | Advanced AI, 1080p export, Pro tier, analytics |
| **Phase 3: Advanced AI** | 8 weeks | 4K export, Premium tier, team collaboration |
| **Phase 4: Scale** | 8 weeks | Enterprise tier, API, white-label licensing |

---

## Conclusion

This JavaScript-based tech stack provides a solid foundation for building EchoFinity with rapid iteration in Cursor. The combination of **React Native** for mobile, **Node.js + Express** for backend, and **Python** for AI processing creates a scalable, maintainable codebase that can grow with your business.

Start with the MVP using React Native + Express, then gradually integrate Python services for advanced video analysis and AI-powered editing. Use Cursor's AI capabilities to accelerate development and maintain code quality throughout the project lifecycle.

The single-language approach (JavaScript for frontend and backend) reduces context switching and enables code sharing between layers, making development faster and more efficient.
