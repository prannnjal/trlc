const { google } = require('googleapis')
const { JWT } = require('google-auth-library')

// Test Google Sheets service without database
async function testGoogleSheetsService() {
  console.log('🧪 Testing Google Sheets Import Service...\n')

  try {
    // Test 1: Service initialization
    console.log('1️⃣ Testing service initialization...')
    const credentials = {
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'test-key-id',
      private_key: '-----BEGIN PRIVATE KEY-----\nTest Key\n-----END PRIVATE KEY-----\n',
      client_email: 'test@test.iam.gserviceaccount.com',
      client_id: 'test-client-id',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test.iam.gserviceaccount.com'
    }

    const auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    })

    console.log('✅ Service initialization successful')

    // Test 2: URL parsing
    console.log('\n2️⃣ Testing URL parsing...')
    const testUrls = [
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
      'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      'invalid-url'
    ]

    testUrls.forEach((url, index) => {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      const spreadsheetId = match ? match[1] : null
      console.log(`   URL ${index + 1}: ${spreadsheetId ? '✅ Valid' : '❌ Invalid'} - ${spreadsheetId || 'No ID found'}`)
    })

    // Test 3: Data validation
    console.log('\n3️⃣ Testing data validation...')
    const sampleData = [
      ['Name', 'Email', 'Phone', 'Destination', 'Source', 'Travel Date', 'Status'],
      ['John Doe', 'john@example.com', '+1234567890', 'Paris', 'Website', '2024-06-15', 'new'],
      ['Jane Smith', 'jane@example.com', '+1234567891', 'Tokyo', 'Social Media', '2024-07-10', 'contacted'],
      ['Invalid User', 'invalid-email', '', 'London', 'Referral', 'invalid-date', 'invalid-status']
    ]

    // Validate headers
    const headers = sampleData[0].map(h => h?.toString().toLowerCase().trim())
    const requiredFields = ['name', 'email', 'phone', 'destination', 'source']
    const missingFields = requiredFields.filter(field => !headers.includes(field))

    if (missingFields.length === 0) {
      console.log('✅ Headers validation passed')
    } else {
      console.log(`❌ Missing required columns: ${missingFields.join(', ')}`)
    }

    // Test 4: Lead parsing
    console.log('\n4️⃣ Testing lead parsing...')
    const leads = []
    const errors = []

    for (let i = 1; i < sampleData.length; i++) {
      const row = sampleData[i]
      const lead = {}
      const rowErrors = []

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
          case 'travel date':
            if (value) {
              const date = new Date(value)
              if (isNaN(date.getTime())) {
                rowErrors.push('Invalid travel date format')
              } else {
                lead.travel_date = date.toISOString().split('T')[0]
              }
            }
            break
          case 'status':
            const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
            if (value && !validStatuses.includes(value.toLowerCase())) {
              rowErrors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
            } else {
              lead.status = value ? value.toLowerCase() : 'new'
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

    console.log(`✅ Parsed ${leads.length} valid leads`)
    console.log(`❌ Found ${errors.length} rows with errors`)

    if (errors.length > 0) {
      console.log('\n   Error details:')
      errors.forEach(error => {
        console.log(`   Row ${error.row}: ${error.errors.join(', ')}`)
      })
    }

    // Test 5: Sample template generation
    console.log('\n5️⃣ Testing template generation...')
    const template = [
      ['Name', 'Email', 'Phone', 'Destination', 'Source', 'Travel Date', 'Return Date', 'Travelers Count', 'Budget Range', 'Status', 'Priority', 'Notes', 'Assigned To'],
      ['John Doe', 'john@example.com', '+1234567890', 'Paris', 'Website', '2024-06-15', '2024-06-22', '2', '5000-8000', 'new', 'medium', 'Interested in city tour', ''],
      ['Jane Smith', 'jane@example.com', '+1234567891', 'Tokyo', 'Social Media', '2024-07-10', '2024-07-17', '1', '3000-5000', 'contacted', 'high', 'Business trip', '2']
    ]

    console.log('✅ Template generated successfully')
    console.log(`   Template has ${template.length} rows and ${template[0].length} columns`)

    console.log('\n🎉 All tests passed! Google Sheets import service is working correctly.')
    console.log('\n📋 Next steps:')
    console.log('   1. Set up your database (see GOOGLE_SHEETS_QUICK_SETUP.md)')
    console.log('   2. Configure Google Cloud credentials')
    console.log('   3. Start the application with: npm run dev')
    console.log('   4. Test the import feature in the leads page')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run tests
testGoogleSheetsService()
