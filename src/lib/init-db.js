const { seedDatabase } = require('./seed.js')
const { initializeDatabase: initDB } = require('./database.js')

// Initialize database
const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Travel CRM MySQL Database...')
    
    // Initialize database and create tables
    await initDB()
    
    // Seed with initial data
    await seedDatabase()
    
    console.log('🎉 Database initialization completed!')
    console.log('\n📋 Default Login Credentials:')
    console.log('Super User: super@travelcrm.com / super123')
    console.log('Admin User: admin1@travelcrm.com / admin123')
    console.log('Caller User: caller1@travelcrm.com / caller123')
    console.log('\n🌐 Start your application with: npm run dev')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
}

module.exports = { initializeDatabase }