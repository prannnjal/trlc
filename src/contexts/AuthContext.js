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
    const checkAuth = async () => {
      const token = localStorage.getItem('crm_token')
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              setUser(data.data.user)
            } else {
              localStorage.removeItem('crm_token')
              localStorage.removeItem('crm_user')
            }
          } else {
            localStorage.removeItem('crm_token')
            localStorage.removeItem('crm_user')
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          localStorage.removeItem('crm_token')
          localStorage.removeItem('crm_user')
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const { user, token } = data.data
        setUser(user)
        localStorage.setItem('crm_token', token)
        localStorage.setItem('crm_user', JSON.stringify(user))
        return { success: true, user }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('crm_token')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
    }
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
