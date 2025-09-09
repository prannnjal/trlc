import { execute, query } from './mysql.js'

// Database migration to add 'sales' role to users table
export const migrateAddSalesRole = async () => {
  try {
    console.log('🔄 Starting migration: Add sales role to users table...')
    
    // Check if the sales role already exists
    const result = await query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'role'
    `)
    
    if (result && result.length > 0) {
      const columnType = result[0].COLUMN_TYPE
      console.log('Current role column type:', columnType)
      
      // Check if 'sales' is already in the enum
      if (columnType.includes("'sales'")) {
        console.log('✅ Sales role already exists in users table')
        return true
      }
      
      // Update the enum to include 'sales'
      await execute(`
        ALTER TABLE users 
        MODIFY COLUMN role ENUM('super', 'admin', 'sales', 'caller') NOT NULL DEFAULT 'caller'
      `)
      
      console.log('✅ Successfully added sales role to users table')
      return true
    } else {
      console.log('❌ Users table or role column not found')
      return false
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return false
  }
}

// Run all migrations
export const runMigrations = async () => {
  try {
    console.log('🚀 Running database migrations...')
    
    const migrations = [
      { name: 'Add sales role', fn: migrateAddSalesRole }
    ]
    
    for (const migration of migrations) {
      console.log(`Running migration: ${migration.name}`)
      const success = await migration.fn()
      if (!success) {
        console.error(`❌ Migration failed: ${migration.name}`)
        return false
      }
    }
    
    console.log('✅ All migrations completed successfully')
    return true
  } catch (error) {
    console.error('❌ Migration process failed:', error)
    return false
  }
}
