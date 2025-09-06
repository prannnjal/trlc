const { NextResponse } = require('next/server')
const db = require('@/lib/database.js')
const { verifyToken } = require('@/lib/auth.js')
const Joi = require('joi')

// Validation schema for lead creation
const leadSchema = Joi.object({
  customer_id: Joi.number().integer().allow(null),
  source: Joi.string().min(2).max(100).required(),
  destination: Joi.string().min(2).max(100).required(),
  travel_date: Joi.date().allow(''),
  return_date: Joi.date().allow(''),
  travelers_count: Joi.number().integer().min(1).default(1),
  budget_range: Joi.string().allow(''),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost').default('new'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  notes: Joi.string().allow(''),
  assigned_to: Joi.number().integer().allow(null)
})

// GET /api/leads - Get all leads
async function GET(request) {
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'
    
    // Build search query
    let whereClause = 'WHERE 1=1'
    let queryParams = []
    
    if (search) {
      whereClause += ' AND (l.source LIKE ? OR l.destination LIKE ? OR l.notes LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND l.status = ?'
      queryParams.push(status)
    }
    
    if (priority) {
      whereClause += ' AND l.priority = ?'
      queryParams.push(priority)
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      ${whereClause}
    `
    const countResult = await db.queryOne(countQuery, queryParams)
    const total = countResult.total
    
    // Get leads with pagination
    const offset = (page - 1) * limit
    const leadsQuery = `
      SELECT l.*, 
             c.first_name, c.last_name, c.email, c.phone,
             u.name as assigned_to_name
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u ON l.assigned_to = u.id
      ${whereClause}
      ORDER BY l.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `
    const leads = await db.query(leadsQuery, [...queryParams, limit, offset])
    
    return NextResponse.json({
      success: true,
      data: {
        leads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/leads - Create new lead
async function POST(request) {
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
    
    const body = await request.json()
    
    // Validate request body
    const { error, value } = leadSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Create lead
    const result = await db.execute(`
      INSERT INTO leads (
        customer_id, source, destination, travel_date, return_date,
        travelers_count, budget_range, status, priority, notes, assigned_to, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      value.customer_id || null,
      value.source,
      value.destination,
      value.travel_date || null,
      value.return_date || null,
      value.travelers_count,
      value.budget_range || null,
      value.status,
      value.priority,
      value.notes || null,
      value.assigned_to || null,
      decoded.id
    ])
    
    // Get created lead
    const lead = await db.queryOne(`
      SELECT l.*, 
             c.first_name, c.last_name, c.email, c.phone,
             u.name as assigned_to_name
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `, [result.insertId])
    
    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data: { lead }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET, POST }