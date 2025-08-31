'use client'

import { useState } from 'react'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

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

export default function LeadsTable({ leads }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedLeads = [...leads].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const SortableHeader = ({ children, sortKey }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        {sortConfig.key === sortKey && (
          <span className="ml-1">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  )

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader sortKey="name">Lead</SortableHeader>
              <SortableHeader sortKey="destination">Destination</SortableHeader>
              <SortableHeader sortKey="travelDate">Travel Date</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <SortableHeader sortKey="value">Value</SortableHeader>
              <SortableHeader sortKey="source">Source</SortableHeader>
              <SortableHeader sortKey="assignedTo">Assigned To</SortableHeader>
              <SortableHeader sortKey="createdAt">Created</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.destination}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.travelDate}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(lead.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${lead.value.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.source}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.assignedTo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{lead.createdAt}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-primary-600 hover:text-primary-900 p-1">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-warning-600 hover:text-warning-900 p-1">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-danger-600 hover:text-danger-900 p-1">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <button className="text-success-600 hover:text-success-900 p-1">
                      <PhoneIcon className="h-4 w-4" />
                    </button>
                    <button className="text-info-600 hover:text-info-900 p-1">
                      <EnvelopeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No leads found</div>
        </div>
      )}
    </div>
  )
}
