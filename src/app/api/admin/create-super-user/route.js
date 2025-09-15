import { NextResponse } from 'next/server'
import { createUser, hashPassword } from '@/lib/auth'
import Joi from 'joi'

// Validation schema for super user creation
const superUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate request body
    const { error, value } = superUserSchema.validate(body)
    if (error) {
      return Response.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    const { name, email, password } = value
    
    // Create super user with full permissions
    const superUser = await createUser({
      name,
      email,
      password,
      role: 'super',
      permissions: JSON.stringify(['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs'])
    }, null) // Super user is not created by anyone
    
    return Response.json({
      success: true,
      message: 'Super user created successfully',
      data: {
        id: superUser.id,
        name: superUser.name,
        email: superUser.email,
        role: superUser.role,
        permissions: superUser.permissions
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create super user error:', error)
    
    if (error.message.includes('Duplicate entry')) {
      return Response.json({
        success: false,
        message: 'Email already exists'
      }, { status: 409 })
    }
    
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export { POST }
