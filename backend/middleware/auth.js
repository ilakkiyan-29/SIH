const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware to check user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = authorize('admin');

// Middleware to check if user is faculty or admin
const requireFacultyOrAdmin = authorize('faculty', 'admin');

// Middleware to check if user is student, faculty, or admin
const requireAnyRole = authorize('student', 'faculty', 'admin');

// Middleware to check if user can access student data
const canAccessStudentData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Admin and faculty can access any student data
  if (req.user.role === 'admin' || req.user.role === 'faculty') {
    return next();
  }

  // Students can only access their own data
  if (req.user.role === 'student') {
    const studentId = req.params.studentId || req.params.id;
    if (studentId && studentId !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only access your own data',
        code: 'ACCESS_DENIED'
      });
    }
  }

  next();
};

// Middleware to check if user can access course data
const canAccessCourseData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Admin can access any course data
  if (req.user.role === 'admin') {
    return next();
  }

  // Faculty can access courses they teach
  if (req.user.role === 'faculty') {
    // This will be checked in the route handler
    return next();
  }

  // Students can access courses they are enrolled in
  if (req.user.role === 'student') {
    // This will be checked in the route handler
    return next();
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  requireAdmin,
  requireFacultyOrAdmin,
  requireAnyRole,
  canAccessStudentData,
  canAccessCourseData
};
