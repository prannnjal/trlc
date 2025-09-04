import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'

// Validation schema for booking creation
const bookingSchema = Joi.object({
  quote_id: Joi.number().integer().allow(null),
  customer_id: Joi.number().integer().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  total_amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  deposit_amount: Joi.number().min(0).default(0),
  travel_date: Joi.date().allow(''),
  return_date: Joi.date().allow(''),
  status: Joi.string().valid('confirmed', 'in_progress', 'completed', 'cancelled').default('confirmed'),
  payment_status: Joi.string().valid('pending', 'partial', 'paid', 'refunded').default('pending'),
  special_requests: Joi.string().allow('')
})

// GET /api/bookings - Get all bookings
export async function GET(request) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page')) || 1
        const limit = parseInt(searchParams.get('limit')) || 10
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || ''
        const payment_status = searchParams.get('payment_status') || ''
        const customer_id = searchParams.get('customer_id') || ''
        const offset = (page - 1) * limit
        
        let query = `
          SELECT b.*, 
                 c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                 q.quote_number, q.title as quote_title,
                 u.name as created_by_name,
                 (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.booking_id = b.id) as paid_amount
          FROM bookings b
          LEFT JOIN customers c ON b.customer_id = c.id
          LEFT JOIN quotes q ON b.quote_id = q.id
          LEFT JOIN users u ON b.created_by = u.id
        `
        let countQuery = 'SELECT COUNT(*) as total FROM bookings b'
        let params = []
        let conditions = []
        
        if (search) {
          conditions.push('(b.title LIKE ? OR b.booking_number LIKE ? OR b.description LIKE ?)')
          const searchTerm = `%${search}%`
          params.push(searchTerm, searchTerm, searchTerm)
        }
        
        if (status) {
          conditions.push('b.status = ?')
          params.push(status)
        }
        
        if (payment_status) {
          conditions.push('b.payment_status = ?')
          params.push(payment_status)
        }
        
        if (customer_id) {
          conditions.push('b.customer_id = ?')
          params.push(customer_id)
        }
        
        if (conditions.length > 0) {
          const whereClause = ' WHERE ' + conditions.join(' AND ')
          query += whereClause
          countQuery += whereClause
        }
        
        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)
        
        const stmt = db.prepare(query)
        const bookings = stmt.all(...params)
        
        const countStmt = db.prepare(countQuery)
        const countParams = params.slice(0, -2) // Remove limit and offset
        const { total } = countStmt.get(...countParams)
        
        resolve(NextResponse.json({
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
        }))
      })
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
export async function POST(request) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, async () => {
        const body = await request.json()
        
        // Validate request body
        const { error, value } = bookingSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Generate booking number
        const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        
        // Calculate balance amount
        const balanceAmount = value.total_amount - value.deposit_amount
        
        const stmt = db.prepare(`
          INSERT INTO bookings (
            quote_id, customer_id, booking_number, title, description,
            total_amount, currency, deposit_amount, balance_amount,
            travel_date, return_date, status, payment_status, special_requests, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        
        const result = stmt.run(
          value.quote_id || null,
          value.customer_id,
          bookingNumber,
          value.title,
          value.description || null,
          value.total_amount,
          value.currency,
          value.deposit_amount,
          balanceAmount,
          value.travel_date || null,
          value.return_date || null,
          value.status,
          value.payment_status,
          value.special_requests || null,
          request.user.id
        )
        
        // Get the created booking with related data
        const getStmt = db.prepare(`
          SELECT b.*, 
                 c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                 q.quote_number, q.title as quote_title,
                 u.name as created_by_name
          FROM bookings b
          LEFT JOIN customers c ON b.customer_id = c.id
          LEFT JOIN quotes q ON b.quote_id = q.id
          LEFT JOIN users u ON b.created_by = u.id
          WHERE b.id = ?
        `)
        const booking = getStmt.get(result.lastInsertRowid)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Booking created successfully',
          data: { booking }
        }, { status: 201 }))
      })
    })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
