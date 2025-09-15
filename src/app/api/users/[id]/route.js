import { NextResponse } from 'next/server'
import { getUserById, updateUser, verifyToken } from '@/lib/auth'
import Joi from 'joi'

// Validation schema for user update
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('admin', 'caller'),
  permissions: Joi.array().items(Joi.string()),
  is_active: Joi.boolean()
})

// GET /api/users/[id] - Get user by ID
async function GET(request, { params }) {
  try {
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
    
    const { id } = params
    
    // Check if user has permission to view users
    if (!['super', 'admin'].includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 })
    }
    
    const user = await getUserById(id)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }
    
    // Remove password from response
    const { password, ...safeUser } = user
    
    return NextResponse.json({
      success: true,
      data: { 
        user: {
          ...safeUser,
          permissions: typeof safeUser.permissions === 'string' 
            ? JSON.parse(safeUser.permissions || '[]')
            : safeUser.permissions || []
        }
      }
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
async function PUT(request, { params }) {
  try {
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
    
    const { id } = params
    
    // Check if user has permission to update users
    if (!['super', 'admin'].includes(decoded.role)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions'
      }, { status: 403 })
    }
    
    // Prevent users from modifying themselves
    if (parseInt(id) === decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot modify your own account'
      }, { status: 400 })
    }
    
    const body = await request.json()
    
    // Validate request body
    const { error, value } = updateUserSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Check if user exists
    const existingUser = await getUserById(id)
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }
    
    // Prepare update data
    const updateData = { ...value }
    if (updateData.permissions) {
      updateData.permissions = JSON.stringify(updateData.permissions)
    }
    
    try {
      const updatedUser = await updateUser(id, updateData)
      
      if (!updatedUser) {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 })
      }
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser
      
      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        data: { 
          user: {
            ...safeUser,
            permissions: typeof safeUser.permissions === 'string' 
              ? JSON.parse(safeUser.permissions || '[]')
              : safeUser.permissions || []
          }
        }
      })
      
    } catch (updateError) {
      if (updateError.message.includes('Duplicate entry')) {
        return NextResponse.json({
          success: false,
          message: 'User with this email already exists'
        }, { status: 409 })
      } else {
        console.error('Update user error:', updateError)
        return NextResponse.json({
          success: false,
          message: 'Failed to update user'
        }, { status: 500 })
      }
    }
    
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (deactivate)
async function DELETE(request, { params }) {
  try {
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
    
    const { id } = params
    
    // Check if user has permission to delete users
    if (decoded.role !== 'super') {
      return NextResponse.json({
        success: false,
        message: 'Only super users can delete users'
      }, { status: 403 })
    }
    
    // Prevent users from deleting themselves
    if (parseInt(id) === decoded.id) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete your own account'
      }, { status: 400 })
    }
    
    // Check if user exists
    const existingUser = await getUserById(id)
    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }
    
    try {
      // Deactivate user instead of deleting
      const updatedUser = await updateUser(id, { is_active: false })
      
      if (!updatedUser) {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'User deactivated successfully'
      })
      
    } catch (updateError) {
      console.error('Deactivate user error:', updateError)
      return NextResponse.json({
        success: false,
        message: 'Failed to deactivate user'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export { GET, PUT, DELETE }