'use client'

import { useData } from '@/contexts/DataContext'
import { useAuth } from '@/contexts/AuthContext'

export default function RealDataExample() {
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

  if (!user) {
    return <div>Please log in to view data</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Real Database Data</h1>
      
      {/* Dashboard Stats */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Dashboard Statistics</h2>
        {dashboardLoading ? (
          <div>Loading dashboard stats...</div>
        ) : dashboardStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dashboardStats.overview?.totalCustomers || 0}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{dashboardStats.overview?.totalLeads || 0}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{dashboardStats.overview?.totalQuotes || 0}</div>
              <div className="text-sm text-gray-600">Total Quotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{dashboardStats.overview?.totalBookings || 0}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
          </div>
        ) : (
          <div>No dashboard data available</div>
        )}
      </div>

      {/* Customers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Customers ({customers.length})</h2>
        {customersLoading ? (
          <div>Loading customers...</div>
        ) : customers.length > 0 ? (
          <div className="space-y-2">
            {customers.slice(0, 5).map((customer) => (
              <div key={customer.id} className="flex justify-between items-center p-2 border rounded">
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
          <div>No customers found</div>
        )}
      </div>

      {/* Leads */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Leads ({leads.length})</h2>
        {leadsLoading ? (
          <div>Loading leads...</div>
        ) : leads.length > 0 ? (
          <div className="space-y-2">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{lead.source} → {lead.destination}</div>
                  <div className="text-sm text-gray-600">Status: {lead.status}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No leads found</div>
        )}
      </div>

      {/* Quotes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quotes ({quotes.length})</h2>
        {quotesLoading ? (
          <div>Loading quotes...</div>
        ) : quotes.length > 0 ? (
          <div className="space-y-2">
            {quotes.slice(0, 5).map((quote) => (
              <div key={quote.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{quote.title}</div>
                  <div className="text-sm text-gray-600">${quote.total_amount} - {quote.status}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(quote.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No quotes found</div>
        )}
      </div>

      {/* Bookings */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Bookings ({bookings.length})</h2>
        {bookingsLoading ? (
          <div>Loading bookings...</div>
        ) : bookings.length > 0 ? (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium">{booking.title}</div>
                  <div className="text-sm text-gray-600">${booking.total_amount} - {booking.status}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(booking.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No bookings found</div>
        )}
      </div>
    </div>
  )
}
