import { seedDatabase } from './seed.js'
import { initializeDatabase as initDB } from './database.js'

// Initialize database
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Travel CRM MySQL Database...')
    
    // Initialize database and create tables
    await initDB()
    
    // Seed with initial data
    await seedDatabase()
    
    console.log('🎉 Database initialization completed!')
    console.log('\n📋 Default Login Credentials:')
    console.log('Super User: super@travelcrm.com / super123')
    console.log('Admin User: admin@travelcrm.com / admin123')
    console.log('Sales User: sales@travelcrm.com / sales123')
    console.log('\n🌐 Start your application with: npm run dev')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Run initialization if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error)
      process.exit(1)
    })
}
