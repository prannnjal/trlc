'use client'

import { useState } from 'react'
import { 
  XMarkIcon, 
  CalendarIcon, 
  MapPinIcon, 
  HomeIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  UserIcon,
  DocumentArrowDownIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { generateItineraryPDF } from '@/lib/pdfGenerator'

export default function ViewItineraryModal({ itinerary, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedItinerary, setEditedItinerary] = useState(itinerary)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onUpdate(editedItinerary)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedItinerary(itinerary)
    setIsEditing(false)
  }

  const handleFieldChange = (field, value) => {
    setEditedItinerary(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDownloadPDF = async () => {
    try {
      await generateItineraryPDF(editedItinerary, {
        name: editedItinerary.lead_name,
        email: editedItinerary.lead_email,
        phone: editedItinerary.lead_phone
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Itinerary' : 'View Itinerary'}
            </h2>
            <p className="text-sm text-gray-600">
              {editedItinerary.trip_name || 'Untitled Trip'} - {editedItinerary.lead_name}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Trip Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trip Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItinerary.trip_name || ''}
                    onChange={(e) => handleFieldChange('trip_name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{editedItinerary.trip_name || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItinerary.destination || ''}
                    onChange={(e) => handleFieldChange('destination', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{editedItinerary.destination || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedItinerary.start_date || ''}
                    onChange={(e) => handleFieldChange('start_date', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{formatDate(editedItinerary.start_date)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedItinerary.end_date || ''}
                    onChange={(e) => handleFieldChange('end_date', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                ) : (
                  <p className="mt-1 text-sm text-gray-900">{formatDate(editedItinerary.end_date)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <p className="mt-1 text-sm text-gray-900">
                  {editedItinerary.duration} {editedItinerary.duration === 1 ? 'Day' : 'Days'} • {editedItinerary.nights} {editedItinerary.nights === 1 ? 'Night' : 'Nights'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Travelers</label>
                <p className="mt-1 text-sm text-gray-900">
                  {editedItinerary.travelers} {editedItinerary.travelers === 1 ? 'Traveler' : 'Travelers'} 
                  ({editedItinerary.adults} {editedItinerary.adults === 1 ? 'Adult' : 'Adults'}{editedItinerary.children > 0 && `, ${editedItinerary.children} ${editedItinerary.children === 1 ? 'Child' : 'Children'}`})
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{editedItinerary.lead_name || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{editedItinerary.lead_email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{editedItinerary.lead_phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Hotels */}
          {editedItinerary.hotels && editedItinerary.hotels.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <HomeIcon className="h-5 w-5 mr-2" />
                Accommodation ({editedItinerary.hotels.length})
              </h3>
              <div className="space-y-3">
                {editedItinerary.hotels.map((hotel, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                        <p className="text-sm text-gray-600">{hotel.location}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{hotel.checkIn} to {hotel.checkOut}</span>
                          <span>{hotel.roomType}</span>
                          <span>{hotel.guests} {hotel.guests === 1 ? 'Guest' : 'Guests'}</span>
                          <span className="font-medium text-green-600">{formatCurrency(hotel.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          {editedItinerary.activities && editedItinerary.activities.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Activities ({editedItinerary.activities.length})
              </h3>
              <div className="space-y-3">
                {editedItinerary.activities.map((activity, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{activity.date} at {activity.time}</span>
                          <span>{activity.duration}</span>
                          <span className="font-medium text-green-600">{formatCurrency(activity.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transportation */}
          {editedItinerary.transportation && editedItinerary.transportation.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TruckIcon className="h-5 w-5 mr-2" />
                Transportation ({editedItinerary.transportation.length})
              </h3>
              <div className="space-y-3">
                {editedItinerary.transportation.map((transport, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{transport.type}</h4>
                        <p className="text-sm text-gray-600">{transport.from} → {transport.to}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{transport.date} at {transport.time}</span>
                          <span className="font-medium text-green-600">{formatCurrency(transport.price)}</span>
                        </div>
                        {transport.details && (
                          <p className="text-xs text-gray-500 mt-1">{transport.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Pricing Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Accommodation</span>
                <span className="font-medium">{formatCurrency(editedItinerary.cost_breakdown?.accommodation || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Activities</span>
                <span className="font-medium">{formatCurrency(editedItinerary.cost_breakdown?.activities || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Transportation</span>
                <span className="font-medium">{formatCurrency(editedItinerary.cost_breakdown?.transportation || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Meals</span>
                <span className="font-medium">{formatCurrency(editedItinerary.cost_breakdown?.meals || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Other</span>
                <span className="font-medium">{formatCurrency(editedItinerary.cost_breakdown?.other || 0)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost</span>
                  <span className="text-primary-600">{formatCurrency(editedItinerary.total_cost)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(editedItinerary.special_requests || editedItinerary.notes) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              {editedItinerary.special_requests && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                  {isEditing ? (
                    <textarea
                      value={editedItinerary.special_requests || ''}
                      onChange={(e) => handleFieldChange('special_requests', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{editedItinerary.special_requests}</p>
                  )}
                </div>
              )}
              {editedItinerary.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  {isEditing ? (
                    <textarea
                      value={editedItinerary.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{editedItinerary.notes}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
