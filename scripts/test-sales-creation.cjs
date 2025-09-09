const { createUser, getUserByEmail } = require('../src/lib/auth.js')

async function testSalesCreation() {
  try {
    console.log('🧪 Testing sales account creation...')
    
    // Test data
    const testSalesUser = {
      name: 'Test Sales User',
      email: 'test-sales@example.com',
      password: 'testpassword123',
      role: 'sales'
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(testSalesUser.email)
    if (existingUser) {
      console.log('⚠️  Test user already exists, skipping creation')
      return
    }
    
    // Create sales user
    const user = await createUser(testSalesUser, 1) // created_by = 1 (assuming admin user)
    
    console.log('✅ Sales user created successfully!')
    console.log('User details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      created_by: user.created_by
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
  }
}

testSalesCreation()
