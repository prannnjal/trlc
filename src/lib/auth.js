const { SignJWT, jwtVerify } = require('jose')
const bcrypt = require('bcryptjs')
const { query, queryOne, execute } = require('./mysql.js')

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-make-it-long-and-random')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
const generateToken = async (user) => {
  const token = await new SignJWT({ 
    id: user.id, 
    email: user.email, 
    role: user.role,
    name: user.name
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
  
  return token
}

// Verify JWT token
const verifyToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// Create user
const createUser = async (userData, createdBy = null) => {
  const { name, email, password, role, permissions } = userData
  
  // Hash password
  const hashedPassword = await hashPassword(password)
  
  // Set default permissions if not provided
  let userPermissions = permissions
  if (!userPermissions || userPermissions.length === 0) {
    if (role === 'super') {
      userPermissions = ['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs']
    } else if (role === 'admin') {
      userPermissions = ['leads', 'quotes', 'bookings', 'reports', 'user_management']
    } else if (role === 'caller') {
      userPermissions = ['leads', 'quotes', 'bookings']
    }
  }
  
  // Create user
  const result = await execute(`
    INSERT INTO users (name, email, password, role, permissions, avatar, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    name,
    email,
    hashedPassword,
    role,
    JSON.stringify(userPermissions),
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${role === 'super' ? 'dc2626' : role === 'admin' ? '3b82f6' : '10b981'}&color=fff`,
    createdBy
  ])
  
  return {
    id: result.insertId,
    name,
    email,
    role,
    permissions: userPermissions,
    created_by: createdBy
  }
}

// Get user by email
const getUserByEmail = async (email) => {
  const user = await queryOne('SELECT * FROM users WHERE email = ?', [email])
  if (user && user.permissions) {
    // Handle both string and array permissions
    if (typeof user.permissions === 'string') {
      try {
        user.permissions = JSON.parse(user.permissions)
      } catch (e) {
        console.error('Error parsing permissions:', e)
        user.permissions = []
      }
    }
  }
  return user
}

// Get user by ID
const getUserById = async (id) => {
  const user = await queryOne('SELECT * FROM users WHERE id = ?', [id])
  if (user && user.permissions) {
    // Handle both string and array permissions
    if (typeof user.permissions === 'string') {
      try {
        user.permissions = JSON.parse(user.permissions)
      } catch (e) {
        console.error('Error parsing permissions:', e)
        user.permissions = []
      }
    }
  }
  return user
}

// Get all users (for admin/super user)
const getAllUsers = async () => {
  const users = await query(`
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.created_by,
           creator.name as created_by_name
    FROM users u
    LEFT JOIN users creator ON u.created_by = creator.id
    ORDER BY u.created_at DESC
  `)
  
  return users.map(user => ({
    ...user,
    permissions: user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : []
  }))
}

// Get users created by a specific user (for hierarchy)
const getUsersCreatedBy = async (creatorId) => {
  const users = await query(`
    SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at
    FROM users u
    WHERE u.created_by = ?
    ORDER BY u.created_at DESC
  `, [creatorId])
  
  return users.map(user => ({
    ...user,
    permissions: user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : []
  }))
}

// Get manageable users based on role and hierarchy
const getManageableUsers = async (user) => {
  if (user.role === 'super') {
    // Super users can see all users
    return await getAllUsers()
  } else if (user.role === 'admin') {
    // Admins can see users they created and their own users
    const createdUsers = await getUsersCreatedBy(user.id)
    return [user, ...createdUsers]
  } else {
    // Callers can only see themselves
    return [user]
  }
}

// Check if user is a caller
const isCaller = (user) => {
  return user && user.role === 'caller'
}

// Check if user can create other users
const canCreateUsers = (user) => {
  return user && (user.role === 'super' || user.role === 'admin')
}

// Check if user can manage another user
const canManageUser = (manager, targetUser) => {
  if (!manager || !targetUser) return false
  
  // Super users can manage everyone
  if (manager.role === 'super') return true
  
  // Admins can manage users they created
  if (manager.role === 'admin' && targetUser.created_by === manager.id) return true
  
  // Users can manage themselves
  if (manager.id === targetUser.id) return true
  
  return false
}

// Update user
const updateUser = async (id, updates) => {
  const allowedFields = ['name', 'email', 'role', 'permissions', 'is_active']
  const updateFields = []
  const updateValues = []
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`)
      if (key === 'permissions') {
        updateValues.push(JSON.stringify(value))
      } else {
        updateValues.push(value)
      }
    }
  }
  
  if (updateFields.length === 0) {
    throw new Error('No valid fields to update')
  }
  
  updateValues.push(id)
  
  await execute(`
    UPDATE users 
    SET ${updateFields.join(', ')}
    WHERE id = ?
  `, updateValues)
  
  return await getUserById(id)
}

// Delete user
const deleteUser = async (id) => {
  await execute('DELETE FROM users WHERE id = ?', [id])
  return true
}

// Authenticate user
const authenticateUser = async (email, password) => {
  const user = await getUserByEmail(email)
  
  if (!user) {
    throw new Error('Invalid credentials')
  }
  
  if (!user.is_active) {
    throw new Error('Account is deactivated')
  }
  
  const isValidPassword = await verifyPassword(password, user.password)
  
  if (!isValidPassword) {
    throw new Error('Invalid credentials')
  }
  
  // Remove password from user object
  delete user.password
  
  return user
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  getUsersCreatedBy,
  getManageableUsers,
  isCaller,
  canCreateUsers,
  canManageUser,
  updateUser,
  deleteUser,
  authenticateUser
}