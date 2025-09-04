const { NextResponse } = require('next/server')
const { createUser, canCreateUsers, getUserById, verifyToken } = require('@/lib/auth.js')
const Joi = require('joi')

// Validation schema
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'caller').required(), // Super user creates admins/callers, admins create callers
  permissions: Joi.array().items(Joi.string()).default([])
})

async function POST(request) {
  try {
    const body = await request.json()

    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token.'
      }, { status: 401 })
    }

    const creatorId = decoded.id
    const creator = await getUserById(creatorId)

    if (!creator) {
      return NextResponse.json({
        success: false,
        message: 'Creator user not found.'
      }, { status: 401 })
    }

    // Validate request body
    const { error, value } = createUserSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }

    // Check if the creator has permission to create the requested role
    if (!canCreateUsers(creator)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to create users.'
      }, { status: 403 })
    }

    if (creator.role === 'admin' && value.role !== 'caller') {
      return NextResponse.json({
        success: false,
        message: 'Admins can only create caller users.'
      }, { status: 403 })
    }

    // Set default permissions based on role if not provided
    let permissions = value.permissions
    if (permissions.length === 0) {
      if (value.role === 'admin') {
        permissions = ['leads', 'quotes', 'bookings', 'reports', 'user_management']
      } else if (value.role === 'caller') {
        permissions = ['leads', 'quotes', 'bookings']
      }
    }

    try {
      const user = await createUser({
        name: value.name,
        email: value.email,
        password: value.password,
        role: value.role,
        permissions: JSON.stringify(permissions)
      }, creatorId) // Pass the creatorId

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: { user }
      }, { status: 201 })

    } catch (createError) {
      if (createError.message.includes('Duplicate entry') && createError.message.includes('for key \'users.email\'')) {
        return NextResponse.json({
          success: false,
          message: 'User with this email already exists'
        }, { status: 409 })
      } else {
        console.error('Create user error:', createError)
        return NextResponse.json({
          success: false,
          message: createError.message || 'Failed to create user'
        }, { status: 500 })
      }
    }

  } catch (error) {
    console.error('Create user API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { POST }