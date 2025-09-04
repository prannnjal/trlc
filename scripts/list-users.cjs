const mysql = require('mysql2/promise');

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

async function listUsers() {
  try {
    console.log('👥 Travel CRM User Hierarchy\n');
    
    // Get all users with creator information
    const [users] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.created_by,
             creator.name as created_by_name, creator.role as created_by_role
      FROM users u
      LEFT JOIN users creator ON u.created_by = creator.id
      ORDER BY u.id
    `);
    
    // Group users by role
    const superUsers = users.filter(u => u.role === 'super');
    const adminUsers = users.filter(u => u.role === 'admin');
    const callerUsers = users.filter(u => u.role === 'caller');
    
    // Display Super Users
    console.log('🔴 SUPER USERS:');
    superUsers.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.email})`);
      console.log(`      Created: ${user.created_at.toISOString().split('T')[0]}`);
      console.log(`      Status: ${user.is_active ? 'Active' : 'Inactive'}`);
      console.log('');
    });
    
    // Display Admin Users
    console.log('🔵 ADMIN USERS:');
    adminUsers.forEach(user => {
      const creator = user.created_by_name ? `by ${user.created_by_name}` : 'System';
      console.log(`   ${user.id}. ${user.name} (${user.email})`);
      console.log(`      Created: ${user.created_at.toISOString().split('T')[0]} ${creator}`);
      console.log(`      Status: ${user.is_active ? 'Active' : 'Inactive'}`);
      console.log('');
    });
    
    // Display Caller Users
    console.log('🟢 CALLER USERS:');
    callerUsers.forEach(user => {
      const creator = user.created_by_name ? `by ${user.created_by_name}` : 'System';
      console.log(`   ${user.id}. ${user.name} (${user.email})`);
      console.log(`      Created: ${user.created_at.toISOString().split('T')[0]} ${creator}`);
      console.log(`      Status: ${user.is_active ? 'Active' : 'Inactive'}`);
      console.log('');
    });
    
    // Display hierarchy summary
    console.log('📊 HIERARCHY SUMMARY:');
    console.log(`   Super Users: ${superUsers.length}`);
    console.log(`   Admin Users: ${adminUsers.length}`);
    console.log(`   Caller Users: ${callerUsers.length}`);
    console.log(`   Total Users: ${users.length}`);
    
    // Show hierarchy tree
    console.log('\n🌳 HIERARCHY TREE:');
    superUsers.forEach(superUser => {
      console.log(`   ${superUser.name} (Super)`);
      
      // Find admins created by this super user
      const adminsBySuper = adminUsers.filter(admin => admin.created_by === superUser.id);
      adminsBySuper.forEach(admin => {
        console.log(`   ├── ${admin.name} (Admin)`);
        
        // Find callers created by this admin
        const callersByAdmin = callerUsers.filter(caller => caller.created_by === admin.id);
        callersByAdmin.forEach(caller => {
          console.log(`   │   └── ${caller.name} (Caller)`);
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the function
listUsers()
  .then(() => {
    console.log('\n🎉 User listing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User listing failed:', error);
    process.exit(1);
  });
