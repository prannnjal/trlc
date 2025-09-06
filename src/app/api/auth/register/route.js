import { createUser, getUserByEmail, generateToken } from '@/lib/auth.js'
import Joi from 'joi'

// Validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('sales', 'admin').default('sales')
})

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { error, value } = registerSchema.validate(body)
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
    
    // Set default permissions based on role
    let permissions = []
    if (role === 'admin') {
      permissions = ['all']
    } else {
      permissions = ['leads', 'quotes', 'bookings', 'reports']
    }
    
    // Create user
    const user = await createUser({
      name,
      email,
      password,
      role,
      permissions: JSON.stringify(permissions)
    })
    
    // Generate JWT token
    const token = await generateToken(user)
    
    // Prepare user data
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      avatar: user.avatar,
      isSuperUser: user.role === 'super',
      canManageUsers: ['super', 'admin'].includes(user.role),
      canAccessSystem: ['super', 'admin'].includes(user.role),
      canExportData: ['super', 'admin'].includes(user.role),
      canViewAuditLogs: user.role === 'super'
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      data: {
        user: userData,
        token
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}