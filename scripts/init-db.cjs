const path = require('path');
const fs = require('fs');

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 .env.local content:', envContent);
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const equalIndex = line.indexOf('=');
      if (equalIndex > 0) {
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        process.env[key] = value;
        console.log(`🔧 Set ${key} = ${key === 'DB_PASSWORD' ? '***' : value}`);
      }
    }
  });
  console.log('✅ Environment variables loaded from .env.local');
} else {
  console.log('⚠️  .env.local file not found');
}

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

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
};

console.log('🔍 Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined',
  DB_NAME: process.env.DB_NAME
});

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    console.log('🔍 Attempting to connect with:', {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database
    });
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error.message);
    return false;
  }
}

// Create database if it doesn't exist
async function createDatabase() {
  try {
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    
    const connection = await mysql.createConnection(tempConfig);
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbConfig.database}' created or already exists`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    return false;
  }
}

// Create tables
async function createTables() {
  try {
    const connection = await pool.getConnection();
    
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
    `);

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
    `);

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
    `);

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
    `);

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
    `);

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
    `);

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
    `);

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
    `);

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
    `);

    connection.release();
    console.log('✅ MySQL tables created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    return false;
  }
}

// Seed the database with initial data
async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Check if users already exist
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('✅ Database already seeded');
      return;
    }
    
    // Create default users
    const users = [
      {
        name: 'Super Administrator',
        email: 'super@travelcrm.com',
        password: await bcrypt.hash('super123', 12),
        role: 'super',
        permissions: JSON.stringify(['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs']),
        avatar: 'https://ui-avatars.com/api/?name=Super&background=dc2626&color=fff'
      },
      {
        name: 'Admin User',
        email: 'admin@travelcrm.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        permissions: JSON.stringify(['all']),
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
      },
      {
        name: 'Sales User',
        email: 'sales@travelcrm.com',
        password: await bcrypt.hash('sales123', 12),
        role: 'sales',
        permissions: JSON.stringify(['leads', 'quotes', 'bookings', 'reports']),
        avatar: 'https://ui-avatars.com/api/?name=Sales&background=10b981&color=fff'
      }
    ];
    
    for (const user of users) {
      await pool.execute(`
        INSERT INTO users (name, email, password, role, permissions, avatar)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.name, user.email, user.password, user.role, user.permissions, user.avatar]);
    }
    
    console.log('✅ Users created');
    
    // Create sample customers
    const customers = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
        date_of_birth: '1985-06-15',
        passport_number: 'US123456789',
        passport_expiry: '2030-06-15',
        emergency_contact_name: 'Jane Smith',
        emergency_contact_phone: '+1-555-0124',
        notes: 'Prefers window seats, vegetarian meals',
        created_by: 1
      },
      {
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1-555-0125',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postal_code: '90210',
        date_of_birth: '1990-03-22',
        passport_number: 'US987654321',
        passport_expiry: '2029-03-22',
        emergency_contact_name: 'Carlos Garcia',
        emergency_contact_phone: '+1-555-0126',
        notes: 'Allergic to nuts, needs wheelchair assistance',
        created_by: 1
      },
      {
        first_name: 'David',
        last_name: 'Johnson',
        email: 'david.johnson@email.com',
        phone: '+1-555-0127',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postal_code: '60601',
        date_of_birth: '1978-11-08',
        passport_number: 'US456789123',
        passport_expiry: '2031-11-08',
        emergency_contact_name: 'Sarah Johnson',
        emergency_contact_phone: '+1-555-0128',
        notes: 'Business traveler, frequent flyer',
        created_by: 2
      }
    ];
    
    for (const customer of customers) {
      await pool.execute(`
        INSERT INTO customers (
          first_name, last_name, email, phone, address, city, state, country,
          postal_code, date_of_birth, passport_number, passport_expiry,
          emergency_contact_name, emergency_contact_phone, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customer.first_name, customer.last_name, customer.email, customer.phone,
        customer.address, customer.city, customer.state, customer.country,
        customer.postal_code, customer.date_of_birth, customer.passport_number,
        customer.passport_expiry, customer.emergency_contact_name,
        customer.emergency_contact_phone, customer.notes, customer.created_by
      ]);
    }
    
    console.log('✅ Sample customers created');
    
    // Create sample leads
    const leads = [
      {
        customer_id: 1,
        source: 'New York',
        destination: 'Paris, France',
        travel_date: '2024-06-15',
        return_date: '2024-06-25',
        travelers_count: 2,
        budget_range: '$3000-$5000',
        status: 'qualified',
        priority: 'high',
        notes: 'Honeymoon trip, interested in luxury accommodations',
        assigned_to: 3,
        created_by: 1
      },
      {
        customer_id: 2,
        source: 'Los Angeles',
        destination: 'Tokyo, Japan',
        travel_date: '2024-07-10',
        return_date: '2024-07-20',
        travelers_count: 1,
        budget_range: '$2000-$3000',
        status: 'contacted',
        priority: 'medium',
        notes: 'Solo travel, interested in cultural experiences',
        assigned_to: 3,
        created_by: 2
      },
      {
        customer_id: 3,
        source: 'Chicago',
        destination: 'London, UK',
        travel_date: '2024-08-05',
        return_date: '2024-08-12',
        travelers_count: 1,
        budget_range: '$1500-$2500',
        status: 'new',
        priority: 'low',
        notes: 'Business trip, needs flexible dates',
        assigned_to: 3,
        created_by: 1
      }
    ];
    
    for (const lead of leads) {
      await pool.execute(`
        INSERT INTO leads (
          customer_id, source, destination, travel_date, return_date,
          travelers_count, budget_range, status, priority, notes, assigned_to, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lead.customer_id, lead.source, lead.destination, lead.travel_date,
        lead.return_date, lead.travelers_count, lead.budget_range,
        lead.status, lead.priority, lead.notes, lead.assigned_to, lead.created_by
      ]);
    }
    
    console.log('✅ Sample leads created');
    
    // Create sample quotes
    const quotes = [
      {
        lead_id: 1,
        customer_id: 1,
        quote_number: 'QT-20241201-001',
        title: 'Paris Honeymoon Package',
        description: '10-day luxury honeymoon package to Paris including flights, hotel, and activities',
        total_amount: 4500.00,
        currency: 'USD',
        valid_until: '2024-12-31',
        status: 'sent',
        terms_conditions: 'Valid for 30 days. 50% deposit required to confirm booking.',
        created_by: 3
      },
      {
        lead_id: 2,
        customer_id: 2,
        quote_number: 'QT-20241201-002',
        title: 'Tokyo Cultural Experience',
        description: '10-day cultural tour of Tokyo with traditional experiences',
        total_amount: 2800.00,
        currency: 'USD',
        valid_until: '2024-12-31',
        status: 'draft',
        terms_conditions: 'Valid for 30 days. 30% deposit required to confirm booking.',
        created_by: 3
      }
    ];
    
    for (const quote of quotes) {
      await pool.execute(`
        INSERT INTO quotes (
          lead_id, customer_id, quote_number, title, description,
          total_amount, currency, valid_until, status, terms_conditions, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        quote.lead_id, quote.customer_id, quote.quote_number, quote.title,
        quote.description, quote.total_amount, quote.currency, quote.valid_until,
        quote.status, quote.terms_conditions, quote.created_by
      ]);
    }
    
    console.log('✅ Sample quotes created');
    
    // Create sample quote items
    const quoteItems = [
      // Paris package items
      { quote_id: 1, item_type: 'Flight', description: 'Round-trip flights NYC to Paris', quantity: 2, unit_price: 1200.00, total_price: 2400.00 },
      { quote_id: 1, item_type: 'Accommodation', description: '5-star hotel in Paris (8 nights)', quantity: 1, unit_price: 1500.00, total_price: 1500.00 },
      { quote_id: 1, item_type: 'Activities', description: 'City tour and Seine river cruise', quantity: 1, unit_price: 300.00, total_price: 300.00 },
      { quote_id: 1, item_type: 'Meals', description: 'Daily breakfast and 3 dinners', quantity: 1, unit_price: 300.00, total_price: 300.00 },
      
      // Tokyo package items
      { quote_id: 2, item_type: 'Flight', description: 'Round-trip flights LAX to Tokyo', quantity: 1, unit_price: 1000.00, total_price: 1000.00 },
      { quote_id: 2, item_type: 'Accommodation', description: 'Traditional ryokan (8 nights)', quantity: 1, unit_price: 1200.00, total_price: 1200.00 },
      { quote_id: 2, item_type: 'Activities', description: 'Cultural experiences and tours', quantity: 1, unit_price: 400.00, total_price: 400.00 },
      { quote_id: 2, item_type: 'Transportation', description: 'JR Pass for local travel', quantity: 1, unit_price: 200.00, total_price: 200.00 }
    ];
    
    for (const item of quoteItems) {
      await pool.execute(`
        INSERT INTO quote_items (quote_id, item_type, description, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [item.quote_id, item.item_type, item.description, item.quantity, item.unit_price, item.total_price]);
    }
    
    console.log('✅ Sample quote items created');
    
    // Create sample booking
    const booking = {
      quote_id: 1,
      customer_id: 1,
      booking_number: 'BK-20241201-001',
      title: 'Paris Honeymoon Package',
      description: 'Confirmed booking for Paris honeymoon package',
      total_amount: 4500.00,
      currency: 'USD',
      deposit_amount: 2250.00,
      balance_amount: 2250.00,
      travel_date: '2024-06-15',
      return_date: '2024-06-25',
      status: 'confirmed',
      payment_status: 'partial',
      special_requests: 'Anniversary celebration, room upgrade requested',
      created_by: 3
    };
    
    await pool.execute(`
      INSERT INTO bookings (
        quote_id, customer_id, booking_number, title, description,
        total_amount, currency, deposit_amount, balance_amount,
        travel_date, return_date, status, payment_status, special_requests, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      booking.quote_id, booking.customer_id, booking.booking_number, booking.title,
      booking.description, booking.total_amount, booking.currency, booking.deposit_amount,
      booking.balance_amount, booking.travel_date, booking.return_date, booking.status,
      booking.payment_status, booking.special_requests, booking.created_by
    ]);
    
    console.log('✅ Sample booking created');
    
    // Create sample payment
    const payment = {
      booking_id: 1,
      amount: 2250.00,
      currency: 'USD',
      payment_method: 'Credit Card',
      payment_date: '2024-12-01',
      reference_number: 'TXN-20241201-001',
      notes: 'Initial deposit payment',
      created_by: 3
    };
    
    await pool.execute(`
      INSERT INTO payments (
        booking_id, amount, currency, payment_method, payment_date, reference_number, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      payment.booking_id, payment.amount, payment.currency, payment.payment_method,
      payment.payment_date, payment.reference_number, payment.notes, payment.created_by
    ]);
    
    console.log('✅ Sample payment created');
    
    // Create sample activities
    const activities = [
      {
        entity_type: 'lead',
        entity_id: 1,
        activity_type: 'note',
        title: 'Initial contact made',
        description: 'Customer called to inquire about honeymoon packages to Paris',
        created_by: 3
      },
      {
        entity_type: 'lead',
        entity_id: 1,
        activity_type: 'status_change',
        title: 'Lead qualified',
        description: 'Customer has confirmed budget and travel dates',
        created_by: 3
      },
      {
        entity_type: 'quote',
        entity_id: 1,
        activity_type: 'created',
        title: 'Quote created',
        description: 'Detailed quote prepared for Paris honeymoon package',
        created_by: 3
      },
      {
        entity_type: 'quote',
        entity_id: 1,
        activity_type: 'sent',
        title: 'Quote sent to customer',
        description: 'Quote emailed to customer for review',
        created_by: 3
      },
      {
        entity_type: 'booking',
        entity_id: 1,
        activity_type: 'created',
        title: 'Booking confirmed',
        description: 'Customer accepted quote and booking was created',
        created_by: 3
      },
      {
        entity_type: 'booking',
        entity_id: 1,
        activity_type: 'payment',
        title: 'Deposit received',
        description: 'Initial deposit of $2,250 received via credit card',
        created_by: 3
      }
    ];
    
    for (const activity of activities) {
      await pool.execute(`
        INSERT INTO activities (entity_type, entity_id, activity_type, title, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        activity.entity_type, activity.entity_id, activity.activity_type,
        activity.title, activity.description, activity.created_by
      ]);
    }
    
    console.log('✅ Sample activities created');
    
    // Create system settings
    const settings = [
      { key: 'company_name', value: 'Travel CRM', description: 'Company name' },
      { key: 'company_email', value: 'info@travelcrm.com', description: 'Company email' },
      { key: 'company_phone', value: '+1-555-TRAVEL', description: 'Company phone' },
      { key: 'default_currency', value: 'USD', description: 'Default currency' },
      { key: 'quote_validity_days', value: '30', description: 'Default quote validity in days' },
      { key: 'deposit_percentage', value: '50', description: 'Default deposit percentage' }
    ];
    
    for (const setting of settings) {
      await pool.execute(`
        INSERT INTO settings (\`key\`, value, description, updated_by)
        VALUES (?, ?, ?, ?)
      `, [setting.key, setting.value, setting.description, 1]);
    }
    
    console.log('✅ System settings created');
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Initialize database
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing Travel CRM MySQL Database...');
    
    // Skip database creation since it already exists
    console.log('✅ Database already exists, skipping creation');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to MySQL database');
    }
    
    // Create tables
    await createTables();
    
    // Seed with initial data
    await seedDatabase();
    
    console.log('🎉 Database initialization completed!');
    console.log('\n📋 Default Login Credentials:');
    console.log('Super User: super@travelcrm.com / super123');
    console.log('Admin User: admin@travelcrm.com / admin123');
    console.log('Sales User: sales@travelcrm.com / sales123');
    console.log('\n🌐 Start your application with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
