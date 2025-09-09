'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

const Notification = ({ 
  show, 
  onClose, 
  type = 'error', 
  title, 
  message, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg border shadow-lg p-4 ${getStyles()} transform transition-all duration-300 ease-in-out`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium mb-1">
                {title}
              </h3>
            )}
            <p className="text-sm">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for managing notifications
export const useNotification = () => {
  const [notification, setNotification] = useState({
    show: false,
    type: 'error',
    title: '',
    message: '',
    duration: 5000
  })

  const showNotification = (type, title, message, duration = 5000) => {
    setNotification({
      show: true,
      type,
      title,
      message,
      duration
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  const showError = (title, message, duration) => showNotification('error', title, message, duration)
  const showSuccess = (title, message, duration) => showNotification('success', title, message, duration)
  const showWarning = (title, message, duration) => showNotification('warning', title, message, duration)
  const showInfo = (title, message, duration) => showNotification('info', title, message, duration)

  return {
    notification,
    showNotification,
    hideNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo
  }
}

export default Notification
