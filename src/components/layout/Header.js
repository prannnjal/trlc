'use client'

import { useState } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const { toggleSidebar } = useSidebar()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    // Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
          
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads, bookings, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>

        {/* Right side - Notifications and user info */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <BellIcon className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
          </button>
          
          {/* Messages */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100">
            <EnvelopeIcon className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-warning-500 rounded-full"></span>
          </button>
          
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <button className="btn-primary text-sm px-3 py-1.5">
              + New Lead
            </button>
            <button className="btn-secondary text-sm px-3 py-1.5">
              + New Quote
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
