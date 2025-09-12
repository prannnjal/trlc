'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ItinerariesTable from '@/components/itineraries/ItinerariesTable'
import ItineraryFilters from '@/components/itineraries/ItineraryFilters'
import ViewItineraryModal from '@/components/itineraries/ViewItineraryModal'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function ItinerariesPage() {
  const { user } = useAuth()
  const [itineraries, setItineraries] = useState([])
  const [filteredItineraries, setFilteredItineraries] = useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    lead: 'all',
    dateRange: 'all'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedItinerary, setSelectedItinerary] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  useEffect(() => {
    fetchItineraries()
  }, [])

  const fetchItineraries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/itineraries')
      const result = await response.json()
      
      if (result.success) {
        setItineraries(result.data)
        setFilteredItineraries(result.data)
      } else {
        console.error('Failed to fetch itineraries:', result.error)
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    applyFilters(newFilters, searchQuery)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    applyFilters(filters, query)
  }

  const applyFilters = (currentFilters, currentSearch) => {
    let filtered = itineraries

    // Apply status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(itinerary => itinerary.status === currentFilters.status)
    }

    // Apply lead filter
    if (currentFilters.lead !== 'all') {
      filtered = filtered.filter(itinerary => itinerary.lead_id === parseInt(currentFilters.lead))
    }

    // Apply search query
    if (currentSearch) {
      filtered = filtered.filter(itinerary =>
        itinerary.trip_name?.toLowerCase().includes(currentSearch.toLowerCase()) ||
        itinerary.destination?.toLowerCase().includes(currentSearch.toLowerCase()) ||
        itinerary.lead_name?.toLowerCase().includes(currentSearch.toLowerCase())
      )
    }

    setFilteredItineraries(filtered)
  }

  const handleViewItinerary = (itinerary) => {
    setSelectedItinerary(itinerary)
    setShowViewModal(true)
  }

  const handleCloseModal = () => {
    setSelectedItinerary(null)
    setShowViewModal(false)
  }

  const handleUpdateItinerary = (updatedItinerary) => {
    setItineraries(prev => 
      prev.map(itinerary => 
        itinerary.id === updatedItinerary.id ? updatedItinerary : itinerary
      )
    )
    setFilteredItineraries(prev => 
      prev.map(itinerary => 
        itinerary.id === updatedItinerary.id ? updatedItinerary : itinerary
      )
    )
  }

  const handleDeleteItinerary = async (itineraryId) => {
    try {
      const response = await fetch(`/api/itineraries/${itineraryId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        setItineraries(prev => prev.filter(itinerary => itinerary.id !== itineraryId))
        setFilteredItineraries(prev => prev.filter(itinerary => itinerary.id !== itineraryId))
      } else {
        console.error('Failed to delete itinerary:', result.error)
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error)
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Itineraries</h1>
            <p className="text-gray-600">Manage and view all created itineraries</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              {filteredItineraries.length} of {itineraries.length} itineraries
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <ItineraryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          itineraries={itineraries}
        />

        {/* Itineraries Table */}
        <ItinerariesTable
          itineraries={filteredItineraries}
          onView={handleViewItinerary}
          onUpdate={handleUpdateItinerary}
          onDelete={handleDeleteItinerary}
        />

        {/* View Itinerary Modal */}
        {selectedItinerary && showViewModal && (
          <ViewItineraryModal
            itinerary={selectedItinerary}
            onClose={handleCloseModal}
            onUpdate={handleUpdateItinerary}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
