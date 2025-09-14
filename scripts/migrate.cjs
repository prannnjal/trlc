const mysql = require('mysql2/promise')
const path = require('path')
const fs = require('fs')

// Load environment variables
require('dotenv').config()

async function runMigrations() {
  let connection
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'travel_crm',
      // Add connection options for better compatibility
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    })

    console.log('🔄 Running database migrations...')

    // Run import_logs migration
    console.log('📝 Creating import_logs table...')
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS import_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        import_type VARCHAR(50) NOT NULL,
        total_records INT NOT NULL DEFAULT 0,
        successful_imports INT NOT NULL DEFAULT 0,
        failed_imports INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_import_type (import_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ Created import_logs table')

    // Add email and phone columns to leads table if they don't exist
    console.log('📝 Adding email and phone columns to leads table...')
    try {
      await connection.execute(`
        ALTER TABLE leads 
        ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS phone VARCHAR(50) NULL
      `)
      console.log('✅ Added email and phone columns to leads table')
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Email and phone columns already exist in leads table')
      } else {
        throw error
      }
    }

    console.log('🎉 All migrations completed successfully!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run migrations
runMigrations()
