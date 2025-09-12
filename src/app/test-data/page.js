'use client'

import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'
import { generateItineraryPDF } from '@/lib/pdfGenerator'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'

export default function TestDataPage() {
  const { user } = useAuth()
  const { 
    dashboardStats, 
    dashboardLoading, 
    customers, 
    customersLoading,
    leads,
    leadsLoading,
    quotes,
    quotesLoading,
    bookings,
    bookingsLoading
  } = useData()

  // Sample itinerary data for testing PDF generation
  const sampleItinerary = {
    tripName: 'Bali Adventure Trip',
    destination: 'Bali, Indonesia',
    startDate: '2024-03-15',
    endDate: '2024-03-22',
    duration: 8,
    nights: 7,
    travelers: 2,
    adults: 2,
    children: 0,
    hotels: [
      {
        id: 1,
        name: 'Grand Hyatt Bali',
        checkIn: '2024-03-15',
        checkOut: '2024-03-18',
        roomType: 'Ocean View Suite',
        guests: 2,
        adults: 2,
        children: 0,
        price: 450,
        location: 'Nusa Dua, Bali'
      },
      {
        id: 2,
        name: 'Ubud Hanging Gardens',
        checkIn: '2024-03-18',
        checkOut: '2024-03-22',
        roomType: 'Villa with Private Pool',
        guests: 2,
        adults: 2,
        children: 0,
        price: 650,
        location: 'Ubud, Bali'
      }
    ],
    activities: [
      {
        id: 1,
        name: 'Tegallalang Rice Terraces Tour',
        date: '2024-03-16',
        time: '09:00',
        duration: '4 hours',
        price: 75,
        description: 'Visit the famous rice terraces and learn about traditional farming methods'
      },
      {
        id: 2,
        name: 'Mount Batur Sunrise Trek',
        date: '2024-03-17',
        time: '02:00',
        duration: '6 hours',
        price: 120,
        description: 'Early morning trek to witness the spectacular sunrise from Mount Batur volcano'
      },
      {
        id: 3,
        name: 'Balinese Cooking Class',
        date: '2024-03-19',
        time: '10:00',
        duration: '3 hours',
        price: 85,
        description: 'Learn to cook authentic Balinese dishes with local ingredients'
      }
    ],
    transportation: [
      {
        id: 1,
        type: 'Flight',
        from: 'New York (JFK)',
        to: 'Denpasar (DPS)',
        date: '2024-03-15',
        time: '14:30',
        price: 1200,
        details: 'Emirates EK 206 - Economy Class'
      },
      {
        id: 2,
        type: 'Private Transfer',
        from: 'Denpasar Airport',
        to: 'Grand Hyatt Bali',
        date: '2024-03-15',
        time: '18:00',
        price: 45,
        details: 'Air-conditioned vehicle with driver'
      },
      {
        id: 3,
        type: 'Flight',
        from: 'Denpasar (DPS)',
        to: 'New York (JFK)',
        date: '2024-03-22',
        time: '22:15',
        price: 1200,
        details: 'Emirates EK 207 - Economy Class'
      }
    ],
    totalCost: 4625,
    costBreakdown: {
      accommodation: 2200,
      activities: 280,
      transportation: 2445,
      meals: 0,
      other: 0
    },
    specialRequests: 'Vegetarian meals preferred. Need airport pickup confirmation.',
    notes: 'Customer celebrating anniversary. Arrange for special dinner reservation.'
  }

  const sampleLead = {
    id: 1,
    name: 'John and Sarah Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    destination: 'Bali, Indonesia'
  }

  const handleTestPDFGeneration = async () => {
    try {
      await generateItineraryPDF(sampleItinerary, sampleLead)
      alert('PDF generated successfully! Check your downloads folder.')
    } catch (error) {
      alert(`Error generating PDF: ${error.message}`)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p>You need to be logged in to view the real database data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Real Database Data Test</h1>
        
        {/* Dashboard Stats */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
          {dashboardLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading dashboard stats...</span>
            </div>
          ) : dashboardStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{dashboardStats.overview?.totalCustomers || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Customers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{dashboardStats.overview?.totalLeads || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Leads</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{dashboardStats.overview?.totalQuotes || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Quotes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{dashboardStats.overview?.totalBookings || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Bookings</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No dashboard data available</div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customers */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Customers ({customers.length})</h2>
            {customersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading customers...</span>
              </div>
            ) : customers.length > 0 ? (
              <div className="space-y-3">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{customer.first_name} {customer.last_name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No customers found</div>
            )}
          </div>

          {/* Leads */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Leads ({leads.length})</h2>
            {leadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading leads...</span>
              </div>
            ) : leads.length > 0 ? (
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{lead.source} → {lead.destination}</div>
                      <div className="text-sm text-gray-600">Status: <span className="capitalize">{lead.status}</span></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No leads found</div>
            )}
          </div>

          {/* Quotes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quotes ({quotes.length})</h2>
            {quotesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading quotes...</span>
              </div>
            ) : quotes.length > 0 ? (
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{quote.title}</div>
                      <div className="text-sm text-gray-600">₹{quote.total_amount} - <span className="capitalize">{quote.status}</span></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No quotes found</div>
            )}
          </div>

          {/* Bookings */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Bookings ({bookings.length})</h2>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading bookings...</span>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium">{booking.title}</div>
                      <div className="text-sm text-gray-600">₹{booking.total_amount} - <span className="capitalize">{booking.status}</span></div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No bookings found</div>
            )}
          </div>
        </div>

        {/* PDF Generation Test */}
        <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold mb-2 text-green-800">📄 PDF Itinerary Generation Test</h3>
          <p className="text-green-700 mb-4">
            Test the new PDF generation feature with sample itinerary data. This will generate a professional PDF with trip details, accommodation, activities, and transportation.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleTestPDFGeneration}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Generate Sample PDF
            </button>
            <div className="text-sm text-green-600">
              <p><strong>Sample Trip:</strong> Bali Adventure Trip (8 days, 7 nights)</p>
              <p><strong>Includes:</strong> 2 Hotels, 3 Activities, 3 Transportation options</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">✅ Real Database Integration Complete!</h3>
          <p className="text-gray-700">
            This page shows real data fetched from your MySQL database through the API. 
            All the data you see here is coming from the database, not mock data.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>What's working:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Authentication with JWT tokens</li>
              <li>Real-time data fetching from MySQL</li>
              <li>Dashboard statistics from database</li>
              <li>Customer, Lead, Quote, and Booking data</li>
              <li>Automatic data refresh and error handling</li>
              <li><strong>NEW:</strong> PDF Itinerary Generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
