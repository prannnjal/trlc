const mysql = require('mysql2/promise')

async function testItineraryCreation() {
  let connection
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'travel_crm'
    })
    
    console.log('🔗 Connected to database')
    
    // Check if itineraries table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'travel_crm' 
      AND TABLE_NAME = 'itineraries'
    `)
    
    if (tables.length === 0) {
      console.log('❌ Itineraries table not found')
      return
    }
    
    console.log('✅ Itineraries table exists')
    
    // Check if there are any leads to create itineraries for
    const [leads] = await connection.execute('SELECT id, name, email FROM leads LIMIT 1')
    
    if (leads.length === 0) {
      console.log('❌ No leads found. Please create a lead first.')
      return
    }
    
    const lead = leads[0]
    console.log(`✅ Found lead: ${lead.name} (${lead.email})`)
    
    // Create a test itinerary
    const testItinerary = {
      lead_id: lead.id,
      trip_name: 'Test Bali Adventure',
      destination: 'Bali, Indonesia',
      start_date: '2024-03-15',
      end_date: '2024-03-22',
      duration: 8,
      nights: 7,
      travelers: 2,
      adults: 2,
      children: 0,
      hotels: JSON.stringify([
        {
          id: 1,
          name: 'Grand Hyatt Bali',
          checkIn: '2024-03-15',
          checkOut: '2024-03-22',
          roomType: 'Deluxe Room',
          guests: 2,
          adults: 2,
          children: 0,
          price: 1200,
          location: 'Nusa Dua, Bali'
        }
      ]),
      activities: JSON.stringify([
        {
          id: 1,
          name: 'Temple Tour',
          date: '2024-03-16',
          time: '09:00',
          duration: '4 hours',
          price: 150,
          description: 'Visit famous temples in Ubud'
        }
      ]),
      transportation: JSON.stringify([
        {
          id: 1,
          type: 'Flight',
          from: 'New York',
          to: 'Denpasar',
          date: '2024-03-15',
          time: '14:30',
          price: 800,
          details: 'Flight AA123'
        }
      ]),
      total_cost: 2150,
      cost_breakdown: JSON.stringify({
        accommodation: 1200,
        activities: 150,
        transportation: 800,
        meals: 0,
        other: 0
      }),
      special_requests: 'Vegetarian meals preferred',
      notes: 'First time visiting Bali',
      status: 'draft'
    }
    
    // Insert test itinerary
    const [result] = await connection.execute(`
      INSERT INTO itineraries (
        lead_id, trip_name, destination, start_date, end_date, duration, nights,
        travelers, adults, children, hotels, activities, transportation,
        total_cost, cost_breakdown, special_requests, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      testItinerary.lead_id,
      testItinerary.trip_name,
      testItinerary.destination,
      testItinerary.start_date,
      testItinerary.end_date,
      testItinerary.duration,
      testItinerary.nights,
      testItinerary.travelers,
      testItinerary.adults,
      testItinerary.children,
      testItinerary.hotels,
      testItinerary.activities,
      testItinerary.transportation,
      testItinerary.total_cost,
      testItinerary.cost_breakdown,
      testItinerary.special_requests,
      testItinerary.notes,
      testItinerary.status
    ])
    
    console.log(`✅ Test itinerary created with ID: ${result.insertId}`)
    
    // Verify the itinerary was created
    const [itineraries] = await connection.execute(`
      SELECT 
        i.*,
        l.name as lead_name,
        l.email as lead_email
      FROM itineraries i
      LEFT JOIN leads l ON i.lead_id = l.id
      WHERE i.id = ?
    `, [result.insertId])
    
    if (itineraries.length > 0) {
      const itinerary = itineraries[0]
      console.log('✅ Itinerary verification:')
      console.log(`   - Trip: ${itinerary.trip_name}`)
      console.log(`   - Customer: ${itinerary.lead_name} (${itinerary.lead_email})`)
      console.log(`   - Destination: ${itinerary.destination}`)
      console.log(`   - Duration: ${itinerary.duration} days`)
      console.log(`   - Total Cost: ₹${itinerary.total_cost}`)
      console.log(`   - Status: ${itinerary.status}`)
    }
    
    console.log('🎉 Itinerary creation test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run the test
testItineraryCreation()
