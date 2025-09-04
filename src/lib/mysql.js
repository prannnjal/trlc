import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travel_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message)
    return false
  }
}

// Create database if it doesn't exist
export const createDatabase = async () => {
  try {
    const tempConfig = { ...dbConfig }
    delete tempConfig.database
    
    const connection = await mysql.createConnection(tempConfig)
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    console.log(`✅ Database '${dbConfig.database}' created or already exists`)
    
    await connection.end()
    return true
  } catch (error) {
    console.error('❌ Error creating database:', error.message)
    return false
  }
}

// Create tables
export const createTables = async () => {
  try {
    const connection = await pool.getConnection()
    
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super', 'admin', 'sales') NOT NULL DEFAULT 'sales',
        permissions JSON DEFAULT ('[]'),
        avatar VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Customers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        date_of_birth DATE,
        passport_number VARCHAR(50),
        passport_expiry DATE,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_created_by (created_by),
        INDEX idx_name (first_name, last_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Leads table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        source VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        travel_date DATE,
        return_date DATE,
        travelers_count INT DEFAULT 1,
        budget_range VARCHAR(50),
        status ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost') DEFAULT 'new',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        notes TEXT,
        assigned_to INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_customer_id (customer_id),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_created_by (created_by),
        INDEX idx_travel_date (travel_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Quotes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT,
        customer_id INT NOT NULL,
        quote_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        valid_until DATE,
        status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
        terms_conditions TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_lead_id (lead_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_quote_number (quote_number),
        INDEX idx_status (status),
        INDEX idx_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Quote items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS quote_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote_id INT NOT NULL,
        item_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        quantity INT DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
        INDEX idx_quote_id (quote_id),
        INDEX idx_item_type (item_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Bookings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        quote_id INT,
        customer_id INT NOT NULL,
        booking_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        deposit_amount DECIMAL(10,2) DEFAULT 0,
        balance_amount DECIMAL(10,2) NOT NULL,
        travel_date DATE,
        return_date DATE,
        status ENUM('confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',
        payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
        special_requests TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_quote_id (quote_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_booking_number (booking_number),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_created_by (created_by),
        INDEX idx_travel_date (travel_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_method VARCHAR(50) NOT NULL,
        payment_date DATE NOT NULL,
        reference_number VARCHAR(100),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_booking_id (booking_id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_payment_method (payment_method),
        INDEX idx_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Activities/Notes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entity_type ENUM('customer', 'lead', 'quote', 'booking', 'payment') NOT NULL,
        entity_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_activity_type (activity_type),
        INDEX idx_created_by (created_by),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // System settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_key (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    connection.release()
    console.log('✅ MySQL tables created successfully')
    return true
  } catch (error) {
    console.error('❌ Error creating tables:', error.message)
    return false
  }
}

// Execute query with connection pooling
export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error.message)
    throw error
  }
}

// Execute query and return single row
export const queryOne = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows[0] || null
  } catch (error) {
    console.error('Database query error:', error.message)
    throw error
  }
}

// Execute insert/update/delete and return result
export const execute = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params)
    return result
  } catch (error) {
    console.error('Database execute error:', error.message)
    throw error
  }
}

// Close connection pool
export const closePool = async () => {
  try {
    await pool.end()
    console.log('✅ MySQL connection pool closed')
  } catch (error) {
    console.error('❌ Error closing connection pool:', error.message)
  }
}

export default pool
