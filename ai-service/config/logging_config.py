"""
Logging Configuration
Sets up logging for the EchoFinity AI Service
"""

import logging
import sys
import os
from pathlib import Path

def setup_logging():
    """
    Configure logging for the application.
    
    Reads LOG_LEVEL from environment variables (defaults to INFO).
    Sets up both console and file logging handlers.
    """
    # Get log level from environment
    log_level_str = os.getenv("LOG_LEVEL", "info").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)
    
    # Create logs directory if it doesn't exist
    logs_dir = Path(__file__).parent.parent / "logs"
    logs_dir.mkdir(exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(logs_dir / "ai-service.log")
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured with level: {log_level_str}")
    
    return logger