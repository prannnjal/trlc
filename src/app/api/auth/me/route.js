import { NextResponse } from 'next/server'
import { verifyToken, getUserById } from '@/lib/auth'

export async function GET(request) {
  
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return Response.json({
        success: false,
        message: 'Invalid token.'
      }, { status: 401 })
    }
    
    // Get user from database
    const user = await getUserById(decoded.id)
    if (!user) {
      return Response.json({
        success: false,
        message: 'User not found.'
      }, { status: 401 })
    }
    
    if (!user.is_active) {
      return Response.json({
        success: false,
        message: 'Account is deactivated.'
      }, { status: 401 })
    }
    
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
    
    return Response.json({
      success: true,
      data: { user: userData }
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
