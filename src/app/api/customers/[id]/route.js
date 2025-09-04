import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for customer update
const updateCustomerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50),
  last_name: Joi.string().min(2).max(50),
  email: Joi.string().email().allow(''),
  phone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  city: Joi.string().allow(''),
  state: Joi.string().allow(''),
  country: Joi.string().allow(''),
  postal_code: Joi.string().allow(''),
  date_of_birth: Joi.date().allow(''),
  passport_number: Joi.string().allow(''),
  passport_expiry: Joi.date().allow(''),
  emergency_contact_name: Joi.string().allow(''),
  emergency_contact_phone: Joi.string().allow(''),
  notes: Joi.string().allow('')
})

// GET /api/customers/[id] - Get customer by ID
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
          SELECT c.*, u.name as created_by_name
          FROM customers c
          LEFT JOIN users u ON c.created_by = u.id
          WHERE c.id = ?
        `)
        
        const customer = stmt.get(id)
        
        if (!customer) {
          resolve(NextResponse.json({
            success: false,
            message: 'Customer not found'
          }, { status: 404 }))
          return
        }
        
        resolve(NextResponse.json({
          success: true,
          data: { customer }
        }))
      })
    })
  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/customers/[id] - Update customer
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
        const { error, value } = updateCustomerSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Check if customer exists
        const checkStmt = db.prepare('SELECT id FROM customers WHERE id = ?')
        const existingCustomer = checkStmt.get(id)
        
        if (!existingCustomer) {
          resolve(NextResponse.json({
            success: false,
            message: 'Customer not found'
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
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP')
        updateValues.push(id)
        
        const updateQuery = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`
        const stmt = db.prepare(updateQuery)
        const result = stmt.run(...updateValues)
        
        if (result.changes === 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Customer not found'
          }, { status: 404 }))
          return
        }
        
        // Get updated customer
        const getStmt = db.prepare('SELECT * FROM customers WHERE id = ?')
        const customer = getStmt.get(id)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Customer updated successfully',
          data: { customer }
        }))
      })
    })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/customers/[id] - Delete customer
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
        
        // Check if customer exists
        const checkStmt = db.prepare('SELECT id FROM customers WHERE id = ?')
        const existingCustomer = checkStmt.get(id)
        
        if (!existingCustomer) {
          resolve(NextResponse.json({
            success: false,
            message: 'Customer not found'
          }, { status: 404 }))
          return
        }
        
        // Check if customer has associated leads, quotes, or bookings
        const leadsStmt = db.prepare('SELECT COUNT(*) as count FROM leads WHERE customer_id = ?')
        const quotesStmt = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE customer_id = ?')
        const bookingsStmt = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?')
        
        const leadsCount = leadsStmt.get(id).count
        const quotesCount = quotesStmt.get(id).count
        const bookingsCount = bookingsStmt.get(id).count
        
        if (leadsCount > 0 || quotesCount > 0 || bookingsCount > 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Cannot delete customer with associated leads, quotes, or bookings'
          }, { status: 400 }))
          return
        }
        
        // Delete customer
        const stmt = db.prepare('DELETE FROM customers WHERE id = ?')
        const result = stmt.run(id)
        
        if (result.changes === 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Customer not found'
          }, { status: 404 }))
          return
        }
        
        resolve(NextResponse.json({
          success: true,
          message: 'Customer deleted successfully'
        }))
      })
    })
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
