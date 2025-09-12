'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import KPICard from './KPICard'
import RecentLeads from './RecentLeads'
import RevenueChart from './RevenueChart'
import LeadStatusChart from './LeadStatusChart'
import SuperUserDashboard from './SuperUserDashboard'
import AdminDashboard from './AdminDashboard'
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  CalendarIcon, 
  CheckCircleIcon 
} from '@heroicons/react/24/outline'

export default function DashboardOverview() {
  const { user, isSuperUser } = useAuth()
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalRevenue: 0,
    activeBookings: 0,
    conversionRate: 0
  })

  useEffect(() => {
    // Simulate fetching dashboard stats
    const mockStats = {
      totalLeads: 156,
      totalRevenue: 125000,
      activeBookings: 23,
      conversionRate: 68.5
    }
    setStats(mockStats)
  }, [])

  // If user is a super user, show the super user dashboard
  if (isSuperUser()) {
    return <SuperUserDashboard />
  }

  // If user is an admin, show the admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  const kpiData = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      change: '+12%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'primary'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+8.5%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'success'
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      change: '+3',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'warning'
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'success'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your travel business today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Overview
          </h3>
          <RevenueChart />
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lead Status Distribution
          </h3>
          <LeadStatusChart />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Leads
          </h3>
          <RecentLeads />
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-secondary text-left">
              + Generate Quote
            </button>
            <button className="w-full btn-success text-left">
              + Build Itinerary
            </button>
            <button className="w-full btn-warning text-left">
              + Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
