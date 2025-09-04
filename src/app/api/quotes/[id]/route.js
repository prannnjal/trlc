import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for quote update
const updateQuoteSchema = Joi.object({
  title: Joi.string().min(2).max(200),
  description: Joi.string().allow(''),
  total_amount: Joi.number().positive(),
  currency: Joi.string().length(3),
  valid_until: Joi.date().allow(''),
  status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired'),
  terms_conditions: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().allow(null),
      item_type: Joi.string().required(),
      description: Joi.string().required(),
      quantity: Joi.number().integer().min(1).default(1),
      unit_price: Joi.number().positive().required()
    })
  ).min(1)
})

// GET /api/quotes/[id] - Get quote by ID
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
          SELECT q.*, 
                 c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                 l.source, l.destination,
                 u.name as created_by_name
          FROM quotes q
          LEFT JOIN customers c ON q.customer_id = c.id
          LEFT JOIN leads l ON q.lead_id = l.id
          LEFT JOIN users u ON q.created_by = u.id
          WHERE q.id = ?
        `)
        
        const quote = stmt.get(id)
        
        if (!quote) {
          resolve(NextResponse.json({
            success: false,
            message: 'Quote not found'
          }, { status: 404 }))
          return
        }
        
        // Get quote items
        const itemsStmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY id')
        const items = itemsStmt.all(id)
        
        // Get quote activities
        const activitiesStmt = db.prepare(`
          SELECT a.*, u.name as created_by_name
          FROM activities a
          LEFT JOIN users u ON a.created_by = u.id
          WHERE a.entity_type = 'quote' AND a.entity_id = ?
          ORDER BY a.created_at DESC
        `)
        const activities = activitiesStmt.all(id)
        
        resolve(NextResponse.json({
          success: true,
          data: { 
            quote,
            items,
            activities
          }
        }))
      })
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
        const { error, value } = updateQuoteSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Check if quote exists
        const checkStmt = db.prepare('SELECT id FROM quotes WHERE id = ?')
        const existingQuote = checkStmt.get(id)
        
        if (!existingQuote) {
          resolve(NextResponse.json({
            success: false,
            message: 'Quote not found'
          }, { status: 404 }))
          return
        }
        
        try {
          // Update quote fields
          const updateFields = []
          const updateValues = []
          
          Object.keys(value).forEach(key => {
            if (key !== 'items' && value[key] !== undefined) {
              updateFields.push(`${key} = ?`)
              updateValues.push(value[key] || null)
            }
          })
          
          if (updateFields.length > 0) {
            updateFields.push('updated_at = CURRENT_TIMESTAMP')
            updateValues.push(id)
            
            const updateQuery = `UPDATE quotes SET ${updateFields.join(', ')} WHERE id = ?`
            const stmt = db.prepare(updateQuery)
            stmt.run(...updateValues)
          }
          
          // Update items if provided
          if (value.items) {
            // Delete existing items
            const deleteItemsStmt = db.prepare('DELETE FROM quote_items WHERE quote_id = ?')
            deleteItemsStmt.run(id)
            
            // Insert new items
            const insertItemStmt = db.prepare(`
              INSERT INTO quote_items (
                quote_id, item_type, description, quantity, unit_price, total_price
              ) VALUES (?, ?, ?, ?, ?, ?)
            `)
            
            for (const item of value.items) {
              const totalPrice = item.quantity * item.unit_price
              insertItemStmt.run(
                id,
                item.item_type,
                item.description,
                item.quantity,
                item.unit_price,
                totalPrice
              )
            }
          }
          
          // Get updated quote with related data
          const getStmt = db.prepare(`
            SELECT q.*, 
                   c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                   l.source, l.destination,
                   u.name as created_by_name
            FROM quotes q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN leads l ON q.lead_id = l.id
            LEFT JOIN users u ON q.created_by = u.id
            WHERE q.id = ?
          `)
          const quote = getStmt.get(id)
          
          // Get updated items
          const itemsStmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY id')
          const items = itemsStmt.all(id)
          
          resolve(NextResponse.json({
            success: true,
            message: 'Quote updated successfully',
            data: { 
              quote,
              items
            }
          }))
          
        } catch (dbError) {
          console.error('Database error:', dbError)
          resolve(NextResponse.json({
            success: false,
            message: 'Failed to update quote'
          }, { status: 500 }))
        }
      })
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
        
        // Check if quote exists
        const checkStmt = db.prepare('SELECT id FROM quotes WHERE id = ?')
        const existingQuote = checkStmt.get(id)
        
        if (!existingQuote) {
          resolve(NextResponse.json({
            success: false,
            message: 'Quote not found'
          }, { status: 404 }))
          return
        }
        
        // Check if quote has associated bookings
        const bookingsStmt = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE quote_id = ?')
        const bookingsCount = bookingsStmt.get(id).count
        
        if (bookingsCount > 0) {
          resolve(NextResponse.json({
            success: false,
            message: 'Cannot delete quote with associated bookings'
          }, { status: 400 }))
          return
        }
        
        try {
          // Delete quote activities first
          const deleteActivitiesStmt = db.prepare('DELETE FROM activities WHERE entity_type = ? AND entity_id = ?')
          deleteActivitiesStmt.run('quote', id)
          
          // Delete quote items (cascade should handle this, but being explicit)
          const deleteItemsStmt = db.prepare('DELETE FROM quote_items WHERE quote_id = ?')
          deleteItemsStmt.run(id)
          
          // Delete quote
          const stmt = db.prepare('DELETE FROM quotes WHERE id = ?')
          const result = stmt.run(id)
          
          if (result.changes === 0) {
            resolve(NextResponse.json({
              success: false,
              message: 'Quote not found'
            }, { status: 404 }))
            return
          }
          
          resolve(NextResponse.json({
            success: true,
            message: 'Quote deleted successfully'
          }))
          
        } catch (dbError) {
          console.error('Database error:', dbError)
          resolve(NextResponse.json({
            success: false,
            message: 'Failed to delete quote'
          }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error('Delete quote error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
