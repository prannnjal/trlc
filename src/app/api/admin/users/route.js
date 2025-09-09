import { getAllUsers, getManageableUsers, getUserById, verifyToken } from '@/lib/auth.js'

export async function GET(request) {
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

    // Get user details
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

    // Get manageable users based on role
    const users = await getManageableUsers(currentUser)
    
    // Remove sensitive information
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      created_by: user.created_by,
      created_by_name: user.created_by_name,
      permissions: user.permissions
    }))
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: safeUsers,
        total: safeUsers.length
      }
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
