import { query } from '@/lib/mysql.js'

export async function GET(request) {
  try {
    // Test database connection
    const result = await query('SELECT 1 as test')
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Database connection test successful',
      data: { result }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Database connection failed',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
