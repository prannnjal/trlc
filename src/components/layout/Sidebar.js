'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { useRouter, usePathname } from 'next/navigation'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ShieldCheckIcon,
  CircleStackIcon,
  DocumentTextIcon,
  ChartPieIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  PresentationChartLineIcon,
  TruckIcon,
  DocumentChartBarIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const getNavigationItems = (isSuperUser) => {
  const baseItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      permission: 'dashboard'
    },
    {
      name: 'Leads & Sales',
      href: '/leads',
      icon: UserGroupIcon,
      permission: 'leads',
      children: [
        { name: 'All Leads', href: '/leads' },
        { name: 'New Leads', href: '/leads?status=new' },
        { name: 'In Progress', href: '/leads?status=in-progress' },
        { name: 'Converted', href: '/leads?status=converted' },
        { name: 'Quotes', href: '/quotes' }
      ]
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: CalendarIcon,
      permission: 'bookings',
      children: [
        { name: 'All Bookings', href: '/bookings' },
        { name: 'Itineraries', href: '/itineraries' },
        { name: 'Hotel Bookings', href: '/bookings/hotels' },
        { name: 'Transport', href: '/bookings/transport' }
      ]
    },
    {
      name: 'Operations & Tours',
      href: '/operations',
      icon: BuildingOfficeIcon,
      permission: 'operations',
      children: [
        { name: 'Tour Management', href: '/operations/tours' },
        { name: 'Active Tours', href: '/operations/active-tours' },
        { name: 'Completed Tours', href: '/operations/completed-tours' },
        { name: 'Itinerary Builder', href: '/itineraries/builder' },
        { name: 'Supplier Management', href: '/suppliers' },
        { name: 'Inventory Management', href: '/operations/inventory' },
        { name: 'Vouchers', href: '/vouchers' },
        { name: 'Quality Control', href: '/operations/quality' }
      ]
    },
    {
      name: 'Accounting & Finance',
      href: '/accounting',
      icon: CurrencyDollarIcon,
      permission: 'accounting',
      children: [
        { name: 'Financial Overview', href: '/accounting/overview' },
        { name: 'Invoices', href: '/accounting/invoices' },
        { name: 'Payments', href: '/accounting/payments' },
        { name: 'Receivables', href: '/accounting/receivables' },
        { name: 'Payables', href: '/accounting/payables' },
        { name: 'Cash Flow', href: '/accounting/cashflow' },
        { name: 'Profit & Loss', href: '/accounting/pnl' },
        { name: 'Tax Reports', href: '/accounting/tax' }
      ]
    },
    {
      name: 'Reports & Analytics',
      href: '/reports',
      icon: ChartBarIcon,
      permission: 'reports',
      children: [
        { name: 'Sales Reports', href: '/reports/sales' },
        { name: 'Financial Reports', href: '/reports/financial' },
        { name: 'Performance Analytics', href: '/reports/analytics' },
        { name: 'Customer Analytics', href: '/reports/customers' },
        { name: 'Operations Reports', href: '/reports/operations' },
        { name: 'Booking Trends', href: '/reports/booking-trends' },
        { name: 'Revenue Analysis', href: '/reports/revenue' },
        { name: 'Team Performance', href: '/reports/team' }
      ]
    },
    {
      name: 'Data Analytics',
      href: '/analytics',
      icon: PresentationChartLineIcon,
      permission: 'reports',
      children: [
        { name: 'Sales Performance', href: '/analytics/sales' },
        { name: 'Customer Insights', href: '/analytics/customers' },
        { name: 'Operations Metrics', href: '/analytics/operations' },
        { name: 'Financial Analytics', href: '/analytics/financial' },
        { name: 'Trend Analysis', href: '/analytics/trends' },
        { name: 'Predictive Analytics', href: '/analytics/predictive' },
        { name: 'Dashboard Builder', href: '/analytics/dashboard' },
        { name: 'Custom Reports', href: '/analytics/custom' }
      ]
    }
  ]

  // Add super user specific navigation items
  if (isSuperUser) {
    baseItems.push(
      {
        name: 'System Management',
        href: '/system',
        icon: ShieldCheckIcon,
        permission: 'super_admin',
        children: [
          { name: 'User Management', href: '/system/users' },
          { name: 'System Configuration', href: '/system/config' },
          { name: 'API Management', href: '/system/api' },
          { name: 'Security Settings', href: '/system/security' }
        ]
      },
      {
        name: 'Data & Analytics',
        href: '/data',
        icon: CircleStackIcon,
        permission: 'super_admin',
        children: [
          { name: 'Data Export', href: '/data/export' },
          { name: 'Audit Logs', href: '/data/audit' },
          { name: 'System Metrics', href: '/data/metrics' },
          { name: 'Backup & Restore', href: '/data/backup' }
        ]
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: CogIcon,
        permission: 'super_admin',
        children: [
          { name: 'Organization', href: '/settings/organization' },
          { name: 'Users & Roles', href: '/settings/users' },
          { name: 'Integrations', href: '/settings/integrations' },
          { name: 'Advanced Settings', href: '/settings/advanced' }
        ]
      }
    )
  } else {
    // Regular admin/sales user settings
    baseItems.push({
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      permission: 'admin',
      children: [
        { name: 'Organization', href: '/settings/organization' },
        { name: 'Users & Roles', href: '/settings/users' },
        { name: 'Integrations', href: '/settings/integrations' }
      ]
    })
    
    // Add admin-specific navigation items
    if (!isSuperUser) {
      baseItems.push(
        {
          name: 'User Management',
          href: '/system/users',
          icon: UserGroupIcon,
          permission: 'admin',
          children: [
            { name: 'Create Sales Account', href: '/system/users/create-sales' },
            { name: 'Manage Team', href: '/system/users/team' },
            { name: 'User Permissions', href: '/system/users/permissions' },
            { name: 'Team Performance', href: '/system/users/performance' }
          ]
        },
        {
          name: 'Business Intelligence',
          href: '/business-intelligence',
          icon: DocumentChartBarIcon,
          permission: 'admin',
          children: [
            { name: 'Financial Overview', href: '/business-intelligence/financial' },
            { name: 'Operations Dashboard', href: '/business-intelligence/operations' },
            { name: 'Team Performance', href: '/business-intelligence/team' },
            { name: 'Revenue Analytics', href: '/business-intelligence/revenue' },
            { name: 'Customer Insights', href: '/business-intelligence/customers' },
            { name: 'Tour Analytics', href: '/business-intelligence/tours' },
            { name: 'Supplier Analytics', href: '/business-intelligence/suppliers' },
            { name: 'Market Analysis', href: '/business-intelligence/market' }
          ]
        },
        {
          name: 'Quick Actions',
          href: '/quick-actions',
          icon: PlusIcon,
          permission: 'admin',
          children: [
            { name: 'Create Sales Account', href: '/quick-actions/create-sales' },
            { name: 'Add New Lead', href: '/quick-actions/add-lead' },
            { name: 'Create Booking', href: '/quick-actions/create-booking' },
            { name: 'Generate Invoice', href: '/quick-actions/generate-invoice' },
            { name: 'Add Supplier', href: '/quick-actions/add-supplier' },
            { name: 'Create Tour', href: '/quick-actions/create-tour' },
            { name: 'Export Data', href: '/quick-actions/export-data' },
            { name: 'Send Report', href: '/quick-actions/send-report' }
          ]
        }
      )
    }
  }

  return baseItems
}

export default function Sidebar() {
  const { user, logout, isSuperUser } = useAuth()
  const { isOpen, toggleSidebar, activeItem, setActiveItem } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (href) => {
    setActiveItem(href)
    router.push(href)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const hasPermission = (permission) => {
    if (!user) return false
    if (user.permissions.includes('all')) return true
    return user.permissions.includes(permission)
  }

  const navigationItems = getNavigationItems(isSuperUser())
  const filteredNavigation = navigationItems.filter(item => hasPermission(item.permission))

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">Travel CRM</h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <div key={item.name}>
              <button
                onClick={() => handleNavigation(item.href)}
                className={`w-full text-left sidebar-item ${
                  pathname === item.href ? 'active' : ''
                }`}
              >
                {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                {item.name}
              </button>
              
              {/* Sub-items */}
              {item.children && pathname.startsWith(item.href) && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.name}
                      onClick={() => handleNavigation(child.href)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                        pathname === child.href ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <img
              src={user?.avatar || 'https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff'}
              alt="User avatar"
              className="h-8 w-8 rounded-full mr-3"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                {isSuperUser() && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    🚀 Super
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
