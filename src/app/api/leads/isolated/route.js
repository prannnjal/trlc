import { getLeadsWithIsolation } from '@/lib/dataAccess.js'
import { verifyToken } from '@/lib/auth.js'

export async function GET(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authorization token required'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Verify token and get user
    const token = authHeader.substring(7)
    const payload = await verifyToken(token)
    if (!payload) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid or expired token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get('status') || '',
      priority: searchParams.get('priority') || '',
      search: searchParams.get('search') || '',
      limit: parseInt(searchParams.get('limit')) || 50,
      offset: parseInt(searchParams.get('offset')) || 0
    }

    // Get leads with proper isolation
    const leads = await getLeadsWithIsolation(payload.id, filters)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Leads retrieved successfully',
      data: {
        leads,
        total: leads.length,
        filters
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Get isolated leads error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
