const { NextResponse } = require('next/server')
const { getUserByEmail, verifyPassword, generateToken } = require('@/lib/auth.js')
const Joi = require('joi')

// Validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { error, value } = loginSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    const { email, password } = value
    
    // Get user from database
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 })
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 })
    }
    
    // Generate JWT token
    const token = await generateToken(user)
    
    // Prepare user data (exclude password)
    let permissions = []
    try {
      // Check if permissions is already an array or needs parsing
      if (typeof user.permissions === 'string') {
        permissions = JSON.parse(user.permissions || '[]')
      } else if (Array.isArray(user.permissions)) {
        permissions = user.permissions
      } else {
        permissions = []
      }
    } catch (error) {
      console.error('Error parsing permissions in login:', user.permissions, error)
      permissions = []
    }
    
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissions,
      avatar: user.avatar,
      isSuperUser: user.role === 'super',
      canManageUsers: ['super', 'admin'].includes(user.role),
      canAccessSystem: ['super', 'admin'].includes(user.role),
      canExportData: ['super', 'admin'].includes(user.role),
      canViewAuditLogs: user.role === 'super'
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { POST }