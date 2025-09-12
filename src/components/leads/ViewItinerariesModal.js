'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, DocumentTextIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function ViewItinerariesModal({ lead, onClose }) {
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [showItineraryDetail, setShowItineraryDetail] = useState(false)

  useEffect(() => {
    if (lead?.id) {
      fetchItineraries()
    }
  }, [lead?.id])

  const fetchItineraries = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/itineraries?lead_id=${lead.id}`)
      const result = await response.json()
      if (result.success) {
        setItineraries(result.data)
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewItinerary = (itinerary) => {
    setSelectedItinerary(itinerary)
    setShowItineraryDetail(true)
  }

  const handleEditItinerary = (itinerary) => {
    // TODO: Implement edit functionality
    console.log('Edit itinerary:', itinerary)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
      in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', className: 'bg-purple-100 text-purple-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    )
  }

  if (showItineraryDetail && selectedItinerary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedItinerary.trip_name || 'Untitled Trip'}
              </h2>
              <button
                onClick={() => setShowItineraryDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Trip Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Destination:</span>
                    <span className="ml-2">{selectedItinerary.destination}</span>
                  </div>
                  <div>
                    <span className="font-medium">Start Date:</span>
                    <span className="ml-2">{formatDate(selectedItinerary.start_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium">End Date:</span>
                    <span className="ml-2">{formatDate(selectedItinerary.end_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2">{selectedItinerary.duration} days</span>
                  </div>
                  <div>
                    <span className="font-medium">Travelers:</span>
                    <span className="ml-2">{selectedItinerary.travelers} ({selectedItinerary.adults} adults, {selectedItinerary.children} children)</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className="ml-2">{getStatusBadge(selectedItinerary.status)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Accommodation:</span>
                    <span>{formatCurrency(selectedItinerary.cost_breakdown?.accommodation || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation:</span>
                    <span>{formatCurrency(selectedItinerary.cost_breakdown?.transportation || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activities:</span>
                    <span>{formatCurrency(selectedItinerary.cost_breakdown?.activities || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meals:</span>
                    <span>{formatCurrency(selectedItinerary.cost_breakdown?.meals || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span>{formatCurrency(selectedItinerary.cost_breakdown?.other || 0)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(selectedItinerary.total_cost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedItinerary.special_requests && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
                <p className="text-gray-700">{selectedItinerary.special_requests}</p>
              </div>
            )}

            {selectedItinerary.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700">{selectedItinerary.notes}</p>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowItineraryDetail(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => handleEditItinerary(selectedItinerary)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Itinerary
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Itineraries for {lead?.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading itineraries...</p>
            </div>
          ) : itineraries.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No itineraries found for this lead.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <div key={itinerary.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {itinerary.trip_name || 'Untitled Trip'}
                        </h3>
                        {getStatusBadge(itinerary.status)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Destination:</span>
                          <p>{itinerary.destination}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p>{itinerary.duration} days</p>
                        </div>
                        <div>
                          <span className="font-medium">Travelers:</span>
                          <p>{itinerary.travelers}</p>
                        </div>
                        <div>
                          <span className="font-medium">Total Cost:</span>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(itinerary.total_cost)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewItinerary(itinerary)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditItinerary(itinerary)}
                        className="p-2 text-yellow-600 hover:bg-yellow-100 rounded"
                        title="Edit Itinerary"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
