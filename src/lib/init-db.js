import { seedDatabase } from './seed.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
  console.log('📁 Created data directory')
}

// Initialize database
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Travel CRM Database...')
    
    // Import database to trigger table creation
    await import('./database.js')
    console.log('✅ Database tables created')
    
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
