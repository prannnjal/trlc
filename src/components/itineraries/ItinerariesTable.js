'use client'

import { useState } from 'react'
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MapIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import DeleteConfirmModal from '../leads/DeleteConfirmModal'

const getStatusBadge = (status) => {
  const statusConfig = {
    draft: { label: 'Draft', className: 'status-new' },
    confirmed: { label: 'Confirmed', className: 'status-converted' },
    in_progress: { label: 'In Progress', className: 'status-in-progress' },
    completed: { label: 'Completed', className: 'status-on-trip' },
    cancelled: { label: 'Cancelled', className: 'status-cancelled' }
  }
  
  const config = statusConfig[status] || statusConfig.draft
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  )
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0)
}

export default function ItinerariesTable({ 
  itineraries, 
  onView, 
  onUpdate, 
  onDelete 
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleViewItinerary = (itinerary) => {
    onView(itinerary)
  }

  const handleDeleteItinerary = (itinerary) => {
    setSelectedItinerary(itinerary)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedItinerary) {
      onDelete(selectedItinerary.id)
      setShowDeleteModal(false)
      setSelectedItinerary(null)
    }
  }

  const handleCloseModal = () => {
    setSelectedItinerary(null)
    setShowDeleteModal(false)
  }

  const sortedItineraries = [...itineraries].sort((a, b) => {
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
              <SortableHeader sortKey="trip_name">Trip Details</SortableHeader>
              <SortableHeader sortKey="lead_name">Customer</SortableHeader>
              <SortableHeader sortKey="destination">Destination</SortableHeader>
              <SortableHeader sortKey="start_date">Travel Dates</SortableHeader>
              <SortableHeader sortKey="duration">Duration</SortableHeader>
              <SortableHeader sortKey="total_cost">Total Cost</SortableHeader>
              <SortableHeader sortKey="status">Status</SortableHeader>
              <SortableHeader sortKey="created_at">Created</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItineraries.map((itinerary) => (
              <tr key={itinerary.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {itinerary.trip_name || 'Untitled Trip'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {itinerary.travelers} {itinerary.travelers === 1 ? 'Traveler' : 'Travelers'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {itinerary.lead_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {itinerary.lead_email || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{itinerary.destination}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {itinerary.duration} {itinerary.duration === 1 ? 'Day' : 'Days'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {itinerary.nights} {itinerary.nights === 1 ? 'Night' : 'Nights'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(itinerary.total_cost)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(itinerary.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(itinerary.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleViewItinerary(itinerary)}
                      className="text-primary-600 hover:text-primary-900 p-1"
                      title="View Itinerary"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleViewItinerary(itinerary)}
                      className="text-warning-600 hover:text-warning-900 p-1"
                      title="Edit Itinerary"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItinerary(itinerary)}
                      className="text-danger-600 hover:text-danger-900 p-1"
                      title="Delete Itinerary"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {/* TODO: Implement PDF download */}}
                      className="text-info-600 hover:text-info-900 p-1"
                      title="Download PDF"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedItineraries.length === 0 && (
        <div className="text-center py-12">
          <MapIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <div className="text-gray-500">No itineraries found</div>
          <div className="text-sm text-gray-400 mt-1">
            Create your first itinerary from the leads page
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedItinerary && showDeleteModal && (
        <DeleteConfirmModal
          item={selectedItinerary}
          itemName="itinerary"
          onClose={handleCloseModal}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
