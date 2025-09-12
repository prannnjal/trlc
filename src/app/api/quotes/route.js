import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'
import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'

// Validation schema for quote creation
const quoteSchema = Joi.object({
  lead_id: Joi.number().integer().allow(null),
  customer_id: Joi.number().integer().required(),
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(''),
  total_amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('INR'),
  valid_until: Joi.date().allow(''),
  status: Joi.string().valid('draft', 'sent', 'accepted', 'rejected', 'expired').default('draft'),
  terms_conditions: Joi.string().allow(''),
  items: Joi.array().items(
    Joi.object({
      item_type: Joi.string().required(),
      description: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unit_price: Joi.number().positive().required(),
      total_price: Joi.number().positive().required()
    })
  ).default([])
})

// GET /api/quotes - Get all quotes
async function GET(request) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return Response.json({
        success: false,
        message: 'Invalid token.'
      }, { status: 401 })
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'
    
    // Build search query
    let whereClause = 'WHERE 1=1'
    let queryParams = []
    
    if (search) {
      whereClause += ' AND (q.title LIKE ? OR q.description LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)'
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
    }
    
    if (status) {
      whereClause += ' AND q.status = ?'
      queryParams.push(status)
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      ${whereClause}
    `
    const countResult = await db.queryOne(countQuery, queryParams)
    const total = countResult.total
    
    // Get quotes with pagination
    const offset = (page - 1) * limit
    const quotesQuery = `
      SELECT q.*, 
             c.first_name, c.last_name, c.email, c.phone,
             l.source, l.destination
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN leads l ON q.lead_id = l.id
      ${whereClause}
      ORDER BY q.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `
    const quotes = await db.query(quotesQuery, [...queryParams, limit, offset])
    
    return Response.json({
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
    })
    
  } catch (error) {
    console.error('Get quotes error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/quotes - Create new quote
async function POST(request) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return Response.json({
        success: false,
        message: 'Invalid token.'
      }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Validate request body
    const { error, value } = quoteSchema.validate(body)
    if (error) {
      return Response.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }
    
    // Generate quote reference
    const quoteRef = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Create quote
    const result = await db.execute(`
      INSERT INTO quotes (
        lead_id, customer_id, title, description, total_amount, currency,
        valid_until, status, terms_conditions, quote_reference, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      value.lead_id || null,
      value.customer_id,
      value.title,
      value.description || null,
      value.total_amount,
      value.currency,
      value.valid_until || null,
      value.status,
      value.terms_conditions || null,
      quoteRef,
      decoded.id
    ])
    
    // Get created quote
    const quote = await db.queryOne(`
      SELECT q.*, 
             c.first_name, c.last_name, c.email, c.phone,
             l.source, l.destination
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN leads l ON q.lead_id = l.id
      WHERE q.id = ?
    `, [result.insertId])
    
    return Response.json({
      success: true,
      message: 'Quote created successfully',
      data: { quote }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create quote error:', error)
    return Response.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET, POST }
