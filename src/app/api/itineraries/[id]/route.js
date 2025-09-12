import { NextResponse } from 'next/server'
import { query, execute } from '@/lib/mysql'

// GET /api/itineraries/[id] - Get specific itinerary
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const rows = await query(`
      SELECT 
        i.*,
        CONCAT(c.first_name, ' ', c.last_name) as lead_name,
        c.email as lead_email,
        c.phone as lead_phone,
        l.destination as lead_destination
      FROM itineraries i
      LEFT JOIN leads l ON i.lead_id = l.id
      LEFT JOIN customers c ON l.customer_id = c.id
      WHERE i.id = ?
    `, [id])
    
    if (rows.length === 0) {
      return Response.json(
        { success: false, error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    // Parse JSON fields
    const itinerary = rows[0]
    itinerary.hotels = JSON.parse(itinerary.hotels || '[]')
    itinerary.activities = JSON.parse(itinerary.activities || '[]')
    itinerary.transportation = JSON.parse(itinerary.transportation || '[]')
    itinerary.cost_breakdown = JSON.parse(itinerary.cost_breakdown || '{}')
    
    return Response.json({ success: true, data: itinerary })
  } catch (error) {
    console.error('Error fetching itinerary:', error)
    return Response.json(
      { success: false, error: 'Failed to fetch itinerary' },
      { status: 500 }
    )
  }
}

// PUT /api/itineraries/[id] - Update itinerary
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const {
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
      status
    } = body

    const result = await execute(`
      UPDATE itineraries SET
        trip_name = ?, destination = ?, start_date = ?, end_date = ?,
        duration = ?, nights = ?, travelers = ?, adults = ?, children = ?,
        hotels = ?, activities = ?, transportation = ?, total_cost = ?,
        cost_breakdown = ?, special_requests = ?, notes = ?, status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
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
      status,
      id
    ])

    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    return Response.json({ 
      success: true, 
      data: { message: 'Itinerary updated successfully' }
    })
  } catch (error) {
    console.error('Error updating itinerary:', error)
    return Response.json(
      { success: false, error: 'Failed to update itinerary' },
      { status: 500 }
    )
  }
}

// DELETE /api/itineraries/[id] - Delete itinerary
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    const result = await execute(`
      DELETE FROM itineraries WHERE id = ?
    `, [id])
    
    if (result.affectedRows === 0) {
      return Response.json(
        { success: false, error: 'Itinerary not found' },
        { status: 404 }
      )
    }
    
    return Response.json({ 
      success: true, 
      data: { message: 'Itinerary deleted successfully' }
    })
  } catch (error) {
    console.error('Error deleting itinerary:', error)
    return Response.json(
      { success: false, error: 'Failed to delete itinerary' },
      { status: 500 }
    )
  }
}
