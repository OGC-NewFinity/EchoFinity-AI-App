"""
EchoFinity AI Service
Python FastAPI microservice for video analysis and AI processing
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys
from pathlib import Path

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables
load_dotenv()

# Import logging configuration
from config.logging_config import setup_logging

# Setup logging
setup_logging()

# Import routes
from routes import scene, subtitle, color

app = FastAPI(
    title="EchoFinity AI Service",
    description="AI-powered video analysis and processing service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(scene.router, prefix="/scene", tags=["scene"])
app.include_router(subtitle.router, prefix="/subtitle", tags=["subtitle"])
app.include_router(color.router, prefix="/color", tags=["color"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "EchoFinity AI Service",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai-service"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)