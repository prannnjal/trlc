const { runMigrations } = require('../src/lib/migrate.js')
const { initializeDatabase } = require('../src/lib/database.js')

async function main() {
  try {
    console.log('🚀 Starting database migration...')
    
    // Initialize database connection
    await initializeDatabase()
    
    // Run migrations
    const success = await runMigrations()
    
    if (success) {
      console.log('✅ Database migration completed successfully!')
      process.exit(0)
    } else {
      console.log('❌ Database migration failed!')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

main()
