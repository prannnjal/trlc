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

async function createUser() {
  try {
    console.log('🚀 Creating User...');
    
    // Get user input from command line arguments
    const args = process.argv.slice(2);
    const name = args[0];
    const email = args[1];
    const password = args[2];
    const role = args[3] || 'caller';
    const createdByEmail = args[4] || 'super@travelcrm.com';
    
    if (!name || !email || !password) {
      console.log('❌ Usage: npm run create-user "Name" "email@example.com" "password" [role] [createdByEmail]');
      console.log('   role: super, admin, or caller (default: caller)');
      console.log('   createdByEmail: email of the user creating this user (default: super@travelcrm.com)');
      return;
    }
    
    console.log(`📝 Creating user: ${name} (${email}) with role: ${role}`);
    
    // Check if user already exists
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length > 0) {
      console.log('⚠️  User with this email already exists');
      return;
    }
    
    // Get creator user
    const [creatorResult] = await pool.execute(
      'SELECT id, role FROM users WHERE email = ?',
      [createdByEmail]
    );
    
    if (creatorResult.length === 0) {
      console.log(`❌ Creator user with email ${createdByEmail} not found`);
      return;
    }
    
    const creator = creatorResult[0];
    
    // Validate role hierarchy
    if (creator.role === 'admin' && role !== 'caller') {
      console.log('❌ Admins can only create caller users');
      return;
    }
    if (creator.role === 'caller') {
      console.log('❌ Caller users cannot create other users');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Set default permissions based on role
    let permissions = [];
    let avatarColor = '10b981'; // green for caller
    
    if (role === 'super') {
      permissions = ['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs'];
      avatarColor = 'dc2626'; // red for super
    } else if (role === 'admin') {
      permissions = ['leads', 'quotes', 'bookings', 'reports', 'user_management'];
      avatarColor = '3b82f6'; // blue for admin
    } else {
      permissions = ['leads', 'quotes', 'bookings'];
    }
    
    // Create user
    const [result] = await pool.execute(`
      INSERT INTO users (name, email, password, role, permissions, avatar, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      email,
      hashedPassword,
      role,
      JSON.stringify(permissions),
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${avatarColor}&color=fff`,
      creator.id
    ]);
    
    console.log('✅ User created successfully!');
    console.log(`📋 Login Credentials:`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   User ID: ${result.insertId}`);
    console.log(`   Created by: ${creator.role} (${createdByEmail})`);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the function
createUser()
  .then(() => {
    console.log('🎉 User creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User creation failed:', error);
    process.exit(1);
  });
