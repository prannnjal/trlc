import { NextResponse } from 'next/server'
import db from '@/lib/database.js'
import { authenticate } from '@/lib/middleware.js'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request) {
  try {
    return new Promise((resolve) => {
      authenticate(request, {
        json: (data) => resolve(NextResponse.json(data, { status: data.status || 200 })),
        status: (code) => ({
          json: (data) => resolve(NextResponse.json(data, { status: code }))
        })
      }, () => {
        // Get total counts
        const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count
        const totalLeads = db.prepare('SELECT COUNT(*) as count FROM leads').get().count
        const totalQuotes = db.prepare('SELECT COUNT(*) as count FROM quotes').get().count
        const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count
        
        // Get revenue statistics
        const revenueStats = db.prepare(`
          SELECT 
            COUNT(*) as total_bookings,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COALESCE(AVG(total_amount), 0) as avg_booking_value
          FROM bookings 
          WHERE status != 'cancelled'
        `).get()
        
        // Get payment statistics
        const paymentStats = db.prepare(`
          SELECT 
            COALESCE(SUM(amount), 0) as total_payments,
            COUNT(*) as total_payment_transactions
          FROM payments
        `).get()
        
        // Get leads by status
        const leadsByStatus = db.prepare(`
          SELECT status, COUNT(*) as count
          FROM leads
          GROUP BY status
          ORDER BY count DESC
        `).all()
        
        // Get bookings by status
        const bookingsByStatus = db.prepare(`
          SELECT status, COUNT(*) as count
          FROM bookings
          GROUP BY status
          ORDER BY count DESC
        `).all()
        
        // Get recent activities
        const recentActivities = db.prepare(`
          SELECT a.*, u.name as created_by_name
          FROM activities a
          LEFT JOIN users u ON a.created_by = u.id
          ORDER BY a.created_at DESC
          LIMIT 10
        `).all()
        
        // Get monthly revenue (last 12 months)
        const monthlyRevenue = db.prepare(`
          SELECT 
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as bookings_count,
            COALESCE(SUM(total_amount), 0) as revenue
          FROM bookings
          WHERE created_at >= date('now', '-12 months') AND status != 'cancelled'
          GROUP BY strftime('%Y-%m', created_at)
          ORDER BY month DESC
        `).all()
        
        // Get top customers by bookings
        const topCustomers = db.prepare(`
          SELECT 
            c.id, c.first_name, c.last_name, c.email,
            COUNT(b.id) as bookings_count,
            COALESCE(SUM(b.total_amount), 0) as total_spent
          FROM customers c
          LEFT JOIN bookings b ON c.id = b.customer_id AND b.status != 'cancelled'
          GROUP BY c.id, c.first_name, c.last_name, c.email
          HAVING bookings_count > 0
          ORDER BY total_spent DESC
          LIMIT 10
        `).all()
        
        // Get conversion rates
        const conversionStats = db.prepare(`
          SELECT 
            (SELECT COUNT(*) FROM leads WHERE status = 'closed_won') as won_leads,
            (SELECT COUNT(*) FROM leads WHERE status IN ('closed_won', 'closed_lost')) as total_closed_leads,
            (SELECT COUNT(*) FROM quotes WHERE status = 'accepted') as accepted_quotes,
            (SELECT COUNT(*) FROM quotes) as total_quotes
        `).get()
        
        const leadConversionRate = conversionStats.total_closed_leads > 0 
          ? (conversionStats.won_leads / conversionStats.total_closed_leads * 100).toFixed(2)
          : 0
        
        const quoteConversionRate = conversionStats.total_quotes > 0
          ? (conversionStats.accepted_quotes / conversionStats.total_quotes * 100).toFixed(2)
          : 0
        
        resolve(NextResponse.json({
          success: true,
          data: {
            overview: {
              totalCustomers,
              totalLeads,
              totalQuotes,
              totalBookings,
              totalRevenue: revenueStats.total_revenue,
              totalPayments: paymentStats.total_payments,
              avgBookingValue: revenueStats.avg_booking_value
            },
            conversion: {
              leadConversionRate: parseFloat(leadConversionRate),
              quoteConversionRate: parseFloat(quoteConversionRate)
            },
            leadsByStatus,
            bookingsByStatus,
            recentActivities,
            monthlyRevenue,
            topCustomers
          }
        }))
      })
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
