'use client'

import { useState } from 'react'
import { XMarkIcon, PhoneIcon, MapIcon, CalendarIcon, MapPinIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

export default function ViewLeadModal({ lead, onClose, onEdit, onCall, onItinerary, onStatusChange }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    status: lead.status,
    assignedTo: lead.assignedTo,
    notes: lead.notes || ''
  })

  const handleStatusChange = (newStatus) => {
    onStatusChange(lead.id, newStatus)
    setEditData(prev => ({ ...prev, status: newStatus }))
  }

  const handleAssignChange = (newAssignee) => {
    onStatusChange(lead.id, null, newAssignee)
    setEditData(prev => ({ ...prev, assignedTo: newAssignee }))
  }

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

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'converted', label: 'Converted' },
    { value: 'on-trip', label: 'On Trip' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const assignedOptions = [
    'Sales Team',
    'Operations',
    'Marketing',
    'Admin'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
            {getStatusBadge(lead.status)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onCall(lead)}
              className="btn-success text-sm px-3 py-1.5 flex items-center"
            >
              <PhoneIcon className="h-4 w-4 mr-1" />
              Call
            </button>
            <button
              onClick={() => onItinerary(lead)}
              className="btn-info text-sm px-3 py-1.5 flex items-center"
            >
              <MapIcon className="h-4 w-4 mr-1" />
              Build Itinerary
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-warning text-sm px-3 py-1.5"
            >
              {isEditing ? 'Cancel Edit' : 'Quick Edit'}
            </button>
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg text-gray-900">{lead.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{lead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{lead.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
                Travel Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Destination</label>
                  <p className="text-lg text-gray-900">{lead.destination}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Travel Date</label>
                  <p className="text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {lead.travelDate}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Value</label>
                  <p className="text-lg font-semibold text-gray-900 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1 text-green-600" />
                    ₹{lead.value.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Management */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Source</label>
                <p className="text-gray-900">{lead.source}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned To</label>
                <p className="text-gray-900">{lead.assignedTo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-gray-900">{lead.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Quick Edit Section */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Edit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="input-field"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={editData.assignedTo}
                    onChange={(e) => handleAssignChange(e.target.value)}
                    className="input-field"
                  >
                    {assignedOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="Add notes about this lead..."
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(lead)}
            className="btn-primary"
          >
            Edit Lead
          </button>
        </div>
      </div>
    </div>
  )
}
