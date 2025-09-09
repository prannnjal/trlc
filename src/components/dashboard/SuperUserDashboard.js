'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  CircleStackIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export default function SuperUserDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemUptime: 0,
    lastBackup: '',
    databaseSize: 0,
    apiCalls: 0,
    errors: 0,
    warnings: 0
  })

  useEffect(() => {
    // Simulate fetching system statistics
    const mockSystemStats = {
      totalUsers: 47,
      activeUsers: 23,
      systemUptime: 99.97,
      lastBackup: '2024-01-15 02:00:00',
      databaseSize: '2.4 GB',
      apiCalls: 15420,
      errors: 3,
      warnings: 7
    }
    setSystemStats(mockSystemStats)
  }, [])

  const handleCreateAgent = () => {
    router.push('/system/users')
  }

  const systemHealthItems = [
    {
      title: 'System Uptime',
      value: `${systemStats.systemUptime}%`,
      status: systemStats.systemUptime > 99.5 ? 'healthy' : 'warning',
      icon: CheckCircleIcon,
      color: systemStats.systemUptime > 99.5 ? 'text-green-600' : 'text-yellow-600'
    },
    {
      title: 'Database Health',
      value: 'Healthy',
      status: 'healthy',
      icon: CircleStackIcon,
      color: 'text-green-600'
    },
    {
      title: 'API Performance',
      value: 'Optimal',
      status: 'healthy',
      icon: ChartBarIcon,
      color: 'text-green-600'
    },
    {
      title: 'Active Errors',
      value: systemStats.errors,
      status: systemStats.errors === 0 ? 'healthy' : 'error',
      icon: ExclamationTriangleIcon,
      color: systemStats.errors === 0 ? 'text-green-600' : 'text-red-600'
    }
  ]

  const quickActions = [
    {
      title: 'User Management',
      description: 'Create and manage all users and permissions',
      icon: UserGroupIcon,
      action: 'Manage Users',
      color: 'bg-blue-500',
      onClick: handleCreateAgent
    },
    {
      title: 'System Configuration',
      description: 'Configure system settings and integrations',
      icon: CogIcon,
      action: 'Configure System',
      color: 'bg-purple-500'
    },
    {
      title: 'Data Export',
      description: 'Export system data and reports',
      icon: CircleStackIcon,
      action: 'Export Data',
      color: 'bg-green-500'
    },
    {
      title: 'Audit Logs',
      description: 'View system activity and security logs',
      icon: ShieldCheckIcon,
      action: 'View Logs',
      color: 'bg-red-500'
    }
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      healthy: { className: 'bg-green-100 text-green-800', label: 'Healthy' },
      warning: { className: 'bg-yellow-100 text-yellow-800', label: 'Warning' },
      error: { className: 'bg-red-100 text-red-800', label: 'Error' }
    }
    
    const config = statusConfig[status] || statusConfig.healthy
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Super User Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {user?.role === 'super' ? '🚀 Super Administrator Dashboard' : '👑 Administrator Dashboard'}
              </h1>
              <p className="text-red-100">
                {user?.role === 'super' 
                  ? `Welcome, ${user?.name}! You have full system access and super admin privileges.`
                  : `Welcome, ${user?.name}! You have admin access to manage your organization.`
                }
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleCreateAgent}
                className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl w-full lg:w-auto justify-center"
              >
                <PlusIcon className="h-5 w-5" />
                <span>{user?.role === 'super' ? 'Create Agent' : 'Create Sales'}</span>
              </button>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="bg-red-500 bg-opacity-30 rounded-lg p-3 inline-block">
              <p className="text-sm font-medium">{user?.role === 'super' ? 'Super User' : 'Admin User'}</p>
              <p className="text-xs text-red-200">
                {user?.role === 'super' ? 'Enhanced Privileges' : 'Admin Privileges'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemHealthItems.map((item, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                {getStatusBadge(item.status)}
              </div>
              <div className={`p-3 rounded-full bg-gray-100 ${item.color}`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-600" />
            System Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold">{systemStats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Active Users</span>
              <span className="font-semibold">{systemStats.activeUsers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Database Size</span>
              <span className="font-semibold">{systemStats.databaseSize}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">API Calls (24h)</span>
              <span className="font-semibold">{systemStats.apiCalls.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Last Backup</span>
              <span className="font-semibold text-sm">{systemStats.lastBackup}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-600" />
            System Alerts
          </h3>
          <div className="space-y-4">
            {systemStats.errors > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {systemStats.errors} Active Error(s)
                  </p>
                  <p className="text-xs text-red-600">Requires immediate attention</p>
                </div>
              </div>
            )}
            
            {systemStats.warnings > 0 && (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {systemStats.warnings} Warning(s)
                  </p>
                  <p className="text-xs text-yellow-600">Monitor and address soon</p>
                </div>
              </div>
            )}

            {systemStats.errors === 0 && systemStats.warnings === 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">All Systems Operational</p>
                  <p className="text-xs text-green-600">No active alerts</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{action.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              <button 
                onClick={action.onClick}
                className="w-full btn-primary text-sm"
              >
                {action.action}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
