import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'
import Joi from 'joi'

// Validation schema for quote update
const updateQuoteSchema = Joi.object({
  customer_id: Joi.number().integer(),
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow(''),
  total_amount: Joi.number().positive(),
  currency: Joi.string().length(3),
  valid_until: Joi.date().allow(''),
  status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired'),
  terms_conditions: Joi.string().allow('')
})

// GET /api/quotes/[id] - Get quote by ID
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
    
    const quote = await queryOne(`
      SELECT q.*, 
             c.first_name, c.last_name, c.email, c.phone,
             l.source, l.destination
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN leads l ON q.lead_id = l.id
      WHERE q.id = ?
    `, [id])
    
    if (!quote) {
      return NextResponse.json({
        success: false,
        message: 'Quote not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { quote }
    })
    
  } catch (error) {
    console.error('Get quote error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/quotes/[id] - Update quote
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
    const { error, value } = updateQuoteSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Check if quote exists
    const existingQuote = await queryOne('SELECT id FROM quotes WHERE id = ?', [id])
    
    if (!existingQuote) {
      return NextResponse.json({
        success: false,
        message: 'Quote not found'
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
    
    const updateQuery = `UPDATE quotes SET ${updateFields.join(', ')} WHERE id = ?`
    const result = await execute(updateQuery, updateValues)
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Quote not found'
      }, { status: 404 })
    }
    
    // Get updated quote
    const quote = await queryOne(`
      SELECT q.*, 
             c.first_name, c.last_name, c.email, c.phone,
             l.source, l.destination
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN leads l ON q.lead_id = l.id
      WHERE q.id = ?
    `, [id])
    
    return NextResponse.json({
      success: true,
      message: 'Quote updated successfully',
      data: { quote }
    })
    
  } catch (error) {
    console.error('Update quote error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/quotes/[id] - Delete quote
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
    
    // Check if quote exists
    const existingQuote = await queryOne('SELECT id FROM quotes WHERE id = ?', [id])
    
    if (!existingQuote) {
      return NextResponse.json({
        success: false,
        message: 'Quote not found'
      }, { status: 404 })
    }
    
    // Check if quote has associated bookings
    const bookingsCount = await queryOne('SELECT COUNT(*) as count FROM bookings WHERE quote_id = ?', [id])
    
    if (bookingsCount.count > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete quote with associated bookings'
      }, { status: 400 })
    }
    
    // Delete quote
    const result = await execute('DELETE FROM quotes WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Quote not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Quote deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete quote error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export { GET, PUT, DELETE }