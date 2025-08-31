'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const checkAuth = () => {
      const savedUser = localStorage.getItem('crm_user')
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (credentials) => {
    // Simulate API call with super user support
    let mockUser
    
    if (credentials.email === 'super@travelcrm.com') {
      mockUser = {
        id: 0,
        name: 'Super Administrator',
        email: credentials.email,
        role: 'super',
        permissions: ['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs'],
        avatar: 'https://ui-avatars.com/api/?name=Super&background=dc2626&color=fff',
        isSuperUser: true,
        canManageUsers: true,
        canAccessSystem: true,
        canExportData: true,
        canViewAuditLogs: true
      }
    } else if (credentials.email === 'admin@travelcrm.com') {
      mockUser = {
        id: 1,
        name: 'Admin User',
        email: credentials.email,
        role: 'admin',
        permissions: ['all'],
        avatar: `https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff`,
        isSuperUser: false,
        canManageUsers: true,
        canAccessSystem: true,
        canExportData: true,
        canViewAuditLogs: false
      }
    } else {
      mockUser = {
        id: 2,
        name: 'Sales User',
        email: credentials.email,
        role: 'sales',
        permissions: ['leads', 'quotes', 'bookings', 'reports'],
        avatar: `https://ui-avatars.com/api/?name=Sales&background=3b82f6&color=fff`,
        isSuperUser: false,
        canManageUsers: false,
        canAccessSystem: false,
        canExportData: false,
        canViewAuditLogs: false
      }
    }
    
    setUser(mockUser)
    localStorage.setItem('crm_user', JSON.stringify(mockUser))
    return { success: true, user: mockUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('crm_user')
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.permissions.includes('all')) return true
    return user.permissions.includes(permission)
  }

  const isSuperUser = () => {
    return user?.isSuperUser || false
  }

  const canManageUsers = () => {
    return user?.canManageUsers || false
  }

  const canAccessSystem = () => {
    return user?.canAccessSystem || false
  }

  const canExportData = () => {
    return user?.canExportData || false
  }

  const canViewAuditLogs = () => {
    return user?.canViewAuditLogs || false
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isSuperUser,
    canManageUsers,
    canAccessSystem,
    canExportData,
    canViewAuditLogs,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
