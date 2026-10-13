// server/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { db } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'agriconnect_super_secret_jwt_key_2026_farm_green';

/**
 * Middleware: Verify Bearer JWT and inject authenticated user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Find current user in db
    const user = db.users.find(u => u.id === decoded.id || u.email === decoded.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token: User record not found.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verification_status: user.verification_status
    };
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token.'
    });
  }
};

/**
 * Middleware: Role Based Access Control (RBAC)
 * @param  {...string} roles Allowed roles ('farmer', 'buyer', 'distributor', 'admin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User is not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of the following roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  JWT_SECRET
};
