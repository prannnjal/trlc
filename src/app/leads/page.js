'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LeadsTable from '@/components/leads/LeadsTable'
import LeadFilters from '@/components/leads/LeadFilters'
import CreateLeadModal from '@/components/leads/CreateLeadModal'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [filteredLeads, setFilteredLeads] = useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateRange: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching leads
    const mockLeads = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        destination: 'Bali, Indonesia',
        travelDate: '2024-03-15',
        status: 'new',
        value: 2500,
        source: 'Website',
        assignedTo: 'Sales Team',
        createdAt: '2024-01-15',
        lastContact: '2024-01-15'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '+1 (555) 987-6543',
        destination: 'Paris, France',
        travelDate: '2024-04-20',
        status: 'in-progress',
        value: 3200,
        source: 'Social Media',
        assignedTo: 'Sales Team',
        createdAt: '2024-01-14',
        lastContact: '2024-01-15'
      },
      {
        id: 3,
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1 (555) 456-7890',
        destination: 'Tokyo, Japan',
        travelDate: '2024-05-10',
        status: 'converted',
        value: 4100,
        source: 'Referral',
        assignedTo: 'Operations',
        createdAt: '2024-01-13',
        lastContact: '2024-01-14'
      },
      {
        id: 4,
        name: 'Emily Wilson',
        email: 'emily.w@email.com',
        phone: '+1 (555) 789-0123',
        destination: 'New York, USA',
        travelDate: '2024-03-25',
        status: 'new',
        value: 1800,
        source: 'Email',
        assignedTo: 'Sales Team',
        createdAt: '2024-01-12',
        lastContact: '2024-01-12'
      }
    ]
    
    setLeads(mockLeads)
    setFilteredLeads(mockLeads)
    setLoading(false)
  }, [])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    applyFilters(newFilters, searchQuery)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    applyFilters(filters, query)
  }

  const applyFilters = (currentFilters, currentSearch) => {
    let filtered = leads

    // Apply status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(lead => lead.status === currentFilters.status)
    }

    // Apply source filter
    if (currentFilters.source !== 'all') {
      filtered = filtered.filter(lead => lead.source === currentFilters.source)
    }

    // Apply search query
    if (currentSearch) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        lead.email.toLowerCase().includes(currentSearch.toLowerCase()) ||
        lead.destination.toLowerCase().includes(currentSearch.toLowerCase())
      )
    }

    setFilteredLeads(filtered)
  }

  const handleCreateLead = (newLead) => {
    const lead = {
      ...newLead,
      id: leads.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0]
    }
    
    setLeads([lead, ...leads])
    setFilteredLeads([lead, ...filteredLeads])
    setShowCreateModal(false)
  }

  const handleUpdateLead = (updatedLead) => {
    setLeads(leads.map(lead => lead.id === updatedLead.id ? updatedLead : lead))
    setFilteredLeads(filteredLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead))
  }

  const handleDeleteLead = (leadId) => {
    setLeads(leads.filter(lead => lead.id !== leadId))
    setFilteredLeads(filteredLeads.filter(lead => lead.id !== leadId))
  }

  const handleAddNote = (leadId, action, notes) => {
    // In a real app, this would save to the database
    console.log(`Added note for lead ${leadId}: ${action} - ${notes}`)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600">Manage and track your sales leads</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Lead
          </button>
        </div>

        {/* Filters and Search */}
        <LeadFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {/* Leads Table */}
        <LeadsTable 
          leads={filteredLeads} 
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onAddNote={handleAddNote}
        />

        {/* Create Lead Modal */}
        {showCreateModal && (
          <CreateLeadModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateLead}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
