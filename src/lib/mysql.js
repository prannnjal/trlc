const mysql = require('mysql2/promise')

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'travel_crm_user',
  password: process.env.DB_PASSWORD || '1234567890',
  database: process.env.DB_NAME || 'travel_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    return false
  }
}

// Execute a query and return results
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// Execute a query and return single result
const queryOne = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows.length > 0 ? rows[0] : null
  } catch (error) {
    console.error('QueryOne error:', error)
    throw error
  }
}

// Execute a query (INSERT, UPDATE, DELETE) and return result
const execute = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params)
    return result
  } catch (error) {
    console.error('Execute error:', error)
    throw error
  }
}

// Get connection from pool
const getConnection = async () => {
  try {
    return await pool.getConnection()
  } catch (error) {
    console.error('Get connection error:', error)
    throw error
  }
}

// Close all connections
const closePool = async () => {
  try {
    await pool.end()
    console.log('Database pool closed')
  } catch (error) {
    console.error('Close pool error:', error)
    throw error
  }
}

// Transaction helper
const transaction = async (callback) => {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Health check
const healthCheck = async () => {
  try {
    const result = await queryOne('SELECT 1 as health')
    return result && result.health === 1
  } catch (error) {
    console.error('Health check failed:', error)
    return false
  }
}

// Get database stats
const getStats = async () => {
  try {
    const stats = await queryOne(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM leads) as total_leads,
        (SELECT COUNT(*) FROM quotes) as total_quotes,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM payments) as total_payments
    `)
    return stats
  } catch (error) {
    console.error('Get stats error:', error)
    return null
  }
}

// Backup database (basic implementation)
const backupDatabase = async () => {
  try {
    const tables = ['users', 'customers', 'leads', 'quotes', 'bookings', 'payments', 'activities', 'settings']
    const backup = {}
    
    for (const table of tables) {
      backup[table] = await query(`SELECT * FROM ${table}`)
    }
    
    return backup
  } catch (error) {
    console.error('Backup error:', error)
    throw error
  }
}

// Restore database (basic implementation)
const restoreDatabase = async (backup) => {
  try {
    await transaction(async (connection) => {
      // Clear existing data
      const tables = ['activities', 'payments', 'bookings', 'quotes', 'leads', 'customers', 'users', 'settings']
      
      for (const table of tables) {
        await connection.execute(`DELETE FROM ${table}`)
      }
      
      // Restore data
      for (const [table, data] of Object.entries(backup)) {
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          const placeholders = columns.map(() => '?').join(', ')
          const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
          
          for (const row of data) {
            const values = columns.map(col => row[col])
            await connection.execute(sql, values)
          }
        }
      }
    })
    
    console.log('Database restored successfully')
    return true
  } catch (error) {
    console.error('Restore error:', error)
    throw error
  }
}

// Initialize database tables
const initializeTables = async () => {
  try {
    // Users table
    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super', 'admin', 'caller') NOT NULL DEFAULT 'caller',
        permissions JSON,
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Customers table
    await execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        company VARCHAR(100),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        country VARCHAR(50),
        postal_code VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Leads table
    await execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        source VARCHAR(50),
        status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost') DEFAULT 'new',
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        value DECIMAL(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Quotes table
    await execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        lead_id INT,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
        valid_until DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Bookings table
    await execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        quote_id INT,
        booking_reference VARCHAR(50) UNIQUE,
        destination VARCHAR(200),
        departure_date DATE,
        return_date DATE,
        travelers INT DEFAULT 1,
        total_amount DECIMAL(10,2),
        status ENUM('confirmed', 'pending', 'cancelled', 'completed') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Payments table
    await execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_method ENUM('credit_card', 'bank_transfer', 'cash', 'check', 'other') NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
        transaction_id VARCHAR(100),
        payment_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Activities table
    await execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('call', 'email', 'meeting', 'note', 'task', 'other') NOT NULL,
        subject VARCHAR(200),
        description TEXT,
        related_type ENUM('customer', 'lead', 'quote', 'booking', 'payment') NOT NULL,
        related_id INT NOT NULL,
        due_date DATETIME,
        completed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `)
    
    // Settings table
    await execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    
    console.log('✅ Database tables initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Error initializing tables:', error)
    throw error
  }
}

module.exports = {
  pool,
  testConnection,
  query,
  queryOne,
  execute,
  getConnection,
  closePool,
  transaction,
  healthCheck,
  getStats,
  backupDatabase,
  restoreDatabase,
  initializeTables
}