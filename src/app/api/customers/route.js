import db from '@/lib/database.js'
import { verifyToken } from '@/lib/auth.js'
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
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Access denied. No token provided.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid token.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'DESC'
    
    // Build search query
    let whereClause = ''
    let queryParams = []
    
    if (search) {
      whereClause = 'WHERE (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)'
      queryParams = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`]
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM customers ${whereClause}`
    const countResult = await db.queryOne(countQuery, queryParams)
    const total = countResult.total
    
    // Get customers with pagination
    const offset = (page - 1) * limit
    const customersQuery = `
      SELECT * FROM customers 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `
    const customers = await db.query(customersQuery, [...queryParams, limit, offset])
    
    return new Response(JSON.stringify({
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
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Get customers error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// POST /api/customers - Create new customer
export async function POST(request) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Access denied. No token provided.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid token.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const body = await request.json()
    
    // Validate request body
    const { error, value } = customerSchema.validate(body)
    if (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Create customer
    const result = await db.execute(`
      INSERT INTO customers (
        first_name, last_name, email, phone, address, city, state, country,
        postal_code, date_of_birth, passport_number, passport_expiry,
        emergency_contact_name, emergency_contact_phone, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
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
      decoded.id
    ])
    
    // Get created customer
    const customer = await db.queryOne('SELECT * FROM customers WHERE id = ?', [result.insertId])
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Create customer error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}