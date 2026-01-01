"""
Scene Detection API Route
Detects scene boundaries in video content
"""

import logging
import random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

router = APIRouter()
logger = logging.getLogger(__name__)

class SceneRequest(BaseModel):
    """Request model for scene detection"""
    videoPath: str = Field(..., description="Absolute or relative path to the video file")

class Scene(BaseModel):
    """Scene model with start and end timestamps"""
    start: float
    end: float

class SceneResponse(BaseModel):
    """Response model for scene detection"""
    status: str
    scenes: List[Scene]

def _generate_mock_scenes() -> List[Scene]:
    """
    Generate 3-5 fake scene timestamp ranges between 0 and 90 seconds.
    Scenes are sorted and non-overlapping.
    """
    num_scenes = random.randint(3, 5)
    max_time = 90.0
    
    # Generate random scene boundaries (start at 0, end at max_time, with num_scenes-1 cuts in between)
    cut_points = sorted([random.uniform(5, max_time - 5) for _ in range(num_scenes - 1)])
    
    # Create scenes from consecutive boundaries
    scenes = []
    prev_time = 0.0
    
    for cut_point in cut_points:
        end_time = round(cut_point, 1)
        scenes.append(Scene(start=round(prev_time, 1), end=end_time))
        prev_time = end_time
    
    # Add final scene to max_time
    scenes.append(Scene(start=round(prev_time, 1), end=round(max_time, 1)))
    
    return scenes

@router.post("/detect", response_model=SceneResponse, status_code=200)
async def detect_scenes(request: SceneRequest) -> SceneResponse:
    """
    Scene detection endpoint
    
    Analyzes video content to detect scene changes using shot boundary detection.
    Currently returns mocked scene boundaries.
    
    Args:
        request: SceneRequest containing videoPath
        
    Returns:
        SceneResponse with detected scenes
        
    Raises:
        HTTPException: 400 if videoPath is missing or empty
    """
    # Log incoming request
    logger.info(f"Scene detection request received for video: {request.videoPath}")
    
    # Validate videoPath
    if not request.videoPath or not request.videoPath.strip():
        logger.warning("Scene detection request rejected: videoPath is missing or empty")
        raise HTTPException(
            status_code=400,
            detail="videoPath is required and cannot be empty"
        )
    
    # Simulate scene detection processing
    logger.debug(f"Processing scene detection for: {request.videoPath}")
    scenes = _generate_mock_scenes()
    
    # Log output scene count
    logger.info(f"Scene detection completed: found {len(scenes)} scenes for {request.videoPath}")
    
    return SceneResponse(
        status="success",
        scenes=scenes
    )