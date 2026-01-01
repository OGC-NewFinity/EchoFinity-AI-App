const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header is missing',
      });
    }

    // Check if token starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Invalid authorization format. Use: Bearer <token>',
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        error: 'Token is missing',
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token has expired',
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
        });
      } else {
        return res.status(401).json({
          error: 'Token verification failed',
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication',
    });
  }
};

module.exports = authMiddleware;
