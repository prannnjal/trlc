const { NextResponse } = require('next/server')
const db = require('@/lib/database.js')
const { verifyToken } = require('@/lib/auth.js')

// GET /api/dashboard/stats - Get dashboard statistics
async function GET(request) {
  try {
    // Get user from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Access denied. No token provided.'
      }, { status: 401 })
    }
    
    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token.'
      }, { status: 401 })
    }
    
    // Get basic counts
    const [
      totalCustomers,
      totalLeads,
      totalQuotes,
      totalBookings,
      totalPayments
    ] = await Promise.all([
      db.queryOne('SELECT COUNT(*) as count FROM customers'),
      db.queryOne('SELECT COUNT(*) as count FROM leads'),
      db.queryOne('SELECT COUNT(*) as count FROM quotes'),
      db.queryOne('SELECT COUNT(*) as count FROM bookings'),
      db.queryOne('SELECT COUNT(*) as count FROM payments')
    ])
    
    // Get leads by status
    const leadsByStatus = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM leads 
      GROUP BY status
    `)
    
    // Get leads by priority
    const leadsByPriority = await db.query(`
      SELECT priority, COUNT(*) as count 
      FROM leads 
      GROUP BY priority
    `)
    
    // Get quotes by status
    const quotesByStatus = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM quotes 
      GROUP BY status
    `)
    
    // Get bookings by status
    const bookingsByStatus = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `)
    
    // Get payments by status
    const paymentsByStatus = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM payments 
      GROUP BY status
    `)
    
    // Get revenue data (last 12 months)
    const revenueData = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        SUM(amount) as revenue
      FROM payments 
      WHERE status = 'completed' 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `)
    
    // Get recent activities
    const recentActivities = await db.query(`
      SELECT 
        a.type,
        a.subject,
        a.description,
        a.created_at,
        c.first_name,
        c.last_name,
        l.source,
        l.destination
      FROM activities a
      LEFT JOIN customers c ON a.related_id = c.id AND a.related_type = 'customer'
      LEFT JOIN leads l ON a.related_id = l.id AND a.related_type = 'lead'
      ORDER BY a.created_at DESC
      LIMIT 10
    `)
    
    // Get top performing sources
    const topSources = await db.query(`
      SELECT source, COUNT(*) as count
      FROM leads
      GROUP BY source
      ORDER BY count DESC
      LIMIT 5
    `)
    
    // Get conversion rates
    const conversionRates = await db.query(`
      SELECT 
        'Lead to Quote' as stage,
        (SELECT COUNT(*) FROM quotes) / (SELECT COUNT(*) FROM leads) * 100 as rate
      UNION ALL
      SELECT 
        'Quote to Booking' as stage,
        (SELECT COUNT(*) FROM bookings) / (SELECT COUNT(*) FROM quotes) * 100 as rate
      UNION ALL
      SELECT 
        'Booking to Payment' as stage,
        (SELECT COUNT(*) FROM payments WHERE status = 'completed') / (SELECT COUNT(*) FROM bookings) * 100 as rate
    `)
    
    const stats = {
      overview: {
        totalCustomers: totalCustomers.count,
        totalLeads: totalLeads.count,
        totalQuotes: totalQuotes.count,
        totalBookings: totalBookings.count,
        totalPayments: totalPayments.count
      },
      leads: {
        byStatus: leadsByStatus,
        byPriority: leadsByPriority
      },
      quotes: {
        byStatus: quotesByStatus
      },
      bookings: {
        byStatus: bookingsByStatus
      },
      payments: {
        byStatus: paymentsByStatus
      },
      revenue: {
        monthly: revenueData
      },
      activities: {
        recent: recentActivities
      },
      performance: {
        topSources: topSources,
        conversionRates: conversionRates
      }
    }
    
    return NextResponse.json({
      success: true,
      data: { stats }
    })
    
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

module.exports = { GET }