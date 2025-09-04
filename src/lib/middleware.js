import { verifyToken, getUserById } from './auth.js'

// Authentication middleware
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      })
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      })
    }
    
    // Get fresh user data from database
    const user = getUserById(decoded.id)
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found.' 
      })
    }
    
    req.user = {
      ...user,
      permissions: JSON.parse(user.permissions || '[]')
    }
    
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    })
  }
}

// Authorization middleware
export const authorize = (permissions = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      })
    }
    
    // Super users have all permissions
    if (req.user.role === 'super') {
      return next()
    }
    
    // Check if user has required permissions
    const hasRequiredPermissions = permissions.every(permission => 
      req.user.permissions.includes(permission) || req.user.permissions.includes('all')
    )
    
    if (!hasRequiredPermissions) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions.' 
      })
    }
    
    next()
  }
}

// Role-based authorization
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient role privileges.' 
      })
    }
    
    next()
  }
}

// Optional authentication (doesn't fail if no token)
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      
      if (decoded) {
        const user = getUserById(decoded.id)
        if (user) {
          req.user = {
            ...user,
            permissions: JSON.parse(user.permissions || '[]')
          }
        }
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

// Rate limiting helper
export const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100) => {
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
    
    // Check current requests
    const userRequests = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
      .length
    
    if (userRequests >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      })
    }
    
    // Add current request
    requests.set(`${ip}-${now}`, now)
    
    next()
  }
}

// Validation helper
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      })
    }
    
    next()
  }
}

// Error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details?.map(detail => detail.message) || [err.message]
    })
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    })
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}
