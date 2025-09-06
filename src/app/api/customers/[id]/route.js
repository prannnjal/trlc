const { NextResponse } = require('next/server')
const db = require('@/lib/database.js')
const { verifyToken } = require('@/lib/auth.js')
const Joi = require('joi')

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
    
    const customer = await db.queryOne(`
      SELECT c.*, u.name as created_by_name
      FROM customers c
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.id = ?
    `, [id])
    
    if (!customer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { customer }
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
    const { error, value } = updateCustomerSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Check if customer exists
    const existingCustomer = await db.queryOne('SELECT id FROM customers WHERE id = ?', [id])
    
    if (!existingCustomer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
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
    
    const updateQuery = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`
    const result = await db.execute(updateQuery, updateValues)
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }
    
    // Get updated customer
    const customer = await db.queryOne('SELECT * FROM customers WHERE id = ?', [id])
    
    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
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
    
    // Check if customer exists
    const existingCustomer = await db.queryOne('SELECT id FROM customers WHERE id = ?', [id])
    
    if (!existingCustomer) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }
    
    // Check if customer has associated leads, quotes, or bookings
    const [leadsCount, quotesCount, bookingsCount] = await Promise.all([
      db.queryOne('SELECT COUNT(*) as count FROM leads WHERE customer_id = ?', [id]),
      db.queryOne('SELECT COUNT(*) as count FROM quotes WHERE customer_id = ?', [id]),
      db.queryOne('SELECT COUNT(*) as count FROM bookings WHERE customer_id = ?', [id])
    ])
    
    if (leadsCount.count > 0 || quotesCount.count > 0 || bookingsCount.count > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete customer with associated leads, quotes, or bookings'
      }, { status: 400 })
    }
    
    // Delete customer
    const result = await db.execute('DELETE FROM customers WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET, PUT, DELETE }