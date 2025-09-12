import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'
import Joi from 'joi'

// Validation schema for payment creation
const paymentSchema = Joi.object({
  booking_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('INR'),
  payment_method: Joi.string().valid('credit_card', 'bank_transfer', 'cash', 'check', 'other').required(),
  status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').default('pending'),
  transaction_id: Joi.string().allow(''),
  payment_date: Joi.date().allow(''),
  notes: Joi.string().allow('')
})

// GET /api/payments - Get all payments
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const payment_method = searchParams.get('payment_method') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'
    
    // Build search query
    let whereClause = 'WHERE 1=1'
    let queryParams = []
    
    if (search) {
      whereClause += ' AND (p.transaction_id LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR b.booking_reference LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND p.status = ?'
      queryParams.push(status)
    }
    
    if (payment_method) {
      whereClause += ' AND p.payment_method = ?'
      queryParams.push(payment_method)
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN customers c ON b.customer_id = c.id
      ${whereClause}
    `
    const countResult = await queryOne(countQuery, queryParams)
    const total = countResult.total
    
    // Get payments with pagination
    const offset = (page - 1) * limit
    const paymentsQuery = `
      SELECT p.*, 
             b.booking_reference, b.destination,
             c.first_name, c.last_name, c.email, c.phone
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN customers c ON b.customer_id = c.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `
    const payments = await query(paymentsQuery, [...queryParams, limit, offset])
    
    return Response.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
    
  } catch (error) {
    console.error('Get payments error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/payments - Create new payment
async function POST(request) {
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
    
    const body = await request.json()
    
    // Validate request body
    const { error, value } = paymentSchema.validate(body)
    if (error) {
      return Response.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Create payment
    const result = await execute(`
      INSERT INTO payments (
        booking_id, amount, currency, payment_method, status,
        transaction_id, payment_date, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      value.booking_id,
      value.amount,
      value.currency,
      value.payment_method,
      value.status,
      value.transaction_id || null,
      value.payment_date || null,
      value.notes || null,
      decoded.id
    ])
    
    // Get created payment
    const payment = await queryOne(`
      SELECT p.*, 
             b.booking_reference, b.destination,
             c.first_name, c.last_name, c.email, c.phone
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE p.id = ?
    `, [result.insertId])
    
    return Response.json({
      success: true,
      message: 'Payment created successfully',
      data: { payment }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create payment error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET, POST }
