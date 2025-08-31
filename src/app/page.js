'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            Travel CRM
          </h1>
          <p className="text-gray-600">
            Complete Travel Agency Management System
          </p>
        </div>
        
        <div className="card">
          <LoginForm />
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p className="font-semibold text-gray-700 mb-3">Demo Credentials:</p>
          
          {/* Super User */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <p className="font-bold text-red-800 text-sm">🚀 SUPER USER</p>
            <p className="text-red-700">
              <strong>Email:</strong> super@travelcrm.com
            </p>
            <p className="text-red-700">
              <strong>Password:</strong> super123
            </p>
            <p className="text-xs text-red-600 mt-1">
              Full system access + Super admin privileges
            </p>
          </div>
          
          {/* Admin User */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <p className="font-bold text-blue-800 text-sm">👑 ADMIN</p>
            <p className="text-blue-700">
              <strong>Email:</strong> admin@travelcrm.com
            </p>
            <p className="text-blue-700">
              <strong>Password:</strong> admin123
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Full system access
            </p>
          </div>
          
          {/* Sales User */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-bold text-green-800 text-sm">💼 SALES</p>
            <p className="text-green-700">
              <strong>Email:</strong> sales@travelcrm.com
            </p>
            <p className="text-green-700">
              <strong>Password:</strong> sales123
            </p>
            <p className="text-xs text-green-600 mt-1">
              Limited access (leads, quotes, bookings, reports)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
