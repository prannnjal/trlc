import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { query, queryOne, execute } from './mysql.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: JSON.parse(user.permissions || '[]')
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Get user by email
export const getUserByEmail = async (email) => {
  return await queryOne('SELECT * FROM users WHERE email = ? AND is_active = 1', [email])
}

// Get user by ID
export const getUserById = async (id) => {
  return await queryOne('SELECT * FROM users WHERE id = ? AND is_active = 1', [id])
}

// Create user
export const createUser = async (userData) => {
  const { name, email, password, role = 'sales', permissions = '[]' } = userData
  
  const hashedPassword = await hashPassword(password)
  
  const result = await execute(`
    INSERT INTO users (name, email, password, role, permissions)
    VALUES (?, ?, ?, ?, ?)
  `, [name, email, hashedPassword, role, permissions])
  
  return {
    id: result.insertId,
    name,
    email,
    role,
    permissions: JSON.parse(permissions)
  }
}

// Update user
export const updateUser = async (id, userData) => {
  const { name, email, role, permissions, is_active } = userData
  
  let sql = 'UPDATE users SET '
  let params = []
  let setParts = []
  
  if (name !== undefined) {
    setParts.push('name = ?')
    params.push(name)
  }
  
  if (email !== undefined) {
    setParts.push('email = ?')
    params.push(email)
  }
  
  if (role !== undefined) {
    setParts.push('role = ?')
    params.push(role)
  }
  
  if (permissions !== undefined) {
    setParts.push('permissions = ?')
    params.push(JSON.stringify(permissions))
  }
  
  if (is_active !== undefined) {
    setParts.push('is_active = ?')
    params.push(is_active)
  }
  
  setParts.push('updated_at = CURRENT_TIMESTAMP')
  sql += setParts.join(', ') + ' WHERE id = ?'
  params.push(id)
  
  const result = await execute(sql, params)
  
  return result.affectedRows > 0
}

// Get all users
export const getAllUsers = async () => {
  return await query(`
    SELECT id, name, email, role, permissions, avatar, is_active, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `)
}

// Check if user has permission
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false
  if (user.permissions.includes('all')) return true
  return user.permissions.includes(permission)
}

// Check if user is super user
export const isSuperUser = (user) => {
  return user && user.role === 'super'
}

// Check if user is admin
export const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.role === 'super')
}
