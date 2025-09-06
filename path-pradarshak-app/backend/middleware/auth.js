const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, "c777c459f7534d902627055e4a1c3a2f1cb6e18cf8816740d4c47f57f95d5e9593e3f942e8ff1d86de645681821eb6f690cae53245f4abaa391ea6d66c0c0252");
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

const authenticateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Require a specific role (or admin)
const requireRole = (roles = []) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role === 'admin') return next();
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient role' });
    }
    next();
  };
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    "c777c459f7534d902627055e4a1c3a2f1cb6e18cf8816740d4c47f57f95d5e9593e3f942e8ff1d86de645681821eb6f690cae53245f4abaa391ea6d66c0c0252",
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    "d06d007998211d1ede2c9b3591215fa1068461f2683b689150506949e1625b6858f36aed8b42b8e6deb9107f0b11aeadf6e4937cb4ea9d857c53451c2f2f5daf",
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
};

module.exports = {
  authenticateToken,
  authenticateRefreshToken,
  requireAdmin,
  requireRole,
  generateTokens
};


