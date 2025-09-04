import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'

// Validation schema for quote creation
const quoteSchema = Joi.object({
  lead_id: Joi.number().integer().allow(null),
  customer_id: Joi.number().integer().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  total_amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD'),
  valid_until: Joi.date().allow(''),
  status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired').default('draft'),
  terms_conditions: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      item_type: Joi.string().required(),
      description: Joi.string().required(),
      quantity: Joi.number().integer().min(1).default(1),
      unit_price: Joi.number().positive().required()
    })
  ).min(1).required()
})

// GET /api/quotes - Get all quotes
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
        const customer_id = searchParams.get('customer_id') || ''
        const offset = (page - 1) * limit
        
        let query = `
          SELECT q.*, 
                 c.first_name, c.last_name, c.email as customer_email,
                 l.source, l.destination,
                 u.name as created_by_name
          FROM quotes q
          LEFT JOIN customers c ON q.customer_id = c.id
          LEFT JOIN leads l ON q.lead_id = l.id
          LEFT JOIN users u ON q.created_by = u.id
        `
        let countQuery = 'SELECT COUNT(*) as total FROM quotes q'
        let params = []
        let conditions = []
        
        if (search) {
          conditions.push('(q.title LIKE ? OR q.quote_number LIKE ? OR q.description LIKE ?)')
          const searchTerm = `%${search}%`
          params.push(searchTerm, searchTerm, searchTerm)
        }
        
        if (status) {
          conditions.push('q.status = ?')
          params.push(status)
        }
        
        if (customer_id) {
          conditions.push('q.customer_id = ?')
          params.push(customer_id)
        }
        
        if (conditions.length > 0) {
          const whereClause = ' WHERE ' + conditions.join(' AND ')
          query += whereClause
          countQuery += whereClause
        }
        
        query += ' ORDER BY q.created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)
        
        const stmt = db.prepare(query)
        const quotes = stmt.all(...params)
        
        const countStmt = db.prepare(countQuery)
        const countParams = params.slice(0, -2) // Remove limit and offset
        const { total } = countStmt.get(...countParams)
        
        resolve(NextResponse.json({
          success: true,
          data: {
            quotes,
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
    console.error('Get quotes error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/quotes - Create new quote
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
        const { error, value } = quoteSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        // Generate quote number
        const quoteNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
        
        // Start transaction
        const insertQuote = db.prepare(`
          INSERT INTO quotes (
            lead_id, customer_id, quote_number, title, description,
            total_amount, currency, valid_until, status, terms_conditions, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        
        const insertQuoteItem = db.prepare(`
          INSERT INTO quote_items (
            quote_id, item_type, description, quantity, unit_price, total_price
          ) VALUES (?, ?, ?, ?, ?, ?)
        `)
        
        try {
          // Insert quote
          const quoteResult = insertQuote.run(
            value.lead_id || null,
            value.customer_id,
            quoteNumber,
            value.title,
            value.description || null,
            value.total_amount,
            value.currency,
            value.valid_until || null,
            value.status,
            value.terms_conditions || null,
            request.user.id
          )
          
          const quoteId = quoteResult.lastInsertRowid
          
          // Insert quote items
          for (const item of value.items) {
            const totalPrice = item.quantity * item.unit_price
            insertQuoteItem.run(
              quoteId,
              item.item_type,
              item.description,
              item.quantity,
              item.unit_price,
              totalPrice
            )
          }
          
          // Get the created quote with related data
          const getStmt = db.prepare(`
            SELECT q.*, 
                   c.first_name, c.last_name, c.email as customer_email,
                   l.source, l.destination,
                   u.name as created_by_name
            FROM quotes q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN leads l ON q.lead_id = l.id
            LEFT JOIN users u ON q.created_by = u.id
            WHERE q.id = ?
          `)
          const quote = getStmt.get(quoteId)
          
          // Get quote items
          const itemsStmt = db.prepare('SELECT * FROM quote_items WHERE quote_id = ?')
          const items = itemsStmt.all(quoteId)
          
          resolve(NextResponse.json({
            success: true,
            message: 'Quote created successfully',
            data: { 
              quote,
              items
            }
          }, { status: 201 }))
          
        } catch (dbError) {
          console.error('Database error:', dbError)
          resolve(NextResponse.json({
            success: false,
            message: 'Failed to create quote'
          }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error('Create quote error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
