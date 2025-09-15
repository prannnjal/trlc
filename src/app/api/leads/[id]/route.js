import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'
import Joi from 'joi'

// Validation schema for lead update
const updateLeadSchema = Joi.object({
  customer_id: Joi.number().integer().allow(null),
  source: Joi.string().min(2).max(100),
  destination: Joi.string().min(2).max(100),
  travel_date: Joi.date().allow(''),
  return_date: Joi.date().allow(''),
  travelers_count: Joi.number().integer().min(1),
  budget_range: Joi.string().allow(''),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
  notes: Joi.string().allow(''),
  assigned_to: Joi.number().integer().allow(null)
})

// GET /api/leads/[id] - Get lead by ID
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
    
    const lead = await queryOne(`
      SELECT l.*, 
             c.first_name, c.last_name, c.email, c.phone,
             u.name as assigned_to_name
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `, [id])
    
    if (!lead) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { lead }
    })
    
  } catch (error) {
    console.error('Get lead error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// PUT /api/leads/[id] - Update lead
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
    const { error, value } = updateLeadSchema.validate(body)
    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Check if lead exists
    const existingLead = await queryOne('SELECT id FROM leads WHERE id = ?', [id])
    
    if (!existingLead) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found'
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
    
    const updateQuery = `UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`
    const result = await execute(updateQuery, updateValues)
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found'
      }, { status: 404 })
    }
    
    // Get updated lead
    const lead = await queryOne(`
      SELECT l.*, 
             c.first_name, c.last_name, c.email, c.phone,
             u.name as assigned_to_name
      FROM leads l
      LEFT JOIN customers c ON l.customer_id = c.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
    `, [id])
    
    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead }
    })
    
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE /api/leads/[id] - Delete lead
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
    
    // Check if lead exists
    const existingLead = await queryOne('SELECT id FROM leads WHERE id = ?', [id])
    
    if (!existingLead) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found'
      }, { status: 404 })
    }
    
    // Check if lead has associated quotes
    const quotesCount = await queryOne('SELECT COUNT(*) as count FROM quotes WHERE lead_id = ?', [id])
    
    if (quotesCount.count > 0) {
      return NextResponse.json({
        success: false,
        message: 'Cannot delete lead with associated quotes'
      }, { status: 400 })
    }
    
    // Delete lead
    const result = await execute('DELETE FROM leads WHERE id = ?', [id])
    
    if (result.affectedRows === 0) {
      return NextResponse.json({
        success: false,
        message: 'Lead not found'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export { GET, PUT, DELETE }