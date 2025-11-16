const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Accept both admin and user tokens for general authentication
    // Routes can check decoded.type if they need specific role
    req.userId = decoded.id;
    req.username = decoded.username;
    req.userType = decoded.type;
    
    // For backward compatibility, also set adminId if it's an admin
    if (decoded.type === 'admin') {
      req.adminId = decoded.id;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware specifically for admin-only routes
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.adminId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authMiddleware, requireAdmin, JWT_SECRET };
