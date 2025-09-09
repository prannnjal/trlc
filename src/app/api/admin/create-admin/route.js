import { createUser, getUserByEmail } from '@/lib/auth.js'
import { verifyToken } from '@/lib/auth.js'
import Joi from 'joi'

// Validation schema for creating admin users
const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('admin', 'sales').default('admin')
})

export async function POST(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authorization token required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify token and get user
    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    if (!payload) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if user can create users (super users or admins)
    if (payload.role !== 'super' && payload.role !== 'admin') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Only super users and admins can create users'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    
    // Validate request body
    const { error, value } = createAdminSchema.validate(body)
    if (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const { name, email, password, role } = value
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User with this email already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Create admin user
    const user = await createUser({
      name,
      email,
      password,
      role
    }, payload.id) // created_by is the super user's ID
    
    // Prepare user data (without password)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      created_by: user.created_by,
      created_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `${role} user created successfully`,
      data: {
        user: userData
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Create admin user error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
