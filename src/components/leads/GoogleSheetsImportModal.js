'use client'

import { useState, useEffect } from 'react'
import { 
  XMarkIcon, 
  DocumentArrowDownIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

export default function GoogleSheetsImportModal({ isOpen, onClose, onImportSuccess }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: URL input, 2: Preview, 3: Results
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    spreadsheetUrl: '',
    range: 'Sheet1!A:Z',
    createCustomers: true,
    assignToUser: null
  })
  
  // Preview data
  const [previewData, setPreviewData] = useState(null)
  const [importResults, setImportResults] = useState(null)
  const [users, setUsers] = useState([])

  // Fetch users for assignment dropdown
  useEffect(() => {
    if (isOpen && user) {
      fetchUsers()
    }
  }, [isOpen, user])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('crm_token')
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUsers(data.data.users || [])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePreview = async () => {
    if (!formData.spreadsheetUrl.trim()) {
      setError('Please enter a Google Sheets URL')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('crm_token')
      const response = await fetch('/api/leads/import-google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          preview: true
        })
      })

      const data = await response.json()

      if (data.success) {
        setPreviewData(data.data)
        setStep(2)
      } else {
        setError(data.message || 'Failed to preview data')
      }
    } catch (error) {
      console.error('Preview error:', error)
      setError('Failed to preview data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('crm_token')
      const response = await fetch('/api/leads/import-google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setImportResults(data.data)
        setStep(3)
        if (onImportSuccess) {
          onImportSuccess(data.data)
        }
      } else {
        setError(data.message || 'Failed to import leads')
        if (data.errors) {
          setError(data.message + '\n\nErrors:\n' + data.errors.map(e => `Row ${e.row}: ${e.errors.join(', ')}`).join('\n'))
        }
      }
    } catch (error) {
      console.error('Import error:', error)
      setError('Failed to import leads. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setFormData({
      spreadsheetUrl: '',
      range: 'Sheet1!A:Z',
      createCustomers: true,
      assignToUser: null
    })
    setPreviewData(null)
    setImportResults(null)
    setError('')
    setSuccess('')
    onClose()
  }

  const handleGetTemplate = async () => {
    try {
      const token = localStorage.getItem('crm_token')
      const response = await fetch('/api/leads/import-google-sheets/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Create a downloadable CSV
          const csvContent = data.data.template.map(row => 
            row.map(cell => `"${cell}"`).join(',')
          ).join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'leads-import-template.csv'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Error downloading template:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Import Leads from Google Sheets
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNumber ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 ? 'Configure' : stepNumber === 2 ? 'Preview' : 'Results'}
                </span>
                {stepNumber < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Google Sheets Configuration
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Sheets URL *
                    </label>
                    <input
                      type="url"
                      name="spreadsheetUrl"
                      value={formData.spreadsheetUrl}
                      onChange={handleInputChange}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Paste the shareable link of your Google Sheet
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Range (Optional)
                    </label>
                    <input
                      type="text"
                      name="range"
                      value={formData.range}
                      onChange={handleInputChange}
                      placeholder="Sheet1!A:Z"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Specify the range to import (default: entire first sheet)
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="createCustomers"
                      checked={formData.createCustomers}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Create customer records for new leads
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign to User (Optional)
                    </label>
                    <select
                      name="assignToUser"
                      value={formData.assignToUser || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No assignment</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 mb-2">
                      Need a template?
                    </h5>
                    <p className="text-sm text-blue-700 mb-3">
                      Download our sample template to see the required format for your Google Sheet.
                    </p>
                    <button
                      onClick={handleGetTemplate}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && previewData && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Preview Data
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Found {previewData.leads.length} valid leads to import
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.leads.slice(0, 10).map((lead, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.destination}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.source}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lead.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.leads.length > 10 && (
                    <p className="mt-2 text-sm text-gray-500 text-center">
                      ... and {previewData.leads.length - 10} more leads
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                        {error}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && importResults && (
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Import Results
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {importResults.summary.imported}
                    </div>
                    <div className="text-sm text-green-700">Successfully Imported</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {importResults.summary.skipped}
                    </div>
                    <div className="text-sm text-yellow-700">Skipped</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {importResults.summary.errors}
                    </div>
                    <div className="text-sm text-red-700">Errors</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResults.summary.total}
                    </div>
                    <div className="text-sm text-blue-700">Total Processed</div>
                  </div>
                </div>

                {importResults.skipped.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <h5 className="text-sm font-medium text-yellow-800 mb-2">
                      Skipped Leads ({importResults.skipped.length})
                    </h5>
                    <div className="text-sm text-yellow-700">
                      {importResults.skipped.map((lead, index) => (
                        <div key={index} className="mb-1">
                          {lead.name} ({lead.email}) - {lead.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h5 className="text-sm font-medium text-red-800 mb-2">
                      Errors ({importResults.errors.length})
                    </h5>
                    <div className="text-sm text-red-700">
                      {importResults.errors.map((error, index) => (
                        <div key={index} className="mb-1">
                          {error.name} ({error.email}) - {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {step === 3 ? 'Close' : 'Cancel'}
            </button>
            
            {step === 1 && (
              <button
                onClick={handlePreview}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Previewing...' : 'Preview'}
              </button>
            )}
            
            {step === 2 && (
              <button
                onClick={handleImport}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import Leads'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
