/**
 * AI Service Integration
 * HTTP client for communicating with the Python-based EchoFinity AI service
 *
 * Future: This can be replaced with child_process.spawn() for direct Python execution
 * Example: const { spawn } = require('child_process');
 *          const pythonProcess = spawn('python', ['-m', 'ai_service.main']);
 */

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

/**
 * Make HTTP request to AI service
 * @private
 */
async function _makeRequest(endpoint, payload) {
  const url = `${AI_SERVICE_BASE_URL}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `AI service returned status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`AI service request timeout: ${endpoint}`);
      throw new Error('AI service request timeout');
    }

    // Network errors (ECONNREFUSED, ENOTFOUND, etc.)
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ENOTFOUND' ||
      error.message.includes('fetch failed')
    ) {
      console.error(`AI service unavailable: ${error.message}`);
      throw new Error('AI service unavailable');
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Detect scenes in a video
 * @param {string} videoPath - Path to the video file
 * @returns {Promise<Array<{start: number, end: number}>>} Array of scene boundaries
 */
async function detectScenes(videoPath) {
  try {
    if (!videoPath) {
      console.error('detectScenes: videoPath is required');
      return [];
    }

    const response = await _makeRequest('/scene/detect', { videoPath });

    if (response.status === 'success' && Array.isArray(response.scenes)) {
      return response.scenes.map(scene => ({
        start: scene.start,
        end: scene.end,
      }));
    }

    console.error('detectScenes: Unexpected response format', response);
    return [];
  } catch (error) {
    console.error('detectScenes error:', error.message);

    // If service is unavailable, return empty array instead of throwing
    if (
      error.message === 'AI service unavailable' ||
      error.message === 'AI service request timeout'
    ) {
      return [];
    }

    // For other errors, return empty array to prevent breaking the caller
    return [];
  }
}

/**
 * Generate subtitles for a video
 * @param {string} videoPath - Path to the video file
 * @returns {Promise<Array<{start: number, end: number, text: string}>>} Array of subtitle segments
 */
async function generateSubtitles(videoPath) {
  try {
    if (!videoPath) {
      console.error('generateSubtitles: videoPath is required');
      return [];
    }

    const response = await _makeRequest('/subtitle/generate', { videoPath });

    if (response.status === 'success' && Array.isArray(response.subtitles)) {
      return response.subtitles.map(subtitle => ({
        start: subtitle.start,
        end: subtitle.end,
        text: subtitle.text,
      }));
    }

    console.error('generateSubtitles: Unexpected response format', response);
    return [];
  } catch (error) {
    console.error('generateSubtitles error:', error.message);

    // If service is unavailable, return empty array instead of throwing
    if (
      error.message === 'AI service unavailable' ||
      error.message === 'AI service request timeout'
    ) {
      return [];
    }

    // For other errors, return empty array to prevent breaking the caller
    return [];
  }
}

/**
 * Apply color correction to a video
 * @param {string} videoPath - Path to the video file
 * @param {string} preset - Color correction preset (cinematic, warm, cool, vintage)
 * @returns {Promise<{correctedPath: string} | null>} Path to the corrected video or null on error
 */
async function applyColorCorrection(videoPath, preset) {
  try {
    if (!videoPath) {
      console.error('applyColorCorrection: videoPath is required');
      return null;
    }

    if (!preset) {
      console.error('applyColorCorrection: preset is required');
      return null;
    }

    const response = await _makeRequest('/color/correct', { videoPath, preset });

    if (response.status === 'success' && response.correctedPath) {
      return { correctedPath: response.correctedPath };
    }

    console.error('applyColorCorrection: Unexpected response format', response);
    return null;
  } catch (error) {
    console.error('applyColorCorrection error:', error.message);

    // If service is unavailable, return null instead of throwing
    if (
      error.message === 'AI service unavailable' ||
      error.message === 'AI service request timeout'
    ) {
      return null;
    }

    // For other errors, return null to prevent breaking the caller
    return null;
  }
}

module.exports = {
  detectScenes,
  generateSubtitles,
  applyColorCorrection,
};

// Future: Replace HTTP calls with child_process.spawn for direct Python execution
// Example implementation:
//
// const { spawn } = require('child_process');
// const path = require('path');
//
// async function detectScenesLocal(videoPath) {
//   return new Promise((resolve, reject) => {
//     const pythonScript = path.join(__dirname, '../../ai-service/main.py');
//     const pythonProcess = spawn('python', [pythonScript, '--scene-detect', videoPath]);
//
//     let output = '';
//     pythonProcess.stdout.on('data', (data) => {
//       output += data.toString();
//     });
//
//     pythonProcess.on('close', (code) => {
//       if (code === 0) {
//         resolve(JSON.parse(output));
//       } else {
//         reject(new Error(`Python process exited with code ${code}`));
//       }
//     });
//   });
// }
