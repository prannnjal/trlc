import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for booking update
const updateBookingSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow(''),
  total_amount: Joi.number().positive(),
  currency: Joi.string().length(3),
  deposit_amount: Joi.number().min(0),
  travel_date: Joi.date().allow(''),
  return_date: Joi.date().allow(''),
  status: Joi.string().valid('confirmed', 'in_progress', 'completed', 'cancelled'),
  payment_status: Joi.string().valid('pending', 'partial', 'paid', 'refunded'),
  special_requests: Joi.string().allow('')
})

// GET /api/bookings/[id] - Get booking by ID
export async function GET(request, { params }) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        const { id } = params
        
        const stmt = db.prepare(`
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
        
        const booking = stmt.get(id)
        
        if (!booking) {
          resolve(NextResponse.json({
            success: false,
            message: 'Booking not found'
          }, { status: 404 }))
          return
        }
        
        // Get booking payments
        const paymentsStmt = db.prepare(`
          SELECT p.*, u.name as created_by_name
          FROM payments p
          LEFT JOIN users u ON p.created_by = u.id
          WHERE p.booking_id = ?
          ORDER BY p.payment_date DESC
        `)
        const payments = paymentsStmt.all(id)
        
        // Get booking activities
        const activitiesStmt = db.prepare(`
          SELECT a.*, u.name as created_by_name
          FROM activities a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.entity_type = 'booking' AND a.entity_id = ?
          ORDER BY a.created_at DESC
        `)
        const activities = activitiesStmt.all(id)
        
        resolve(NextResponse.json({
          success: true,
          data: { 
            booking,
            payments,
            activities
          }
        }))
      })
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
export async function PUT(request, { params }) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, async () => {
        const { id } = params
        const body = await request.json()
        
        // Validate request body
        const { error, value } = updateBookingSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Check if booking exists
        const checkStmt = db.prepare('SELECT id FROM bookings WHERE id = ?')
        const existingBooking = checkStmt.get(id)
        
        if (!existingBooking) {
          resolve(NextResponse.json({
            success: false,
            message: 'Booking not found'
          }, { status: 404 }))
          return
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
          resolve(NextResponse.json({
            success: false,
            message: 'No fields to update'
          }, { status: 400 }))
          return
        }
        
        // Recalculate balance if total_amount or deposit_amount is being updated
        if (value.total_amount !== undefined || value.deposit_amount !== undefined) {
          const currentStmt = db.prepare('SELECT total_amount, deposit_amount FROM bookings WHERE id = ?')
          const current = currentStmt.get(id)
          
          const newTotalAmount = value.total_amount !== undefined ? value.total_amount : current.total_amount
          const newDepositAmount = value.deposit_amount !== undefined ? value.deposit_amount : current.deposit_amount
          const newBalanceAmount = newTotalAmount - newDepositAmount
          
          updateFields.push('balance_amount = ?')
          updateValues.push(newBalanceAmount)
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP')
        updateValues.push(id)
        
        const updateQuery = `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`
        const stmt = db.prepare(updateQuery)
        const result = stmt.run(...updateValues)
        
        if (result.changes === 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Booking not found'
          }, { status: 404 }))
          return
        }
        
        // Get updated booking with related data
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
        const booking = getStmt.get(id)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Booking updated successfully',
          data: { booking }
        }))
      })
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
export async function DELETE(request, { params }) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        const { id } = params
        
        // Check if booking exists
        const checkStmt = db.prepare('SELECT id FROM bookings WHERE id = ?')
        const existingBooking = checkStmt.get(id)
        
        if (!existingBooking) {
          resolve(NextResponse.json({
            success: false,
            message: 'Booking not found'
          }, { status: 404 }))
          return
        }
        
        try {
          // Delete booking activities first
          const deleteActivitiesStmt = db.prepare('DELETE FROM activities WHERE entity_type = ? AND entity_id = ?')
          deleteActivitiesStmt.run('booking', id)
          
          // Delete booking payments
          const deletePaymentsStmt = db.prepare('DELETE FROM payments WHERE booking_id = ?')
          deletePaymentsStmt.run(id)
          
          // Delete booking
          const stmt = db.prepare('DELETE FROM bookings WHERE id = ?')
          const result = stmt.run(id)
          
          if (result.changes === 0) {
            resolve(NextResponse.json({
              success: false,
              message: 'Booking not found'
            }, { status: 404 }))
            return
          }
          
          resolve(NextResponse.json({
            success: true,
            message: 'Booking deleted successfully'
          }))
          
        } catch (dbError) {
          console.error('Database error:', dbError)
          resolve(NextResponse.json({
            success: false,
            message: 'Failed to delete booking'
          }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
