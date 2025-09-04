const { verifyToken, getUserById } = require('./auth.js')

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      })
    }
    
    // Get user from database
    const user = await getUserById(decoded.id)
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      })
    }
    
    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      })
    }
    
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      
      if (decoded) {
        const user = await getUserById(decoded.id)
        if (user && user.is_active) {
          req.user = user
        }
      }
    }
    
    next()
  } catch (error) {
    console.error('Optional authentication error:', error)
    next() // Continue without authentication
  }
}

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      })
    }
    
    next()
  }
}

// Permission-based authorization middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      })
    }
    
    const userPermissions = req.user.permissions || []
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('all')) {
      return res.status(403).json({ 
        success: false, 
        message: `Permission '${permission}' required` 
      })
    }
    
    next()
  }
}

// Super user only middleware
const superUserOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    })
  }
  
  if (req.user.role !== 'super') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super user access required' 
    })
  }
  
  next()
}

// Admin or super user middleware
const adminOrSuper = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    })
  }
  
  if (!['admin', 'super'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin or super user access required' 
    })
  }
  
  next()
}

// Rate limiting middleware (basic implementation)
const rateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map()
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key)
      }
    }
    
    // Check current request count
    const requestCount = Array.from(requests.values())
      .filter(timestamp => timestamp > windowStart).length
    
    if (requestCount >= max) {
      return res.status(429).json({ 
        success: false, 
        message: 'Too many requests, please try again later' 
      })
    }
    
    // Add current request
    requests.set(ip, now)
    next()
  }
}

// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body)
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      })
    }
    
    req.body = value
    next()
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation error',
      errors: err.details.map(detail => detail.message)
    })
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized' 
    })
  }
  
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden' 
    })
  }
  
  return res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  })
}

// CORS middleware
const cors = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff')
  res.header('X-Frame-Options', 'DENY')
  res.header('X-XSS-Protection', '1; mode=block')
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  superUserOnly,
  adminOrSuper,
  rateLimit,
  validateRequest,
  errorHandler,
  cors,
  securityHeaders
}