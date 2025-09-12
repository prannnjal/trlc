import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'

// GET /api/itineraries - Get all itineraries or by lead_id
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('lead_id')
    
    let query_sql = `
      SELECT 
        i.*,
        CONCAT(c.first_name, ' ', c.last_name) as lead_name,
        c.email as lead_email,
        c.phone as lead_phone,
        l.destination as lead_destination
      FROM itineraries i
      LEFT JOIN leads l ON i.lead_id = l.id
      LEFT JOIN customers c ON l.customer_id = c.id
    `
    
    let params = []
    if (leadId) {
      query_sql += ' WHERE i.lead_id = ?'
      params.push(leadId)
    }
    
    query_sql += ' ORDER BY i.created_at DESC'
    
    const rows = await query(query_sql, params)
    
    return Response.json({ success: true, data: rows })
  } catch (error) {
    console.error('Error fetching itineraries:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch itineraries' },
      { status: 500 }
    )
  }
}

// POST /api/itineraries - Create new itinerary
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      lead_id,
      trip_name,
      destination,
      start_date,
      end_date,
      duration,
      nights,
      travelers,
      adults,
      children,
      hotels,
      activities,
      transportation,
      total_cost,
      cost_breakdown,
      special_requests,
      notes,
      status = 'draft'
    } = body

    // Insert itinerary
    const result = await execute(`
      INSERT INTO itineraries (
        lead_id, trip_name, destination, start_date, end_date, duration, nights,
        travelers, adults, children, hotels, activities, transportation,
        total_cost, cost_breakdown, special_requests, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      lead_id,
      trip_name,
      destination,
      start_date,
      end_date,
      duration,
      nights,
      travelers,
      adults,
      children,
      JSON.stringify(hotels || []),
      JSON.stringify(activities || []),
      JSON.stringify(transportation || []),
      total_cost || 0,
      JSON.stringify(cost_breakdown || {}),
      special_requests || '',
      notes || '',
      status
    ])

    const itineraryId = result.insertId

    // Update lead status if itinerary is created
    if (status === 'confirmed') {
      await execute(`
        UPDATE leads 
        SET status = 'converted', updated_at = NOW() 
        WHERE id = ?
      `, [lead_id])
    }
    
    return Response.json({ 
      success: true, 
      data: { id: itineraryId, message: 'Itinerary saved successfully' }
    })
  } catch (error) {
    console.error('Error creating itinerary:', error)
    return Response.json(
      { success: false, error: 'Failed to create itinerary' },
      { status: 500 }
    )
  }
}
