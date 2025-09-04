import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for payment creation
const paymentSchema = Joi.object({
  booking_id: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  payment_method: Joi.string().min(2).max(50).required(),
  payment_date: Joi.date().required(),
  reference_number: Joi.string().allow(''),
  notes: Joi.string().allow('')
})

// GET /api/payments - Get all payments
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
        const booking_id = searchParams.get('booking_id') || ''
        const payment_method = searchParams.get('payment_method') || ''
        const offset = (page - 1) * limit
        
        let query = `
          SELECT p.*, 
                 b.booking_number, b.title as booking_title,
                 c.first_name, c.last_name, c.email as customer_email,
                 u.name as created_by_name
          FROM payments p
          LEFT JOIN bookings b ON p.booking_id = b.id
          LEFT JOIN customers c ON b.customer_id = c.id
          LEFT JOIN users u ON p.created_by = u.id
        `
        let countQuery = 'SELECT COUNT(*) as total FROM payments p'
        let params = []
        let conditions = []
        
        if (booking_id) {
          conditions.push('p.booking_id = ?')
          params.push(booking_id)
        }
        
        if (payment_method) {
          conditions.push('p.payment_method = ?')
          params.push(payment_method)
        }
        
        if (conditions.length > 0) {
          const whereClause = ' WHERE ' + conditions.join(' AND ')
          query += whereClause
          countQuery += whereClause
        }
        
        query += ' ORDER BY p.payment_date DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)
        
        const stmt = db.prepare(query)
        const payments = stmt.all(...params)
        
        const countStmt = db.prepare(countQuery)
        const countParams = params.slice(0, -2) // Remove limit and offset
        const { total } = countStmt.get(...countParams)
        
        resolve(NextResponse.json({
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
        }))
      })
    })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/payments - Create new payment
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
        const { error, value } = paymentSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Check if booking exists
        const bookingStmt = db.prepare('SELECT id FROM bookings WHERE id = ?')
        const booking = bookingStmt.get(value.booking_id)
        
        if (!booking) {
          resolve(NextResponse.json({
            success: false,
            message: 'Booking not found'
          }, { status: 404 }))
          return
        }
        
        const stmt = db.prepare(`
          INSERT INTO payments (
            booking_id, amount, currency, payment_method, payment_date, reference_number, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)
        
        const result = stmt.run(
          value.booking_id,
          value.amount,
          value.currency,
          value.payment_method,
          value.payment_date,
          value.reference_number || null,
          value.notes || null,
          request.user.id
        )
        
        // Update booking payment status
        const updateBookingStmt = db.prepare(`
          UPDATE bookings 
          SET payment_status = CASE 
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE booking_id = ?) >= total_amount THEN 'paid'
            WHEN (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE booking_id = ?) > 0 THEN 'partial'
            ELSE 'pending'
          END,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        updateBookingStmt.run(value.booking_id, value.booking_id, value.booking_id)
        
        // Get the created payment with related data
        const getStmt = db.prepare(`
          SELECT p.*, 
                 b.booking_number, b.title as booking_title,
                 c.first_name, c.last_name, c.email as customer_email,
                 u.name as created_by_name
          FROM payments p
          LEFT JOIN bookings b ON p.booking_id = b.id
          LEFT JOIN customers c ON b.customer_id = c.id
          LEFT JOIN users u ON p.created_by = u.id
          WHERE p.id = ?
        `)
        const payment = getStmt.get(result.lastInsertRowid)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Payment created successfully',
          data: { payment }
        }, { status: 201 }))
      })
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
