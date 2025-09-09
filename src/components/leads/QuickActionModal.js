'use client'

import { useState } from 'react'
import { XMarkIcon, PhoneIcon, EnvelopeIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function QuickActionModal({ lead, action, onClose, onComplete }) {
  const [notes, setNotes] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (notes.trim()) {
      onComplete(lead.id, action, notes)
      setIsCompleted(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    }
  }

  const handlePhoneCall = () => {
    window.open(`tel:${lead.phone}`, '_self')
    onComplete(lead.id, 'call', 'Phone call initiated')
    setIsCompleted(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const handleEmail = () => {
    window.open(`mailto:${lead.email}?subject=Travel Inquiry - ${lead.destination}`, '_blank')
    onComplete(lead.id, 'email', 'Email opened')
    setIsCompleted(true)
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {action === 'call' ? 'Call Initiated' : 'Email Opened'}
            </h2>
            <p className="text-gray-600">
              {action === 'call' 
                ? 'The call has been initiated. Add notes about the conversation below.'
                : 'The email client has been opened. Add notes about the email below.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {action === 'call' ? (
              <PhoneIcon className="h-6 w-6 text-green-600 mr-3" />
            ) : (
              <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {action === 'call' ? 'Call Lead' : 'Email Lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900">{lead.name}</h3>
            <p className="text-sm text-gray-600">{lead.email}</p>
            <p className="text-sm text-gray-600">{lead.phone}</p>
          </div>

          {action === 'call' ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Click the button below to initiate a call to {lead.phone}
              </p>
              <button
                onClick={handlePhoneCall}
                className="w-full btn-success flex items-center justify-center"
              >
                <PhoneIcon className="h-5 w-5 mr-2" />
                Call {lead.phone}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Click the button below to open your email client
              </p>
              <button
                onClick={handleEmail}
                className="w-full btn-info flex items-center justify-center"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Email {lead.email}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder={`Add notes about the ${action}...`}
            />
            <div className="flex items-center justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!notes.trim()}
              >
                Save Notes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
