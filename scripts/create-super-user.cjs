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

// Create connection pool
const pool = mysql.createPool(dbConfig);

async function createSuperUser() {
  try {
    console.log('🚀 Creating Super User...');
    
    // Get user input from command line arguments
    const args = process.argv.slice(2);
    const name = args[0] || 'Super Administrator';
    const email = args[1] || 'super@travelcrm.com';
    const password = args[2] || 'super123';
    
    console.log(`📝 Creating user: ${name} (${email})`);
    
    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      console.log('⚠️  User with this email already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create super user
    const [result] = await pool.execute(`
      INSERT INTO users (name, email, password, role, permissions, avatar, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      email,
      hashedPassword,
      'super',
      JSON.stringify(['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs']),
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=fff`,
      null // Super user is not created by anyone
    ]);
    
    console.log('✅ Super user created successfully!');
    console.log(`📋 Login Credentials:`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${result.insertId}`);
    
  } catch (error) {
    console.error('❌ Error creating super user:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the function
createSuperUser()
  .then(() => {
    console.log('🎉 Super user creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Super user creation failed:', error);
    process.exit(1);
  });
