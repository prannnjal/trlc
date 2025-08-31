'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSidebar } from '@/contexts/SidebarContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout({ children }) {
  const { user } = useAuth()
  const { isOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={`transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`}>
        <Header />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
