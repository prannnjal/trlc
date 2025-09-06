const { NextResponse } = require('next/server')
const db = require('@/lib/database.js')
const { verifyToken } = require('@/lib/auth.js')
const Joi = require('joi')

// Validation schema for booking creation
const bookingSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  quote_id: Joi.number().integer().allow(null),
  destination: Joi.string().min(2).max(200).required(),
  departure_date: Joi.date().required(),
  return_date: Joi.date().allow(''),
  travelers_count: Joi.number().integer().min(1).default(1),
  total_amount: Joi.number().positive().required(),
  status: Joi.string().valid('confirmed', 'pending', 'cancelled', 'completed').default('pending'),
  notes: Joi.string().allow('')
})

// GET /api/bookings - Get all bookings
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
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'
    
    // Build search query
    let whereClause = 'WHERE 1=1'
    let queryParams = []
    
    if (search) {
      whereClause += ' AND (b.destination LIKE ? OR b.booking_reference LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND b.status = ?'
      queryParams.push(status)
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      ${whereClause}
    `
    const countResult = await db.queryOne(countQuery, queryParams)
    const total = countResult.total
    
    // Get bookings with pagination
    const offset = (page - 1) * limit
    const bookingsQuery = `
      SELECT b.*, 
             c.first_name, c.last_name, c.email, c.phone,
             q.title as quote_title, q.total_amount as quote_amount
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN quotes q ON b.quote_id = q.id
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `
    const bookings = await db.query(bookingsQuery, [...queryParams, limit, offset])
    
    return NextResponse.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
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
    const { error, value } = bookingSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Generate booking reference
    const bookingRef = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Create booking
    const result = await db.execute(`
      INSERT INTO bookings (
        customer_id, quote_id, destination, departure_date, return_date,
        travelers_count, total_amount, status, notes, booking_reference, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      value.customer_id,
      value.quote_id || null,
      value.destination,
      value.departure_date,
      value.return_date || null,
      value.travelers_count,
      value.total_amount,
      value.status,
      value.notes || null,
      bookingRef,
      decoded.id
    ])
    
    // Get created booking
    const booking = await db.queryOne(`
      SELECT b.*, 
             c.first_name, c.last_name, c.email, c.phone,
             q.title as quote_title, q.total_amount as quote_amount
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN quotes q ON b.quote_id = q.id
      WHERE b.id = ?
    `, [result.insertId])
    
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET, POST }