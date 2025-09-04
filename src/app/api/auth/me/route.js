import { NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware.js'

export async function GET(request) {
  try {
    // This will be handled by middleware, but we need to create a wrapper
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        // If authentication passes, return user data
        const userData = {
          id: request.user.id,
          name: request.user.name,
          email: request.user.email,
          role: request.user.role,
          permissions: request.user.permissions,
          avatar: request.user.avatar,
          isSuperUser: request.user.role === 'super',
          canManageUsers: ['super', 'admin'].includes(request.user.role),
          canAccessSystem: ['super', 'admin'].includes(request.user.role),
          canExportData: ['super', 'admin'].includes(request.user.role),
          canViewAuditLogs: request.user.role === 'super'
        }
        
        resolve(NextResponse.json({
          success: true,
          data: { user: userData }
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
