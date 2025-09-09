'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon, CalendarIcon, MapPinIcon, HomeIcon, TruckIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { useNotification } from '../ui/Notification'
import Notification from '../ui/Notification'

export default function ItineraryBuilderModal({ lead, onClose, onSave }) {
  const { notification, showError, hideNotification } = useNotification()
  
  const [itinerary, setItinerary] = useState({
    // Trip Overview
    tripName: '',
    destination: lead?.destination || '',
    startDate: '',
    endDate: '',
    duration: 0,
    nights: 0,
    travelers: 1,
    adults: 1,
    children: 0,
    
    // Accommodation
    hotels: [],
    
    // Activities
    activities: [],
    
    // Transportation
    transportation: [],
    
    // Pricing
    totalCost: 0,
    costBreakdown: {
      accommodation: 0,
      activities: 0,
      transportation: 0,
      meals: 0,
      other: 0
    },
    
    // Additional Details
    specialRequests: '',
    notes: ''
  })

  const [currentStep, setCurrentStep] = useState(1)
  const [newHotel, setNewHotel] = useState({
    name: '',
    checkIn: '',
    checkOut: '',
    roomType: 'Standard',
    guests: 1,
    adults: 1,
    children: 0,
    price: 0,
    location: ''
  })

  const [newActivity, setNewActivity] = useState({
    name: '',
    date: '',
    time: '',
    duration: '',
    price: 0,
    description: ''
  })

  const [newTransport, setNewTransport] = useState({
    type: 'Flight',
    from: '',
    to: '',
    date: '',
    time: '',
    price: 0,
    details: ''
  })

  const roomTypes = [
    'Standard Room',
    'Deluxe Room',
    'Suite',
    'Presidential Suite',
    'Villa',
    'Apartment'
  ]

  const transportTypes = [
    'Flight',
    'Train',
    'Bus',
    'Car Rental',
    'Taxi',
    'Private Transfer',
    'Cruise',
    'Other'
  ]

  const activityCategories = [
    'Sightseeing',
    'Adventure',
    'Cultural',
    'Relaxation',
    'Food & Dining',
    'Entertainment',
    'Shopping',
    'Other'
  ]

  useEffect(() => {
    if (lead?.travelDate) {
      setItinerary(prev => ({
        ...prev,
        startDate: lead.travelDate,
        endDate: lead.travelDate
      }))
    }
  }, [lead])

  // Update total travelers when adults or children change
  useEffect(() => {
    setItinerary(prev => ({
      ...prev,
      travelers: prev.adults + prev.children
    }))
  }, [itinerary.adults, itinerary.children])

  // Update hotel guest details when trip overview changes
  useEffect(() => {
    setNewHotel(prev => ({
      ...prev,
      guests: itinerary.travelers,
      adults: itinerary.adults,
      children: itinerary.children
    }))
  }, [itinerary.travelers, itinerary.adults, itinerary.children])


  const calculateDuration = (start, end) => {
    if (!start || !end) return { days: 0, nights: 0 }
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate - startDate)
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    const nights = Math.max(0, days - 1)
    return { days, nights }
  }

  const handleTripDatesChange = (field, value) => {
    setItinerary(prev => {
      const updated = { ...prev, [field]: value }
      if (field === 'startDate' || field === 'endDate') {
        const { days, nights } = calculateDuration(updated.startDate, updated.endDate)
        updated.duration = days
        updated.nights = nights
      }
      return updated
    })
  }

  const addHotel = () => {
    if (newHotel.name && newHotel.checkIn && newHotel.checkOut) {
      // Check for date overlaps with existing hotels
      const hasOverlap = itinerary.hotels.some(hotel => {
        const existingCheckIn = new Date(hotel.checkIn)
        const existingCheckOut = new Date(hotel.checkOut)
        const newCheckIn = new Date(newHotel.checkIn)
        const newCheckOut = new Date(newHotel.checkOut)
        
        return (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn)
      })
      
      if (hasOverlap) {
        showError(
          'Date Conflict',
          'This hotel overlaps with an existing hotel booking. Please choose different dates from the available slots.',
          6000
        )
        return
      }
      
      setItinerary(prev => ({
        ...prev,
        hotels: [...prev.hotels, { ...newHotel, id: Date.now() }]
      }))
      setNewHotel({
        name: '',
        checkIn: '',
        checkOut: '',
        roomType: 'Standard',
        guests: itinerary.travelers,
        adults: itinerary.adults,
        children: itinerary.children,
        price: 0,
        location: ''
      })
    }
  }

  const removeHotel = (id) => {
    setItinerary(prev => ({
      ...prev,
      hotels: prev.hotels.filter(hotel => hotel.id !== id)
    }))
  }

  const getAvailableDateRanges = () => {
    if (!itinerary.startDate || !itinerary.endDate) return []
    
    const startDate = new Date(itinerary.startDate)
    const endDate = new Date(itinerary.endDate)
    const bookedRanges = itinerary.hotels.map(hotel => ({
      start: new Date(hotel.checkIn),
      end: new Date(hotel.checkOut)
    })).sort((a, b) => a.start - b.start)
    
    const availableRanges = []
    let currentDate = new Date(startDate)
    
    for (const bookedRange of bookedRanges) {
      if (currentDate < bookedRange.start) {
        availableRanges.push({
          start: new Date(currentDate),
          end: new Date(bookedRange.start)
        })
      }
      currentDate = new Date(Math.max(currentDate, bookedRange.end))
    }
    
    if (currentDate < endDate) {
      availableRanges.push({
        start: new Date(currentDate),
        end: new Date(endDate)
      })
    }
    
    return availableRanges
  }

  const getBookedDateRanges = () => {
    return itinerary.hotels.map(hotel => ({
      start: new Date(hotel.checkIn),
      end: new Date(hotel.checkOut),
      hotel: hotel.name
    })).sort((a, b) => a.start - b.start)
  }

  const getSuggestedDates = () => {
    const availableRanges = getAvailableDateRanges()
    if (availableRanges.length === 0) return { min: itinerary.startDate, max: itinerary.endDate }
    
    const firstAvailable = availableRanges[0]
    return {
      min: firstAvailable.start.toISOString().split('T')[0],
      max: firstAvailable.end.toISOString().split('T')[0]
    }
  }

  const addActivity = () => {
    if (newActivity.name && newActivity.date) {
      setItinerary(prev => ({
        ...prev,
        activities: [...prev.activities, { ...newActivity, id: Date.now() }]
      }))
      setNewActivity({
        name: '',
        date: '',
        time: '',
        duration: '',
        price: 0,
        description: ''
      })
    }
  }

  const removeActivity = (id) => {
    setItinerary(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== id)
    }))
  }

  const addTransport = () => {
    if (newTransport.type && newTransport.from && newTransport.to) {
      setItinerary(prev => ({
        ...prev,
        transportation: [...prev.transportation, { ...newTransport, id: Date.now() }]
      }))
      setNewTransport({
        type: 'Flight',
        from: '',
        to: '',
        date: '',
        time: '',
        price: 0,
        details: ''
      })
    }
  }

  const removeTransport = (id) => {
    setItinerary(prev => ({
      ...prev,
      transportation: prev.transportation.filter(transport => transport.id !== id)
    }))
  }

  const calculateTotalCost = () => {
    const accommodationCost = itinerary.hotels.reduce((sum, hotel) => sum + (hotel.price || 0), 0)
    const activityCost = itinerary.activities.reduce((sum, activity) => sum + (activity.price || 0), 0)
    const transportCost = itinerary.transportation.reduce((sum, transport) => sum + (transport.price || 0), 0)
    
    const total = accommodationCost + activityCost + transportCost + itinerary.costBreakdown.meals + itinerary.costBreakdown.other
    
    setItinerary(prev => ({
      ...prev,
      totalCost: total,
      costBreakdown: {
        ...prev.costBreakdown,
        accommodation: accommodationCost,
        activities: activityCost,
        transportation: transportCost
      }
    }))
  }

  useEffect(() => {
    calculateTotalCost()
  }, [itinerary.hotels, itinerary.activities, itinerary.transportation, itinerary.costBreakdown.meals, itinerary.costBreakdown.other])

  const handleSave = () => {
    onSave(lead.id, itinerary)
    onClose()
  }

  const steps = [
    { id: 1, name: 'Trip Overview', icon: CalendarIcon },
    { id: 2, name: 'Accommodation', icon: HomeIcon },
    { id: 3, name: 'Activities', icon: MapPinIcon },
    { id: 4, name: 'Transportation', icon: TruckIcon },
    { id: 5, name: 'Pricing', icon: CurrencyDollarIcon }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Itinerary Builder</h2>
            <p className="text-sm text-gray-600">Create detailed trip for {lead?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Trip Overview */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Trip Overview</h3>
              
              {/* Trip Summary */}
              {itinerary.startDate && itinerary.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Trip Duration</h4>
                      <p className="text-sm text-blue-700">
                        {itinerary.duration} {itinerary.duration === 1 ? 'Day' : 'Days'} • {itinerary.nights} {itinerary.nights === 1 ? 'Night' : 'Nights'} • {itinerary.adults} {itinerary.adults === 1 ? 'Adult' : 'Adults'}{itinerary.children > 0 && ` • ${itinerary.children} ${itinerary.children === 1 ? 'Child' : 'Children'}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-blue-600">
                        {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    value={itinerary.tripName}
                    onChange={(e) => setItinerary(prev => ({ ...prev, tripName: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Bali Adventure Trip"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={itinerary.destination}
                    onChange={(e) => setItinerary(prev => ({ ...prev, destination: e.target.value }))}
                    className="input-field"
                    placeholder="Enter destination"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={itinerary.startDate}
                    onChange={(e) => handleTripDatesChange('startDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={itinerary.endDate}
                    onChange={(e) => handleTripDatesChange('endDate', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={itinerary.duration}
                        readOnly
                        className="input-field bg-gray-50"
                        placeholder="Days"
                      />
                      <label className="text-xs text-gray-500">Days</label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={itinerary.nights}
                        readOnly
                        className="input-field bg-gray-50"
                        placeholder="Nights"
                      />
                      <label className="text-xs text-gray-500">Nights</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Travelers
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={itinerary.adults}
                        onChange={(e) => setItinerary(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                        className="input-field"
                        min="1"
                        placeholder="Adults"
                      />
                      <label className="text-xs text-gray-500">Adults</label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={itinerary.children}
                        onChange={(e) => setItinerary(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                        className="input-field"
                        min="0"
                        placeholder="Children"
                      />
                      <label className="text-xs text-gray-500">Children</label>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Total: {itinerary.travelers} {itinerary.travelers === 1 ? 'Traveler' : 'Travelers'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Accommodation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Accommodation</h3>
              
              {/* Trip Date Range */}
              {itinerary.startDate && itinerary.endDate && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Trip Date Range</h4>
                  <p className="text-sm text-green-700">
                    {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                    <span className="ml-2 text-green-600">
                      ({itinerary.duration} {itinerary.duration === 1 ? 'Day' : 'Days'}, {itinerary.nights} {itinerary.nights === 1 ? 'Night' : 'Nights'})
                    </span>
                  </p>
                </div>
              )}
              
              {/* Add Hotel Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Add Hotel</h4>
                
                {/* Guest Information */}
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="text-sm font-medium text-green-900 mb-2">Guest Information</h5>
                  <p className="text-sm text-green-700">
                    Guest details are automatically fetched from Trip Overview: {itinerary.adults} {itinerary.adults === 1 ? 'Adult' : 'Adults'}{itinerary.children > 0 && `, ${itinerary.children} ${itinerary.children === 1 ? 'Child' : 'Children'}`} (Total: {itinerary.travelers} {itinerary.travelers === 1 ? 'Guest' : 'Guests'})
                  </p>
                </div>

                {/* Available Date Ranges */}
                {itinerary.hotels.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Available Date Ranges (Free Slots):</h5>
                    <div className="text-sm text-blue-700">
                      {getAvailableDateRanges().length > 0 ? (
                        getAvailableDateRanges().map((range, index) => (
                          <span key={index} className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 rounded">
                            {range.start.toLocaleDateString()} - {range.end.toLocaleDateString()}
                          </span>
                        ))
                      ) : (
                        <span className="text-red-600 font-medium">No available dates - all dates are booked!</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Booked Date Ranges (Hidden from new hotel form) */}
                {itinerary.hotels.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Already Booked (for reference):</h5>
                    <div className="text-sm text-gray-600">
                      {getBookedDateRanges().map((range, index) => (
                        <span key={index} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 rounded text-gray-500">
                          {range.hotel}: {range.start.toLocaleDateString()} - {range.end.toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Hotel Name"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                  <div>
                    <input
                      type="date"
                      placeholder="Check-in"
                      value={newHotel.checkIn}
                      onChange={(e) => setNewHotel(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="input-field"
                      min={itinerary.startDate}
                      max={itinerary.endDate}
                    />
                    <label className="text-xs text-gray-500">Check-in (choose from available dates above)</label>
                  </div>
                  <div>
                    <input
                      type="date"
                      placeholder="Check-out"
                      value={newHotel.checkOut}
                      onChange={(e) => setNewHotel(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="input-field"
                      min={itinerary.startDate}
                      max={itinerary.endDate}
                    />
                    <label className="text-xs text-gray-500">Check-out (choose from available dates above)</label>
                  </div>
                  <select
                    value={newHotel.roomType}
                    onChange={(e) => setNewHotel(prev => ({ ...prev, roomType: e.target.value }))}
                    className="input-field"
                  >
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="space-y-2">
                    <div>
                      <input
                        type="number"
                        placeholder="Total Guests"
                        value={newHotel.guests}
                        readOnly
                        className="input-field bg-gray-50"
                        min="1"
                      />
                      <label className="text-xs text-gray-500">Total Guests (from trip overview)</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          placeholder="Adults"
                          value={newHotel.adults}
                          readOnly
                          className="input-field bg-gray-50 text-center"
                          min="1"
                        />
                        <label className="text-xs text-gray-500 block text-center">Adults</label>
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Children"
                          value={newHotel.children}
                          readOnly
                          className="input-field bg-gray-50 text-center"
                          min="0"
                        />
                        <label className="text-xs text-gray-500 block text-center">Children</label>
                      </div>
                    </div>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="0"
                      value={newHotel.price === 0 ? '' : newHotel.price}
                      onChange={(e) => setNewHotel(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                      className="input-field w-24"
                      step="0.01"
                    />
                    <label className="text-xs text-gray-500">Amount</label>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Location/Address"
                    value={newHotel.location}
                    onChange={(e) => setNewHotel(prev => ({ ...prev, location: e.target.value }))}
                    className="input-field w-full"
                  />
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={addHotel}
                    className="btn-primary flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Hotel
                  </button>
                  
                  {getAvailableDateRanges().length > 0 && (
                    <button
                      onClick={() => {
                        const firstAvailable = getAvailableDateRanges()[0]
                        setNewHotel(prev => ({
                          ...prev,
                          checkIn: firstAvailable.start.toISOString().split('T')[0],
                          checkOut: firstAvailable.end.toISOString().split('T')[0]
                        }))
                      }}
                      className="btn-secondary text-sm"
                    >
                      Use First Available Dates
                    </button>
                  )}
                </div>
              </div>

              {/* Hotels Timeline */}
              {itinerary.hotels.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Hotel Timeline</h4>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                    {itinerary.hotels.map((hotel, index) => (
                      <div key={hotel.id} className="relative flex items-center mb-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium z-10">
                          {index + 1}
                        </div>
                        <div className="ml-4 flex-1 bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                              <p className="text-sm text-gray-600">{hotel.location}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="font-medium text-blue-600">{hotel.checkIn} to {hotel.checkOut}</span>
                                <span>{hotel.roomType}</span>
                                <span className="font-medium">
                                  {hotel.guests} {hotel.guests === 1 ? 'Guest' : 'Guests'}
                                  {hotel.adults && hotel.children !== undefined && (
                                    <span className="text-gray-400">
                                      {' '}({hotel.adults} {hotel.adults === 1 ? 'Adult' : 'Adults'}{hotel.children > 0 && `, ${hotel.children} ${hotel.children === 1 ? 'Child' : 'Children'}`})
                                    </span>
                                  )}
                                </span>
                                <span className="font-medium text-green-600">${hotel.price}/night</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeHotel(hotel.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels List (Simple) */}
              {itinerary.hotels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HomeIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hotels added yet. Add your first hotel above.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Activities */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Activities & Attractions</h3>
              
              {/* Add Activity Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Add Activity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Activity Name"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="time"
                    placeholder="Time"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., 2 hours)"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, duration: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newActivity.price}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    step="0.01"
                  />
                </div>
                <div className="mt-4">
                  <textarea
                    placeholder="Activity Description"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                    className="input-field w-full"
                    rows={2}
                  />
                </div>
                <button
                  onClick={addActivity}
                  className="mt-4 btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Activity
                </button>
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                {itinerary.activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{activity.date} at {activity.time}</span>
                          <span>{activity.duration}</span>
                          <span className="font-medium text-green-600">${activity.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeActivity(activity.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Transportation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Transportation</h3>
              
              {/* Add Transport Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Add Transportation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={newTransport.type}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, type: e.target.value }))}
                    className="input-field"
                  >
                    {transportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="From"
                    value={newTransport.from}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, from: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="To"
                    value={newTransport.to}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, to: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    value={newTransport.date}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, date: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="time"
                    placeholder="Time"
                    value={newTransport.time}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, time: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={newTransport.price}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="input-field"
                    step="0.01"
                  />
                </div>
                <div className="mt-4">
                  <textarea
                    placeholder="Transportation Details (flight number, car model, etc.)"
                    value={newTransport.details}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, details: e.target.value }))}
                    className="input-field w-full"
                    rows={2}
                  />
                </div>
                <button
                  onClick={addTransport}
                  className="mt-4 btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Transportation
                </button>
              </div>

              {/* Transportation List */}
              <div className="space-y-4">
                {itinerary.transportation.map((transport) => (
                  <div key={transport.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{transport.type}</h4>
                        <p className="text-sm text-gray-600">{transport.from} → {transport.to}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{transport.date} at {transport.time}</span>
                          <span className="font-medium text-green-600">${transport.price}</span>
                        </div>
                        {transport.details && (
                          <p className="text-xs text-gray-500 mt-1">{transport.details}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeTransport(transport.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Pricing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Pricing & Summary</h3>
              
              {/* Trip Summary */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-primary-900">Trip Summary</h4>
                    <p className="text-sm text-primary-700">
                      {itinerary.tripName || 'Untitled Trip'} • {itinerary.destination}
                    </p>
                    <p className="text-sm text-primary-600">
                      {itinerary.duration} {itinerary.duration === 1 ? 'Day' : 'Days'} • {itinerary.nights} {itinerary.nights === 1 ? 'Night' : 'Nights'} • {itinerary.adults} {itinerary.adults === 1 ? 'Adult' : 'Adults'}{itinerary.children > 0 && ` • ${itinerary.children} ${itinerary.children === 1 ? 'Child' : 'Children'}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">
                      ${itinerary.totalCost.toFixed(2)}
                    </p>
                    <p className="text-sm text-primary-500">Total Cost</p>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Cost Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Accommodation</span>
                    <span className="font-medium">${itinerary.costBreakdown.accommodation.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activities</span>
                    <span className="font-medium">${itinerary.costBreakdown.activities.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation</span>
                    <span className="font-medium">${itinerary.costBreakdown.transportation.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meals</span>
                    <span className="font-medium">${itinerary.costBreakdown.meals.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other</span>
                    <span className="font-medium">${itinerary.costBreakdown.other.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Cost</span>
                      <span className="text-primary-600">${itinerary.totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meals Budget
                  </label>
                  <input
                    type="number"
                    value={itinerary.costBreakdown.meals}
                    onChange={(e) => setItinerary(prev => ({
                      ...prev,
                      costBreakdown: { ...prev.costBreakdown, meals: parseFloat(e.target.value) || 0 }
                    }))}
                    className="input-field"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Expenses
                  </label>
                  <input
                    type="number"
                    value={itinerary.costBreakdown.other}
                    onChange={(e) => setItinerary(prev => ({
                      ...prev,
                      costBreakdown: { ...prev.costBreakdown, other: parseFloat(e.target.value) || 0 }
                    }))}
                    className="input-field"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={itinerary.specialRequests}
                  onChange={(e) => setItinerary(prev => ({ ...prev, specialRequests: e.target.value }))}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Any special requests or requirements..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={itinerary.notes}
                  onChange={(e) => setItinerary(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field w-full"
                  rows={3}
                  placeholder="Additional notes about the itinerary..."
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
                  className="btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="btn-success"
                >
                  Save Itinerary
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom Notification */}
      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        duration={notification.duration}
      />
    </div>
  )
}
