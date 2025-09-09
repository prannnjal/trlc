import { query, queryOne, execute } from './mysql.js'
import { getUserById } from './auth.js'

/**
 * Data Access Layer with Admin Isolation
 * Ensures that admin accounts can only access their own data and data created by their sub-users
 */

// Get the admin hierarchy for a user
export const getAdminHierarchy = async (userId) => {
  const user = await getUserById(userId)
  if (!user) return null

  if (user.role === 'super') {
    // Super users can access everything
    return { canAccessAll: true, adminId: null }
  } else if (user.role === 'admin') {
    // Admin users can access their own data and data from users they created
    return { canAccessAll: false, adminId: userId }
  } else {
    // Sales users can only access their own data
    return { canAccessAll: false, adminId: user.created_by || userId }
  }
}

// Build WHERE clause for data isolation
export const buildDataIsolationClause = (hierarchy, tableAlias = '') => {
  const prefix = tableAlias ? `${tableAlias}.` : ''
  
  if (hierarchy.canAccessAll) {
    // Super users can see everything
    return ''
  } else {
    // Admin users can see their own data and data from users they created
    return `WHERE ${prefix}created_by = ${hierarchy.adminId} OR ${prefix}created_by IN (
      SELECT id FROM users WHERE created_by = ${hierarchy.adminId}
    )`
  }
}

// Get leads with proper isolation
export const getLeadsWithIsolation = async (userId, filters = {}) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) throw new Error('User not found')

  let whereClause = buildDataIsolationClause(hierarchy, 'l')
  
  // Add additional filters
  const conditions = []
  if (filters.status) conditions.push(`l.status = '${filters.status}'`)
  if (filters.priority) conditions.push(`l.priority = '${filters.priority}'`)
  if (filters.search) {
    conditions.push(`(l.source LIKE '%${filters.search}%' OR l.destination LIKE '%${filters.search}%' OR l.notes LIKE '%${filters.search}%')`)
  }
  
  if (conditions.length > 0) {
    const additionalWhere = conditions.join(' AND ')
    whereClause = whereClause ? `${whereClause} AND ${additionalWhere}` : `WHERE ${additionalWhere}`
  }

  const sql = `
    SELECT l.*, 
           c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
           u.name as created_by_name, u.role as created_by_role,
           assigner.name as assigned_to_name
    FROM leads l
    LEFT JOIN customers c ON l.customer_id = c.id
    LEFT JOIN users u ON l.created_by = u.id
    LEFT JOIN users assigner ON l.assigned_to = assigner.id
    ${whereClause}
    ORDER BY l.created_at DESC
    ${filters.limit ? `LIMIT ${filters.limit}` : ''}
    ${filters.offset ? `OFFSET ${filters.offset}` : ''}
  `
  
  return await query(sql)
}

// Get bookings with proper isolation
export const getBookingsWithIsolation = async (userId, filters = {}) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) throw new Error('User not found')

  let whereClause = buildDataIsolationClause(hierarchy, 'b')
  
  // Add additional filters
  const conditions = []
  if (filters.status) conditions.push(`b.status = '${filters.status}'`)
  if (filters.search) {
    conditions.push(`(b.destination LIKE '%${filters.search}%' OR b.notes LIKE '%${filters.search}%')`)
  }
  
  if (conditions.length > 0) {
    const additionalWhere = conditions.join(' AND ')
    whereClause = whereClause ? `${whereClause} AND ${additionalWhere}` : `WHERE ${additionalWhere}`
  }

  const sql = `
    SELECT b.*, 
           c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
           u.name as created_by_name, u.role as created_by_role,
           q.quote_reference
    FROM bookings b
    LEFT JOIN customers c ON b.customer_id = c.id
    LEFT JOIN users u ON b.created_by = u.id
    LEFT JOIN quotes q ON b.quote_id = q.id
    ${whereClause}
    ORDER BY b.created_at DESC
    ${filters.limit ? `LIMIT ${filters.limit}` : ''}
    ${filters.offset ? `OFFSET ${filters.offset}` : ''}
  `
  
  return await query(sql)
}

// Get customers with proper isolation
export const getCustomersWithIsolation = async (userId, filters = {}) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) throw new Error('User not found')

  let whereClause = buildDataIsolationClause(hierarchy, 'c')
  
  // Add additional filters
  const conditions = []
  if (filters.search) {
    conditions.push(`(c.name LIKE '%${filters.search}%' OR c.email LIKE '%${filters.search}%' OR c.phone LIKE '%${filters.search}%')`)
  }
  
  if (conditions.length > 0) {
    const additionalWhere = conditions.join(' AND ')
    whereClause = whereClause ? `${whereClause} AND ${additionalWhere}` : `WHERE ${additionalWhere}`
  }

  const sql = `
    SELECT c.*, 
           u.name as created_by_name, u.role as created_by_role
    FROM customers c
    LEFT JOIN users u ON c.created_by = u.id
    ${whereClause}
    ORDER BY c.created_at DESC
    ${filters.limit ? `LIMIT ${filters.limit}` : ''}
    ${filters.offset ? `OFFSET ${filters.offset}` : ''}
  `
  
  return await query(sql)
}

// Get quotes with proper isolation
export const getQuotesWithIsolation = async (userId, filters = {}) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) throw new Error('User not found')

  let whereClause = buildDataIsolationClause(hierarchy, 'q')
  
  // Add additional filters
  const conditions = []
  if (filters.status) conditions.push(`q.status = '${filters.status}'`)
  if (filters.search) {
    conditions.push(`(q.destination LIKE '%${filters.search}%' OR q.notes LIKE '%${filters.search}%')`)
  }
  
  if (conditions.length > 0) {
    const additionalWhere = conditions.join(' AND ')
    whereClause = whereClause ? `${whereClause} AND ${additionalWhere}` : `WHERE ${additionalWhere}`
  }

  const sql = `
    SELECT q.*, 
           c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
           u.name as created_by_name, u.role as created_by_role
    FROM quotes q
    LEFT JOIN customers c ON q.customer_id = c.id
    LEFT JOIN users u ON q.created_by = u.id
    ${whereClause}
    ORDER BY q.created_at DESC
    ${filters.limit ? `LIMIT ${filters.limit}` : ''}
    ${filters.offset ? `OFFSET ${filters.offset}` : ''}
  `
  
  return await query(sql)
}

// Get payments with proper isolation
export const getPaymentsWithIsolation = async (userId, filters = {}) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) throw new Error('User not found')

  let whereClause = buildDataIsolationClause(hierarchy, 'p')
  
  // Add additional filters
  const conditions = []
  if (filters.status) conditions.push(`p.status = '${filters.status}'`)
  if (filters.search) {
    conditions.push(`(p.transaction_id LIKE '%${filters.search}%' OR p.notes LIKE '%${filters.search}%')`)
  }
  
  if (conditions.length > 0) {
    const additionalWhere = conditions.join(' AND ')
    whereClause = whereClause ? `${whereClause} AND ${additionalWhere}` : `WHERE ${additionalWhere}`
  }

  const sql = `
    SELECT p.*, 
           c.name as customer_name, c.email as customer_email, c.phone as customer_phone,
           u.name as created_by_name, u.role as created_by_role,
           b.booking_reference
    FROM payments p
    LEFT JOIN customers c ON p.customer_id = c.id
    LEFT JOIN users u ON p.created_by = u.id
    LEFT JOIN bookings b ON p.booking_id = b.id
    ${whereClause}
    ORDER BY p.created_at DESC
    ${filters.limit ? `LIMIT ${filters.limit}` : ''}
    ${filters.offset ? `OFFSET ${filters.offset}` : ''}
  `
  
  return await query(sql)
}

// Check if user can access specific data
export const canAccessData = async (userId, dataType, dataId) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) return false

  if (hierarchy.canAccessAll) return true

  // Check if the data was created by the user or their sub-users
  const tableMap = {
    'lead': 'leads',
    'booking': 'bookings',
    'customer': 'customers',
    'quote': 'quotes',
    'payment': 'payments'
  }

  const table = tableMap[dataType]
  if (!table) return false

  const sql = `
    SELECT created_by FROM ${table} WHERE id = ?
  `
  
  const result = await queryOne(sql, [dataId])
  if (!result) return false

  // Check if the creator is the user or a sub-user
  if (result.created_by === hierarchy.adminId) return true

  // Check if creator is a sub-user
  const subUserCheck = await queryOne(
    'SELECT id FROM users WHERE id = ? AND created_by = ?',
    [result.created_by, hierarchy.adminId]
  )

  return !!subUserCheck
}

// Get dashboard stats with proper isolation
export const getDashboardStatsWithIsolation = async (userId) => {
  const hierarchy = await getAdminHierarchy(userId)
  if (!hierarchy) throw new Error('User not found')

  const whereClause = buildDataIsolationClause(hierarchy)

  const stats = await queryOne(`
    SELECT 
      (SELECT COUNT(*) FROM leads ${whereClause.replace('created_by', 'l.created_by').replace('WHERE', 'WHERE l.id IS NOT NULL AND')}) as total_leads,
      (SELECT COUNT(*) FROM bookings ${whereClause.replace('created_by', 'b.created_by').replace('WHERE', 'WHERE b.id IS NOT NULL AND')}) as total_bookings,
      (SELECT COUNT(*) FROM customers ${whereClause.replace('created_by', 'c.created_by').replace('WHERE', 'WHERE c.id IS NOT NULL AND')}) as total_customers,
      (SELECT COALESCE(SUM(total_amount), 0) FROM bookings ${whereClause.replace('created_by', 'b.created_by').replace('WHERE', 'WHERE b.id IS NOT NULL AND')}) as total_revenue
  `)

  return stats
}
