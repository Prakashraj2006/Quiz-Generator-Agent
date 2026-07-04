const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Support mock authentication token for easy manual verification/testing
    // e.g. "Bearer mock-user-65d1a1b2c3d4e5f6a7b8c9d0"
    if (token.startsWith('mock-user-')) {
      const mockUserId = token.substring(10);
      req.user = { id: mockUserId };
      return next();
    }

    const secret = process.env.JWT_SECRET || 'syncscore_secret_key_2026_agent';
    const decoded = jwt.verify(token, secret);
    
    // Attach user payload
    req.user = {
      id: decoded.id || decoded.userId || decoded._id
    };

    if (!req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};
