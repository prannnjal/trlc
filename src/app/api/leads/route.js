import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for lead creation
const leadSchema = Joi.object({
  customer_id: Joi.number().integer().allow(null),
  source: Joi.string().min(2).max(100).required(),
  destination: Joi.string().min(2).max(100).required(),
  travel_date: Joi.date().allow(''),
  return_date: Joi.date().allow(''),
  travelers_count: Joi.number().integer().min(1).default(1),
  budget_range: Joi.string().allow(''),
  status: Joi.string().valid('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost').default('new'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  notes: Joi.string().allow(''),
  assigned_to: Joi.number().integer().allow(null)
})

// GET /api/leads - Get all leads
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
        const assigned_to = searchParams.get('assigned_to') || ''
        const offset = (page - 1) * limit
        
        let query = `
          SELECT l.*, 
                 c.first_name, c.last_name, c.email as customer_email, c.phone as customer_phone,
                 u1.name as assigned_to_name,
                 u2.name as created_by_name
          FROM leads l
          LEFT JOIN customers c ON l.customer_id = c.id
          LEFT JOIN users u1 ON l.assigned_to = u1.id
          LEFT JOIN users u2 ON l.created_by = u2.id
        `
        let countQuery = 'SELECT COUNT(*) as total FROM leads l'
        let params = []
        let conditions = []
        
        if (search) {
          conditions.push('(l.source LIKE ? OR l.destination LIKE ? OR l.notes LIKE ?)')
          const searchTerm = `%${search}%`
          params.push(searchTerm, searchTerm, searchTerm)
        }
        
        if (status) {
          conditions.push('l.status = ?')
          params.push(status)
        }
        
        if (assigned_to) {
          conditions.push('l.assigned_to = ?')
          params.push(assigned_to)
        }
        
        if (conditions.length > 0) {
          const whereClause = ' WHERE ' + conditions.join(' AND ')
          query += whereClause
          countQuery += whereClause
        }
        
        query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)
        
        const stmt = db.prepare(query)
        const leads = stmt.all(...params)
        
        const countStmt = db.prepare(countQuery)
        const countParams = params.slice(0, -2) // Remove limit and offset
        const { total } = countStmt.get(...countParams)
        
        resolve(NextResponse.json({
          success: true,
          data: {
            leads,
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
    console.error('Get leads error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/leads - Create new lead
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
        const { error, value } = leadSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        const stmt = db.prepare(`
          INSERT INTO leads (
            customer_id, source, destination, travel_date, return_date,
            travelers_count, budget_range, status, priority, notes, assigned_to, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        
        const result = stmt.run(
          value.customer_id || null,
          value.source,
          value.destination,
          value.travel_date || null,
          value.return_date || null,
          value.travelers_count,
          value.budget_range || null,
          value.status,
          value.priority,
          value.notes || null,
          value.assigned_to || null,
          request.user.id
        )
        
        // Get the created lead with related data
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
        const lead = getStmt.get(result.lastInsertRowid)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Lead created successfully',
          data: { lead }
        }, { status: 201 }))
      })
    })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
