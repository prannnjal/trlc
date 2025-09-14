import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'

// GET /api/leads/import-history - Get import history
async function GET(request) {
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

    // Check if user has permission to view import history
    const hasPermission = decoded.permissions.includes('all') || 
                         decoded.permissions.includes('leads:read') ||
                         decoded.role === 'admin' || 
                         decoded.role === 'sales'
    
    if (!hasPermission) {
      return Response.json({
        success: false,
        message: 'Insufficient permissions to view import history.'
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const importType = searchParams.get('type') || ''

    // Build query
    let whereClause = 'WHERE 1=1'
    let queryParams = []

    if (importType) {
      whereClause += ' AND import_type = ?'
      queryParams.push(importType)
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM import_logs 
      ${whereClause}
    `
    const countResult = await queryOne(countQuery, queryParams)
    const total = countResult.total

    // Get import history with pagination
    const offset = (page - 1) * limit
    const historyQuery = `
      SELECT il.*, u.name as user_name, u.email as user_email
      FROM import_logs il
      LEFT JOIN users u ON il.user_id = u.id
      ${whereClause}
      ORDER BY il.created_at DESC
      LIMIT ? OFFSET ?
    `
    const history = await query(historyQuery, [...queryParams, limit, offset])

    return Response.json({
      success: true,
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get import history error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET }
