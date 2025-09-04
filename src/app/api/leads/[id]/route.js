import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
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
          SELECT l.*, 
                 c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                 u1.name as assigned_to_name,
                 u2.name as created_by_name
          FROM leads l
          LEFT JOIN customers c ON l.customer_id = c.id
          LEFT JOIN users u1 ON l.assigned_to = u1.id
          LEFT JOIN users u2 ON l.created_by = u2.id
          WHERE l.id = ?
        `)
        
        const lead = stmt.get(id)
        
        if (!lead) {
          resolve(NextResponse.json({
            success: false,
            message: 'Lead not found'
          }, { status: 404 }))
          return
        }
        
        // Get lead activities
        const activitiesStmt = db.prepare(`
          SELECT a.*, u.name as created_by_name
          FROM activities a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.entity_type = 'lead' AND a.entity_id = ?
          ORDER BY a.created_at DESC
        `)
        const activities = activitiesStmt.all(id)
        
        resolve(NextResponse.json({
          success: true,
          data: { 
            lead,
            activities
          }
        }))
      })
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
        const { error, value } = updateLeadSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Check if lead exists
        const checkStmt = db.prepare('SELECT id FROM leads WHERE id = ?')
        const existingLead = checkStmt.get(id)
        
        if (!existingLead) {
          resolve(NextResponse.json({
            success: false,
            message: 'Lead not found'
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
        
        const updateQuery = `UPDATE leads SET ${updateFields.join(', ')} WHERE id = ?`
        const stmt = db.prepare(updateQuery)
        const result = stmt.run(...updateValues)
        
        if (result.changes === 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Lead not found'
          }, { status: 404 }))
          return
        }
        
        // Get updated lead with related data
        const getStmt = db.prepare(`
          SELECT l.*, 
                 c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                 u1.name as assigned_to_name,
                 u2.name as created_by_name
          FROM leads l
          LEFT JOIN customers c ON l.customer_id = c.id
          LEFT JOIN users u1 ON l.assigned_to = u1.id
          LEFT JOIN users u2 ON l.created_by = u2.id
          WHERE l.id = ?
        `)
        const lead = getStmt.get(id)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Lead updated successfully',
          data: { lead }
        }))
      })
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
        
        // Check if lead exists
        const checkStmt = db.prepare('SELECT id FROM leads WHERE id = ?')
        const existingLead = checkStmt.get(id)
        
        if (!existingLead) {
          resolve(NextResponse.json({
            success: false,
            message: 'Lead not found'
          }, { status: 404 }))
          return
        }
        
        // Check if lead has associated quotes
        const quotesStmt = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE lead_id = ?')
        const quotesCount = quotesStmt.get(id).count
        
        if (quotesCount > 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Cannot delete lead with associated quotes'
          }, { status: 400 }))
          return
        }
        
        // Delete lead activities first
        const deleteActivitiesStmt = db.prepare('DELETE FROM activities WHERE entity_type = ? AND entity_id = ?')
        deleteActivitiesStmt.run('lead', id)
        
        // Delete lead
        const stmt = db.prepare('DELETE FROM leads WHERE id = ?')
        const result = stmt.run(id)
        
        if (result.changes === 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Lead not found'
          }, { status: 404 }))
          return
        }
        
        resolve(NextResponse.json({
          success: true,
          message: 'Lead deleted successfully'
        }))
      })
    })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
