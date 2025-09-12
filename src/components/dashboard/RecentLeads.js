'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

const mockLeads = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    destination: 'Bali, Indonesia',
    travelDate: '2024-03-15',
    status: 'new',
    value: 2500,
    source: 'Website',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 987-6543',
    destination: 'Paris, France',
    travelDate: '2024-04-20',
    status: 'in-progress',
    value: 3200,
    source: 'Social Media',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
  },
  {
    id: 3,
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 456-7890',
    destination: 'Tokyo, Japan',
    travelDate: '2024-05-10',
    status: 'converted',
    value: 4100,
    source: 'Referral',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
  },
  {
    id: 4,
    name: 'Emily Wilson',
    email: 'emily.w@email.com',
    phone: '+1 (555) 789-0123',
    destination: 'New York, USA',
    travelDate: '2024-03-25',
    status: 'new',
    value: 1800,
    source: 'Email',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
  }
]

const getStatusBadge = (status) => {
  const statusConfig = {
    new: { label: 'New', className: 'status-new' },
    'in-progress': { label: 'In Progress', className: 'status-in-progress' },
    converted: { label: 'Converted', className: 'status-converted' },
    'on-trip': { label: 'On Trip', className: 'status-on-trip' },
    cancelled: { label: 'Cancelled', className: 'status-cancelled' }
  }
  
  const config = statusConfig[status] || statusConfig.new
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  )
}

export default function RecentLeads() {
  const [leads, setLeads] = useState([])

  useEffect(() => {
    setLeads(mockLeads)
  }, [])

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div key={lead.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{lead.name}</h4>
              {getStatusBadge(lead.status)}
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>{lead.email}</p>
              <p>{lead.phone}</p>
              <p>Destination: {lead.destination}</p>
              <p>Travel Date: {lead.travelDate}</p>
              <p>Value: ₹{lead.value.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Source: {lead.source}</span>
              <span>{formatDistanceToNow(lead.createdAt, { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      ))}
      
      <button className="w-full text-center text-primary-600 hover:text-primary-700 font-medium py-2">
        View All Leads →
      </button>
    </div>
  )
}
