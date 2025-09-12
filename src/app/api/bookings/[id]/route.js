import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'
import Joi from 'joi'

// Validation schema for booking update
const updateBookingSchema = Joi.object({
  customer_id: Joi.number().integer(),
  quote_id: Joi.number().integer().allow(null),
  destination: Joi.string().min(2).max(200),
  departure_date: Joi.date(),
  return_date: Joi.date().allow(''),
  travelers_count: Joi.number().integer().min(1),
  total_amount: Joi.number().positive(),
  status: Joi.string().valid('confirmed', 'pending', 'cancelled', 'completed'),
  notes: Joi.string().allow('')
})

// GET /api/bookings/[id] - Get booking by ID
async function GET(request, { params }) {
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
    
    const { id } = params
    
    const booking = await queryOne(`
      SELECT b.*, 
             c.first_name, c.last_name, c.email, c.phone,
             q.title as quote_title, q.total_amount as quote_amount
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN quotes q ON b.quote_id = q.id
      WHERE b.id = ?
    `, [id])
    
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { booking }
    })
    
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/bookings/[id] - Update booking
async function PUT(request, { params }) {
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
    
    const { id } = params
    const body = await request.json()
    
    // Validate request body
    const { error, value } = updateBookingSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Check if booking exists
    const existingBooking = await queryOne('SELECT id FROM bookings WHERE id = ?', [id])
    
    if (!existingBooking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 })
    }
    
    // Build update query dynamically
    const updateFields = []
    const updateValues = []
    
    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        updateFields.push(`${key} = ?`)
        updateValues.push(value[key] || null)
      }
    })
    
    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No fields to update'
      }, { status: 400 })
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(id)
    
    const updateQuery = `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`
    const result = await execute(updateQuery, updateValues)
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 })
    }
    
    // Get updated booking
    const booking = await queryOne(`
      SELECT b.*, 
             c.first_name, c.last_name, c.email, c.phone,
             q.title as quote_title, q.total_amount as quote_amount
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN quotes q ON b.quote_id = q.id
      WHERE b.id = ?
    `, [id])
    
    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    })
    
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/bookings/[id] - Delete booking
async function DELETE(request, { params }) {
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
    
    const { id } = params
    
    // Check if booking exists
    const existingBooking = await queryOne('SELECT id FROM bookings WHERE id = ?', [id])
    
    if (!existingBooking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 })
    }
    
    // Check if booking has associated payments
    const paymentsCount = await queryOne('SELECT COUNT(*) as count FROM payments WHERE booking_id = ?', [id])
    
    if (paymentsCount.count > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete booking with associated payments'
      }, { status: 400 })
    }
    
    // Delete booking
    const result = await execute('DELETE FROM bookings WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET, PUT, DELETE }