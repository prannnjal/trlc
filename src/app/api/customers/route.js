import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate, authorize } from '@/lib/middleware.js'
import Joi from 'joi'

// Validation schema for customer creation
const customerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
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

// GET /api/customers - Get all customers
export async function GET(request) {
  try {
    // Authentication will be handled by middleware wrapper
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
        const offset = (page - 1) * limit
        
        let query = `
          SELECT c.*, u.name as created_by_name
          FROM customers c
          LEFT JOIN users u ON c.created_by = u.id
        `
        let countQuery = 'SELECT COUNT(*) as total FROM customers c'
        let params = []
        
        if (search) {
          const searchCondition = `
            WHERE (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)
          `
          query += searchCondition
          countQuery += searchCondition
          const searchTerm = `%${search}%`
          params = [searchTerm, searchTerm, searchTerm, searchTerm]
        }
        
        query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?'
        params.push(limit, offset)
        
        const stmt = db.prepare(query)
        const customers = stmt.all(...params)
        
        const countStmt = db.prepare(countQuery)
        const { total } = countStmt.get(...(search ? params.slice(0, 4) : []))
        
        resolve(NextResponse.json({
          success: true,
          data: {
            customers,
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
    console.error('Get customers error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

// POST /api/customers - Create new customer
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
        const { error, value } = customerSchema.validate(body)
        if (error) {
          resolve(NextResponse.json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
          }, { status: 400 }))
          return
        }
        
        const stmt = db.prepare(`
          INSERT INTO customers (
            first_name, last_name, email, phone, address, city, state, country,
            postal_code, date_of_birth, passport_number, passport_expiry,
            emergency_contact_name, emergency_contact_phone, notes, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        
        const result = stmt.run(
          value.first_name,
          value.last_name,
          value.email || null,
          value.phone || null,
          value.address || null,
          value.city || null,
          value.state || null,
          value.country || null,
          value.postal_code || null,
          value.date_of_birth || null,
          value.passport_number || null,
          value.passport_expiry || null,
          value.emergency_contact_name || null,
          value.emergency_contact_phone || null,
          value.notes || null,
          request.user.id
        )
        
        // Get the created customer
        const getStmt = db.prepare('SELECT * FROM customers WHERE id = ?')
        const customer = getStmt.get(result.lastInsertRowid)
        
        resolve(NextResponse.json({
          success: true,
          message: 'Customer created successfully',
          data: { customer }
        }, { status: 201 }))
      })
    })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
