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

// Database migration to add itineraries table
export const migrateAddItinerariesTable = async () => {
  try {
    console.log('🔄 Starting migration: Add itineraries table...')
    
    // Check if itineraries table already exists
    const result = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'itineraries'
    `)
    
    if (result && result.length > 0) {
      console.log('✅ Itineraries table already exists')
      return true
    }
    
    // Create itineraries table
    await execute(`
      CREATE TABLE itineraries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        trip_name VARCHAR(255),
        destination VARCHAR(255),
        start_date DATE,
        end_date DATE,
        duration INT DEFAULT 0,
        nights INT DEFAULT 0,
        travelers INT DEFAULT 1,
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        hotels JSON,
        activities JSON,
        transportation JSON,
        total_cost DECIMAL(10,2) DEFAULT 0,
        cost_breakdown JSON,
        special_requests TEXT,
        notes TEXT,
        status ENUM('draft', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        INDEX idx_lead_id (lead_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('✅ Successfully created itineraries table')
    return true
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
      { name: 'Add sales role', fn: migrateAddSalesRole },
      { name: 'Add itineraries table', fn: migrateAddItinerariesTable }
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
