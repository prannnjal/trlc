import { NextResponse } from 'next/server'
import { getAllUsers, createUser } from '@/lib/auth.js'
import { authenticate, requireRole } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for user creation
const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('sales', 'admin').required(),
  permissions: Joi.array().items(Joi.string()).default([])
})

// GET /api/users - Get all users
export async function GET(request) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        // Check if user has permission to view users
        if (!['super', 'admin'].includes(request.user.role)) {
          resolve(NextResponse.json({
            success: false,
            message: 'Insufficient permissions'
          }, { status: 403 }))
          return
        }
        
        const users = await getAllUsers()
        
        // Remove password from response
        const safeUsers = users.map(user => {
          const { password, ...safeUser } = user
          return {
            ...safeUser,
            permissions: JSON.parse(safeUser.permissions || '[]')
          }
        })
        
        resolve(NextResponse.json({
          success: true,
          data: { users: safeUsers }
        }))
      })
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/users - Create new user
export async function POST(request) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, async () => {
        // Check if user has permission to create users
        if (!['super', 'admin'].includes(request.user.role)) {
          resolve(NextResponse.json({
            success: false,
            message: 'Insufficient permissions'
          }, { status: 403 }))
          return
        }
        
        const body = await request.json()
        
        // Validate request body
        const { error, value } = userSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Set default permissions based on role
        let permissions = value.permissions
        if (permissions.length === 0) {
          if (value.role === 'admin') {
            permissions = ['all']
          } else {
            permissions = ['leads', 'quotes', 'bookings', 'reports']
          }
        }
        
        try {
          const user = await createUser({
            name: value.name,
            email: value.email,
            password: value.password,
            role: value.role,
            permissions: JSON.stringify(permissions)
          })
          
          resolve(NextResponse.json({
            success: true,
            message: 'User created successfully',
            data: { user }
          }, { status: 201 }))
          
        } catch (createError) {
          if (createError.message.includes('UNIQUE constraint failed')) {
            resolve(NextResponse.json({
              success: false,
              message: 'User with this email already exists'
            }, { status: 409 }))
          } else {
            console.error('Create user error:', createError)
            resolve(NextResponse.json({
              success: false,
              message: 'Failed to create user'
            }, { status: 500 }))
          }
        }
      })
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
