import { getUserById, updateUserPassword, verifyToken, canManageUser } from '@/lib/auth.js'
import Joi from 'joi'

// Validation schema for changing password
const changePasswordSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  newPassword: Joi.string().min(6).max(100).required()
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

    // Get current user details
    const currentUser = await getUserById(payload.id)
    if (!currentUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json()
    
    // Validate request body
    const { error, value } = changePasswordSchema.validate(body)
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
    
    const { userId, newPassword } = value
    
    // Check if target user exists
    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if current user can manage the target user
    if (!canManageUser(currentUser, targetUser)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'You do not have permission to change this user\'s password'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Update password using the auth library function
    await updateUserPassword(userId, newPassword)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Password changed successfully',
      data: {
        userId: userId,
        userEmail: targetUser.email,
        changedBy: payload.id,
        changedAt: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Change password error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
