# EchoFinity AI Service

Python FastAPI microservice for AI-powered video analysis and processing.

## Overview

The EchoFinity AI Service provides endpoints for:
- **Scene Detection**: Analyze video content to detect scene changes
- **Subtitle Generation**: Generate subtitles for video content
- **Color Correction**: Apply color correction to video content

## Structure

```
ai-service/
├── main.py                    # FastAPI app entry point
├── routes/
│   ├── scene.py               # Scene detection API
│   ├── subtitle.py            # Subtitle generation API
│   └── color.py               # Color correction API
├── config/
│   └── logging_config.py      # Logging configuration
├── .env                       # Environment variables
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**:
   Copy `.env` and adjust as needed:
   - `PORT`: Server port (default: 8001)
   - `LOG_LEVEL`: Logging level (default: debug)

3. **Run the service**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

## API Endpoints

### Health Check
- `GET /` - Root endpoint with service info
- `GET /health` - Health check endpoint

### Scene Detection
- `POST /scene/detect` - Detect scenes in video (placeholder)
- `POST /scene/` - Alternative scene detection endpoint

### Subtitle Generation
- `POST /subtitle/generate` - Generate subtitles (placeholder)
- `POST /subtitle/` - Alternative subtitle generation endpoint

### Color Correction
- `POST /color/correct` - Apply color correction (placeholder)
- `POST /color/` - Alternative color correction endpoint

## Development

All route endpoints are currently placeholders returning mocked responses with `status: "ok"` and `message: "Not implemented"`. Implement the actual AI processing logic in the respective route files.

## Logging

Logs are written to:
- Console (stdout)
- File: `logs/ai-service.log`

Log level is configured via the `LOG_LEVEL` environment variable.

## Notes

- This service is designed to be integrated with the EchoFinity backend
- CORS is currently configured to allow all origins (configure appropriately for production)
- All endpoints are placeholders and need implementation