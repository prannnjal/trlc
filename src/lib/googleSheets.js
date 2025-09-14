import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

class GoogleSheetsService {
  constructor() {
    this.auth = null
    this.sheets = null
  }

  // Initialize authentication with service account
  async initializeAuth() {
    try {
      // Service account credentials (should be in environment variables)
      const credentials = {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
      }

      this.auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      })

      this.sheets = google.sheets({ version: 'v4', auth: this.auth })
      return true
    } catch (error) {
      console.error('Google Sheets authentication error:', error)
      return false
    }
  }

  // Parse Google Sheets URL to extract spreadsheet ID
  parseSpreadsheetUrl(url) {
    try {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      return match ? match[1] : null
    } catch (error) {
      console.error('Error parsing spreadsheet URL:', error)
      return null
    }
  }

  // Get spreadsheet data
  async getSpreadsheetData(spreadsheetId, range = 'Sheet1!A:Z') {
    try {
      if (!this.sheets) {
        const authSuccess = await this.initializeAuth()
        if (!authSuccess) {
          throw new Error('Failed to initialize Google Sheets authentication')
        }
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      })

      return response.data.values || []
    } catch (error) {
      console.error('Error fetching spreadsheet data:', error)
      throw new Error(`Failed to fetch data from Google Sheets: ${error.message}`)
    }
  }

  // Validate spreadsheet format for leads
  validateLeadData(data) {
    if (!data || data.length < 2) {
      return {
        isValid: false,
        error: 'Spreadsheet must have at least a header row and one data row'
      }
    }

    const headers = data[0].map(h => h?.toString().toLowerCase().trim())
    const requiredFields = ['name', 'email', 'phone', 'destination', 'source']
    const missingFields = requiredFields.filter(field => !headers.includes(field))

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingFields.join(', ')}`
      }
    }

    return { isValid: true, headers }
  }

  // Parse leads data from spreadsheet
  parseLeadsData(data, headers) {
    const leads = []
    const errors = []

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const lead = {}
      const rowErrors = []

      // Map data to lead object
      headers.forEach((header, index) => {
        const value = row[index]?.toString().trim() || ''
        
        switch (header) {
          case 'name':
            if (!value) rowErrors.push('Name is required')
            lead.name = value
            break
          case 'email':
            if (!value) rowErrors.push('Email is required')
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              rowErrors.push('Invalid email format')
            }
            lead.email = value
            break
          case 'phone':
            lead.phone = value
            break
          case 'destination':
            if (!value) rowErrors.push('Destination is required')
            lead.destination = value
            break
          case 'source':
            if (!value) rowErrors.push('Source is required')
            lead.source = value
            break
          case 'travel_date':
            if (value) {
              const date = new Date(value)
              if (isNaN(date.getTime())) {
                rowErrors.push('Invalid travel date format')
              } else {
                lead.travel_date = date.toISOString().split('T')[0]
              }
            }
            break
          case 'return_date':
            if (value) {
              const date = new Date(value)
              if (isNaN(date.getTime())) {
                rowErrors.push('Invalid return date format')
              } else {
                lead.return_date = date.toISOString().split('T')[0]
              }
            }
            break
          case 'travelers_count':
            if (value) {
              const count = parseInt(value)
              if (isNaN(count) || count < 1) {
                rowErrors.push('Travelers count must be a positive number')
              } else {
                lead.travelers_count = count
              }
            } else {
              lead.travelers_count = 1
            }
            break
          case 'budget_range':
            lead.budget_range = value
            break
          case 'status':
            const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
            if (value && !validStatuses.includes(value.toLowerCase())) {
              rowErrors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
            } else {
              lead.status = value ? value.toLowerCase() : 'new'
            }
            break
          case 'priority':
            const validPriorities = ['low', 'medium', 'high', 'urgent']
            if (value && !validPriorities.includes(value.toLowerCase())) {
              rowErrors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`)
            } else {
              lead.priority = value ? value.toLowerCase() : 'medium'
            }
            break
          case 'notes':
            lead.notes = value
            break
          case 'assigned_to':
            if (value) {
              const assignedId = parseInt(value)
              if (isNaN(assignedId)) {
                rowErrors.push('Assigned to must be a valid user ID')
              } else {
                lead.assigned_to = assignedId
              }
            }
            break
        }
      })

      if (rowErrors.length > 0) {
        errors.push({
          row: i + 1,
          errors: rowErrors,
          data: row
        })
      } else {
        leads.push(lead)
      }
    }

    return { leads, errors }
  }

  // Get sample spreadsheet template
  getSampleTemplate() {
    return [
      ['Name', 'Email', 'Phone', 'Destination', 'Source', 'Travel Date', 'Return Date', 'Travelers Count', 'Budget Range', 'Status', 'Priority', 'Notes', 'Assigned To'],
      ['John Doe', 'john@example.com', '+1234567890', 'Paris', 'Website', '2024-06-15', '2024-06-22', '2', '5000-8000', 'new', 'medium', 'Interested in city tour', ''],
      ['Jane Smith', 'jane@example.com', '+1234567891', 'Tokyo', 'Social Media', '2024-07-10', '2024-07-17', '1', '3000-5000', 'contacted', 'high', 'Business trip', '2']
    ]
  }
}

export default new GoogleSheetsService()
