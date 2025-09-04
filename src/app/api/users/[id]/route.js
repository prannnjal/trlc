import { NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/auth.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for user update
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('sales', 'admin'),
  permissions: Joi.array().items(Joi.string()),
  is_active: Joi.boolean()
})

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        const { id } = params
        
        // Check if user has permission to view users
        if (!['super', 'admin'].includes(request.user.role)) {
          resolve(NextResponse.json({
            success: false,
            message: 'Insufficient permissions'
          }, { status: 403 }))
          return
        }
        
        const user = getUserById(id)
        
        if (!user) {
          resolve(NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 }))
          return
        }
        
        // Remove password from response
        const { password, ...safeUser } = user
        
        resolve(NextResponse.json({
          success: true,
          data: { 
            user: {
              ...safeUser,
              permissions: JSON.parse(safeUser.permissions || '[]')
            }
          }
        }))
      })
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request, { params }) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, async () => {
        const { id } = params
        
        // Check if user has permission to update users
        if (!['super', 'admin'].includes(request.user.role)) {
          resolve(NextResponse.json({
            success: false,
            message: 'Insufficient permissions'
          }, { status: 403 }))
          return
        }
        
        // Prevent users from modifying themselves
        if (parseInt(id) === request.user.id) {
          resolve(NextResponse.json({
            success: false,
            message: 'Cannot modify your own account'
          }, { status: 400 }))
          return
        }
        
        const body = await request.json()
        
        // Validate request body
        const { error, value } = updateUserSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Check if user exists
        const existingUser = getUserById(id)
        if (!existingUser) {
          resolve(NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 }))
          return
        }
        
        // Prepare update data
        const updateData = { ...value }
        if (updateData.permissions) {
          updateData.permissions = JSON.stringify(updateData.permissions)
        }
        
        try {
          const success = await updateUser(id, updateData)
          
          if (!success) {
            resolve(NextResponse.json({
              success: false,
              message: 'User not found'
            }, { status: 404 }))
            return
          }
          
          // Get updated user
          const updatedUser = getUserById(id)
          const { password, ...safeUser } = updatedUser
          
          resolve(NextResponse.json({
            success: true,
            message: 'User updated successfully',
            data: { 
              user: {
                ...safeUser,
                permissions: JSON.parse(safeUser.permissions || '[]')
              }
            }
          }))
          
        } catch (updateError) {
          if (updateError.message.includes('UNIQUE constraint failed')) {
            resolve(NextResponse.json({
              success: false,
              message: 'User with this email already exists'
            }, { status: 409 }))
          } else {
            console.error('Update user error:', updateError)
            resolve(NextResponse.json({
              success: false,
              message: 'Failed to update user'
            }, { status: 500 }))
          }
        }
      })
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (deactivate)
export async function DELETE(request, { params }) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, async () => {
        const { id } = params
        
        // Check if user has permission to delete users
        if (request.user.role !== 'super') {
          resolve(NextResponse.json({
            success: false,
            message: 'Only super users can delete users'
          }, { status: 403 }))
          return
        }
        
        // Prevent users from deleting themselves
        if (parseInt(id) === request.user.id) {
          resolve(NextResponse.json({
            success: false,
            message: 'Cannot delete your own account'
          }, { status: 400 }))
          return
        }
        
        // Check if user exists
        const existingUser = getUserById(id)
        if (!existingUser) {
          resolve(NextResponse.json({
            success: false,
            message: 'User not found'
          }, { status: 404 }))
          return
        }
        
        try {
          // Deactivate user instead of deleting
          const success = await updateUser(id, { is_active: false })
          
          if (!success) {
            resolve(NextResponse.json({
              success: false,
              message: 'User not found'
            }, { status: 404 }))
            return
          }
          
          resolve(NextResponse.json({
            success: true,
            message: 'User deactivated successfully'
          }))
          
        } catch (updateError) {
          console.error('Deactivate user error:', updateError)
          resolve(NextResponse.json({
            success: false,
            message: 'Failed to deactivate user'
          }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
