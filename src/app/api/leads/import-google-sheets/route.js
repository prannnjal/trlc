import { NextResponse } from 'next/server'
import { query, execute, queryOne } from '@/lib/mysql'
import { verifyToken } from '@/lib/auth'
import googleSheetsService from '@/lib/googleSheets'
import Joi from 'joi'

// Validation schema for import request
const importSchema = Joi.object({
  spreadsheetUrl: Joi.string().uri().required(),
  range: Joi.string().default('Sheet1!A:Z'),
  createCustomers: Joi.boolean().default(true),
  assignToUser: Joi.number().integer().allow(null)
})

// POST /api/leads/import-google-sheets - Import leads from Google Sheets
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

    // Check if user has permission to import leads
    const hasPermission = decoded.permissions.includes('all') || 
                         decoded.permissions.includes('leads:create') ||
                         decoded.role === 'admin' || 
                         decoded.role === 'sales'
    
    if (!hasPermission) {
      return Response.json({
        success: false,
        message: 'Insufficient permissions to import leads.'
      }, { status: 403 })
    }
    
    const body = await request.json()
    
    // Validate request body
    const { error, value } = importSchema.validate(body)
    if (error) {
      return Response.json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      }, { status: 400 })
    }

    // Parse spreadsheet ID from URL
    const spreadsheetId = googleSheetsService.parseSpreadsheetUrl(value.spreadsheetUrl)
    if (!spreadsheetId) {
      return Response.json({
        success: false,
        message: 'Invalid Google Sheets URL. Please provide a valid Google Sheets URL.'
      }, { status: 400 })
    }

    // Fetch data from Google Sheets
    const rawData = await googleSheetsService.getSpreadsheetData(spreadsheetId, value.range)
    
    // Validate data format
    const validation = googleSheetsService.validateLeadData(rawData)
    if (!validation.isValid) {
      return Response.json({
        success: false,
        message: validation.error
      }, { status: 400 })
    }

    // Parse leads data
    const { leads, errors } = googleSheetsService.parseLeadsData(rawData, validation.headers)
    
    if (errors.length > 0) {
      return Response.json({
        success: false,
        message: 'Data validation errors found',
        errors: errors,
        validLeads: leads.length,
        totalRows: rawData.length - 1
      }, { status: 400 })
    }

    if (leads.length === 0) {
      return Response.json({
        success: false,
        message: 'No valid leads found in the spreadsheet'
      }, { status: 400 })
    }

    const importedLeads = []
    const skippedLeads = []
    const errors = []

    for (const leadData of leads) {
      try {
        // Check if customer already exists (by email)
        let customerId = null
        if (value.createCustomers && leadData.email) {
          const existingCustomer = await queryOne(`
            SELECT id FROM customers WHERE email = ?
          `, [leadData.email])

          if (existingCustomer) {
            customerId = existingCustomer.id
          } else {
            // Create new customer
            const customerResult = await execute(`
              INSERT INTO customers (first_name, last_name, email, phone, created_by)
              VALUES (?, ?, ?, ?, ?)
            `, [
              leadData.name.split(' ')[0] || '',
              leadData.name.split(' ').slice(1).join(' ') || '',
              leadData.email,
              leadData.phone || null,
              decoded.id
            ])
            customerId = customerResult.insertId
          }
        }

        // Check if lead already exists (by email and destination)
        const existingLead = await queryOne(`
          SELECT id FROM leads 
          WHERE email = ? AND destination = ?
        `, [leadData.email, leadData.destination])

        if (existingLead) {
          skippedLeads.push({
            name: leadData.name,
            email: leadData.email,
            destination: leadData.destination,
            reason: 'Lead already exists'
          })
          continue
        }

        // Create lead
        const leadResult = await execute(`
          INSERT INTO leads (
            customer_id, source, destination, travel_date, return_date,
            travelers_count, budget_range, status, priority, notes, 
            assigned_to, created_by, email, phone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          customerId,
          leadData.source,
          leadData.destination,
          leadData.travel_date || null,
          leadData.return_date || null,
          leadData.travelers_count || 1,
          leadData.budget_range || null,
          leadData.status || 'new',
          leadData.priority || 'medium',
          leadData.notes || null,
          value.assignToUser || leadData.assigned_to || null,
          decoded.id,
          leadData.email,
          leadData.phone || null
        ])

        // Get created lead with customer info
        const createdLead = await queryOne(`
          SELECT l.*, 
                 c.first_name, c.last_name, c.email, c.phone,
                 u.name as assigned_to_name
          FROM leads l
          LEFT JOIN customers c ON l.customer_id = c.id
          LEFT JOIN users u ON l.assigned_to = u.id
          WHERE l.id = ?
        `, [leadResult.insertId])

        importedLeads.push(createdLead)

      } catch (leadError) {
        console.error('Error creating lead:', leadError)
        errors.push({
          name: leadData.name,
          email: leadData.email,
          destination: leadData.destination,
          error: leadError.message
        })
      }
    }

    // Log import activity
    await execute(`
      INSERT INTO import_logs (user_id, import_type, total_records, successful_imports, failed_imports, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [
      decoded.id,
      'google_sheets',
      leads.length,
      importedLeads.length,
      errors.length + skippedLeads.length
    ])

    return Response.json({
      success: true,
      message: `Successfully imported ${importedLeads.length} leads`,
      data: {
        imported: importedLeads,
        skipped: skippedLeads,
        errors: errors,
        summary: {
          total: leads.length,
          imported: importedLeads.length,
          skipped: skippedLeads.length,
          errors: errors.length
        }
      }
    })

  } catch (error) {
    console.error('Google Sheets import error:', error)
    return Response.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

// GET /api/leads/import-google-sheets/template - Get sample template
async function GET(request) {
  try {
    const template = googleSheetsService.getSampleTemplate()
    
    return Response.json({
      success: true,
      data: {
        template,
        instructions: [
          '1. Copy the template above to a new Google Sheet',
          '2. Fill in your lead data following the column headers',
          '3. Make sure to include at least: Name, Email, Phone, Destination, Source',
          '4. Use valid date formats (YYYY-MM-DD) for travel dates',
          '5. Use valid status values: new, contacted, qualified, proposal, negotiation, closed_won, closed_lost',
          '6. Use valid priority values: low, medium, high, urgent',
          '7. Share the sheet with the service account email if using private sheets',
          '8. Use the "Get shareable link" option and paste the URL in the import form'
        ],
        requiredFields: ['Name', 'Email', 'Phone', 'Destination', 'Source'],
        optionalFields: ['Travel Date', 'Return Date', 'Travelers Count', 'Budget Range', 'Status', 'Priority', 'Notes', 'Assigned To']
      }
    })
  } catch (error) {
    console.error('Template generation error:', error)
    return Response.json({
      success: false,
      message: 'Failed to generate template'
    }, { status: 500 })
  }
}

module.exports = { POST, GET }
