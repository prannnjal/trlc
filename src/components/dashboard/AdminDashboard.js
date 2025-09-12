'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import CreateSalesModal from '@/components/admin/CreateSalesModal'
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  PlusIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartPieIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  CogIcon,
  TruckIcon,
  HomeIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalRevenue: 0,
    activeBookings: 0,
    conversionRate: 0,
    teamMembers: 0,
    monthlyTarget: 0,
    // Accounting stats
    totalInvoices: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    profitMargin: 0,
    // Operations stats
    activeTours: 0,
    completedTours: 0,
    supplierCount: 0,
    inventoryValue: 0
  })

  useEffect(() => {
    // Simulate fetching admin dashboard stats
    const mockStats = {
      totalLeads: 89,
      totalRevenue: 75000,
      activeBookings: 15,
      conversionRate: 72.3,
      teamMembers: 5,
      monthlyTarget: 100000,
      // Accounting stats
      totalInvoices: 45,
      pendingPayments: 12500,
      monthlyRevenue: 85000,
      profitMargin: 28.5,
      // Operations stats
      activeTours: 12,
      completedTours: 38,
      supplierCount: 25,
      inventoryValue: 45000
    }
    setStats(mockStats)
  }, [])

  const handleCreateSales = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 5000)
  }

  const handleManageTeam = () => {
    router.push('/system/users')
  }

  const kpiData = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: '+8%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'primary'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+12%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'success'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      change: '+2',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'warning'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+3.2%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'success'
    }
  ]

  const accountingData = [
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      change: '+8',
      changeType: 'positive',
      icon: DocumentTextIcon,
      color: 'primary'
    },
    {
      title: 'Pending Payments',
      value: `₹${stats.pendingPayments.toLocaleString()}`,
      change: '-₹2,08,000',
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'warning'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'success'
    },
    {
      title: 'Profit Margin',
      value: `${stats.profitMargin}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: ChartPieIcon,
      color: 'success'
    }
  ]

  const operationsData = [
    {
      title: 'Active Tours',
      value: stats.activeTours,
      change: '+3',
      changeType: 'positive',
      icon: TruckIcon,
      color: 'primary'
    },
    {
      title: 'Completed Tours',
      value: stats.completedTours,
      change: '+12',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'success'
    },
    {
      title: 'Suppliers',
      value: stats.supplierCount,
      change: '+2',
      changeType: 'positive',
      icon: BuildingOfficeIcon,
      color: 'warning'
    },
    {
      title: 'Inventory Value',
      value: `₹${stats.inventoryValue.toLocaleString()}`,
      change: '+5%',
      changeType: 'positive',
      icon: HomeIcon,
      color: 'success'
    }
  ]

  const quickActions = [
    {
      title: 'Create Sales Account',
      description: 'Add new sales team members',
      icon: PlusIcon,
      action: 'Create Sales',
      color: 'bg-blue-500',
      onClick: handleCreateSales
    },
    {
      title: 'Manage Team',
      description: 'View and manage your sales team',
      icon: UserGroupIcon,
      action: 'Manage Team',
      color: 'bg-green-500',
      onClick: handleManageTeam
    },
    {
      title: 'Financial Reports',
      description: 'View accounting and financial reports',
      icon: DocumentChartBarIcon,
      action: 'View Reports',
      color: 'bg-purple-500'
    },
    {
      title: 'Operations',
      description: 'Manage tours and suppliers',
      icon: CogIcon,
      action: 'Operations',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                👑 Administrator Dashboard
              </h1>
              <p className="text-blue-100">
                Welcome, {user?.name}! Manage your sales team and track performance.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateSales}
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl justify-center"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create Sales Account</span>
              </button>
              <button
                onClick={handleManageTeam}
                className="bg-blue-500 text-white hover:bg-blue-400 px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl justify-center"
              >
                <UserGroupIcon className="h-5 w-5" />
                <span>Manage Team</span>
              </button>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="bg-blue-500 bg-opacity-30 rounded-lg p-3 inline-block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-blue-200">Team Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <span className={`text-sm font-medium ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
              </div>
              <div className={`p-3 rounded-full bg-gray-100 ${
                kpi.color === 'primary' ? 'text-blue-600' :
                kpi.color === 'success' ? 'text-green-600' :
                kpi.color === 'warning' ? 'text-yellow-600' : 'text-purple-600'
              }`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accounting Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BanknotesIcon className="h-5 w-5 mr-2 text-green-600" />
          Accounting & Financial Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accountingData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  <span className={`text-sm font-medium ${
                    item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </span>
                </div>
                <div className={`p-2 rounded-full bg-gray-100 ${
                  item.color === 'primary' ? 'text-blue-600' :
                  item.color === 'success' ? 'text-green-600' :
                  item.color === 'warning' ? 'text-yellow-600' : 'text-purple-600'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operations Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CogIcon className="h-5 w-5 mr-2 text-blue-600" />
          Operations & Tour Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationsData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  <span className={`text-sm font-medium ${
                    item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change}
                  </span>
                </div>
                <div className={`p-2 rounded-full bg-gray-100 ${
                  item.color === 'primary' ? 'text-blue-600' :
                  item.color === 'success' ? 'text-green-600' :
                  item.color === 'warning' ? 'text-yellow-600' : 'text-purple-600'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
            Financial Reports
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Monthly P&L Report</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BanknotesIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">Cash Flow Statement</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ChartPieIcon className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Revenue Analysis</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-sm font-medium">Tax Reports</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PresentationChartLineIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Data Analytics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium">Sales Performance</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Analyze</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-sm font-medium">Customer Analytics</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Analyze</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <TruckIcon className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium">Operations Metrics</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Analyze</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-sm font-medium">Booking Trends</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Analyze</button>
            </div>
          </div>
        </div>
      </div>

      {/* Business Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
            Team Performance
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Team Members</span>
              <span className="font-semibold">{stats.teamMembers}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Monthly Target</span>
              <span className="font-semibold">₹{stats.monthlyTarget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Target Progress</span>
              <span className="font-semibold">{Math.round((stats.totalRevenue / stats.monthlyTarget) * 100)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Avg. Conversion</span>
              <span className="font-semibold">{stats.conversionRate}%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
            Financial Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Revenue: On Track</p>
                <p className="text-xs text-green-600">+15% vs last month</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <BanknotesIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Cash Flow: Healthy</p>
                <p className="text-xs text-blue-600">Positive cash position</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <DocumentTextIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending Invoices</p>
                <p className="text-xs text-yellow-600">₹{stats.pendingPayments.toLocaleString()} outstanding</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TruckIcon className="h-5 w-5 mr-2 text-purple-600" />
            Operations Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <TruckIcon className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-800">Active Tours: {stats.activeTours}</p>
                <p className="text-xs text-purple-600">Running smoothly</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Completed: {stats.completedTours}</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Suppliers: {stats.supplierCount}</p>
                <p className="text-xs text-blue-600">Active partnerships</p>
              </div>
            </div>
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

      {/* Create Sales Modal */}
      <CreateSalesModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
