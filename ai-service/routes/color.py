"""
Color Correction API Route
Applies color correction presets to video content
"""

import asyncio
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()
logger = logging.getLogger(__name__)

# Allowed preset values
ALLOWED_PRESETS = {"cinematic", "warm", "cool", "vintage"}

class ColorCorrectionRequest(BaseModel):
    """Request model for color correction"""
    videoPath: str = Field(..., description="Absolute or relative path to the video file")
    preset: str = Field(..., description="Color correction preset: cinematic, warm, cool, or vintage")

class ColorCorrectionResponse(BaseModel):
    """Response model for color correction"""
    status: str
    correctedPath: str

def _generate_mock_output_path(video_path: str, preset: str) -> str:
    """
    Generate a mock output path for the corrected video.
    
    Args:
        video_path: Original video path
        preset: Color correction preset name
        
    Returns:
        Mock output path string
    """
    # Extract filename from path
    video_filename = Path(video_path).name
    # Remove extension and add preset suffix
    base_name = Path(video_filename).stem
    extension = Path(video_filename).suffix
    
    # Generate mock output path
    output_filename = f"{base_name}_mock_{preset}_corrected{extension}"
    output_path = f"outputs/processed/{output_filename}"
    
    return output_path

@router.post("/correct", response_model=ColorCorrectionResponse, status_code=200)
async def correct_color(request: ColorCorrectionRequest) -> ColorCorrectionResponse:
    """
    Color correction endpoint
    
    Applies color correction preset to video content.
    Currently simulates processing with a 2-second delay.
    
    Args:
        request: ColorCorrectionRequest containing videoPath and preset
        
    Returns:
        ColorCorrectionResponse with status and correctedPath
        
    Raises:
        HTTPException: 400 if videoPath is missing or preset is invalid
    """
    # Log incoming request
    logger.info(f"Color correction request received for video: {request.videoPath}, preset: {request.preset}")
    
    # Validate videoPath
    if not request.videoPath or not request.videoPath.strip():
        logger.warning("Color correction request rejected: videoPath is missing or empty")
        raise HTTPException(
            status_code=400,
            detail="videoPath is required and cannot be empty"
        )
    
    # Validate preset
    preset_lower = request.preset.lower()
    if preset_lower not in ALLOWED_PRESETS:
        logger.warning(f"Color correction request rejected: invalid preset '{request.preset}'")
        raise HTTPException(
            status_code=400,
            detail=f"preset must be one of: {', '.join(sorted(ALLOWED_PRESETS))}"
        )
    
    logger.debug(f"Applying color correction preset '{preset_lower}' to: {request.videoPath}")
    
    # Simulate processing with 2-second delay
    await asyncio.sleep(2)
    
    # Generate mock output path
    corrected_path = _generate_mock_output_path(request.videoPath, preset_lower)
    
    # Log generated output path
    logger.info(f"Color correction completed: generated output path '{corrected_path}' for {request.videoPath} with preset '{preset_lower}'")
    
    return ColorCorrectionResponse(
        status="success",
        correctedPath=corrected_path
    )