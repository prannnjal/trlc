import { getManageableUsers, canCreateUsers, verifyToken } from '@/lib/auth.js'
import Joi from 'joi'

// Validation schema for user creation
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'caller').required(),
  permissions: Joi.array().items(Joi.string()).default([])
})

// GET /api/users - Get manageable users based on hierarchy
export async function GET(request) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Access denied. No token provided.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid token.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get manageable users based on hierarchy
    const users = await getManageableUsers(decoded)
    
    // Remove password from response
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user
      return {
        ...safeUser,
        permissions: typeof safeUser.permissions === 'string' 
          ? JSON.parse(safeUser.permissions || '[]')
          : safeUser.permissions || []
      }
    })
    
    return new Response(JSON.stringify({
      success: true,
      data: { users: safeUsers }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// POST method removed - use /api/users/create instead