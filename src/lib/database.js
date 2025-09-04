// MySQL database configuration and utilities
import { query, queryOne, execute, createDatabase, createTables, testConnection } from './mysql.js'

// Initialize database connection and create tables
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing MySQL database...')
    
    // Create database if it doesn't exist
    await createDatabase()
    
    // Test connection
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Failed to connect to MySQL database')
    }
    
    // Create tables
    await createTables()
    
    console.log('✅ MySQL database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    throw error
  }
}

// Export MySQL utilities
export { query, queryOne, execute, testConnection }

// For backward compatibility, export a default object with query methods
const db = {
  query,
  queryOne,
  execute,
  prepare: (sql) => ({
    get: (params) => queryOne(sql, params),
    all: (params) => query(sql, params),
    run: (params) => execute(sql, params)
  })
}

export default db
