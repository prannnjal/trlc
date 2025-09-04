'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { 
  customersAPI, 
  leadsAPI, 
  quotesAPI, 
  bookingsAPI, 
  paymentsAPI, 
  dashboardAPI 
} from '@/lib/api'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // Customers data
  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customersPagination, setCustomersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Leads data
  const [leads, setLeads] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsPagination, setLeadsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Quotes data
  const [quotes, setQuotes] = useState([])
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesPagination, setQuotesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Bookings data
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsPagination, setBookingsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  // Payments data
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)

  // Dashboard functions
  const fetchDashboardStats = async () => {
    if (!isAuthenticated) return
    
    try {
      setDashboardLoading(true)
      const result = await dashboardAPI.getStats()
      setDashboardStats(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setDashboardLoading(false)
    }
  }

  // Customer functions
  const fetchCustomers = async (params = {}) => {
    if (!isAuthenticated) return
    
    try {
      setCustomersLoading(true)
      const result = await customersAPI.getAll({
        ...params,
        page: customersPagination.page,
        limit: customersPagination.limit
      })
      setCustomers(result.data.customers)
      setCustomersPagination(result.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setCustomersLoading(false)
    }
  }

  const createCustomer = async (customerData) => {
    try {
      const result = await customersAPI.create(customerData)
      await fetchCustomers() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateCustomer = async (id, customerData) => {
    try {
      const result = await customersAPI.update(id, customerData)
      await fetchCustomers() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteCustomer = async (id) => {
    try {
      const result = await customersAPI.delete(id)
      await fetchCustomers() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Lead functions
  const fetchLeads = async (params = {}) => {
    if (!isAuthenticated) return
    
    try {
      setLeadsLoading(true)
      const result = await leadsAPI.getAll({
        ...params,
        page: leadsPagination.page,
        limit: leadsPagination.limit
      })
      setLeads(result.data.leads)
      setLeadsPagination(result.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLeadsLoading(false)
    }
  }

  const createLead = async (leadData) => {
    try {
      const result = await leadsAPI.create(leadData)
      await fetchLeads() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateLead = async (id, leadData) => {
    try {
      const result = await leadsAPI.update(id, leadData)
      await fetchLeads() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteLead = async (id) => {
    try {
      const result = await leadsAPI.delete(id)
      await fetchLeads() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Quote functions
  const fetchQuotes = async (params = {}) => {
    if (!isAuthenticated) return
    
    try {
      setQuotesLoading(true)
      const result = await quotesAPI.getAll({
        ...params,
        page: quotesPagination.page,
        limit: quotesPagination.limit
      })
      setQuotes(result.data.quotes)
      setQuotesPagination(result.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setQuotesLoading(false)
    }
  }

  const createQuote = async (quoteData) => {
    try {
      const result = await quotesAPI.create(quoteData)
      await fetchQuotes() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateQuote = async (id, quoteData) => {
    try {
      const result = await quotesAPI.update(id, quoteData)
      await fetchQuotes() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteQuote = async (id) => {
    try {
      const result = await quotesAPI.delete(id)
      await fetchQuotes() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Booking functions
  const fetchBookings = async (params = {}) => {
    if (!isAuthenticated) return
    
    try {
      setBookingsLoading(true)
      const result = await bookingsAPI.getAll({
        ...params,
        page: bookingsPagination.page,
        limit: bookingsPagination.limit
      })
      setBookings(result.data.bookings)
      setBookingsPagination(result.data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setBookingsLoading(false)
    }
  }

  const createBooking = async (bookingData) => {
    try {
      const result = await bookingsAPI.create(bookingData)
      await fetchBookings() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateBooking = async (id, bookingData) => {
    try {
      const result = await bookingsAPI.update(id, bookingData)
      await fetchBookings() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteBooking = async (id) => {
    try {
      const result = await bookingsAPI.delete(id)
      await fetchBookings() // Refresh the list
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Payment functions
  const fetchPayments = async (params = {}) => {
    if (!isAuthenticated) return
    
    try {
      setPaymentsLoading(true)
      const result = await paymentsAPI.getAll(params)
      setPayments(result.data.payments)
    } catch (err) {
      setError(err.message)
    } finally {
      setPaymentsLoading(false)
    }
  }

  const createPayment = async (paymentData) => {
    try {
      const result = await paymentsAPI.create(paymentData)
      await fetchBookings() // Refresh bookings to update payment status
      return result
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDashboardStats()
      fetchCustomers()
      fetchLeads()
      fetchQuotes()
      fetchBookings()
    }
  }, [isAuthenticated, user])

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setDashboardStats(null)
      setCustomers([])
      setLeads([])
      setQuotes([])
      setBookings([])
      setPayments([])
      setError(null)
    }
  }, [isAuthenticated])

  const value = {
    // Dashboard
    dashboardStats,
    dashboardLoading,
    fetchDashboardStats,

    // Customers
    customers,
    customersLoading,
    customersPagination,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Leads
    leads,
    leadsLoading,
    leadsPagination,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,

    // Quotes
    quotes,
    quotesLoading,
    quotesPagination,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,

    // Bookings
    bookings,
    bookingsLoading,
    bookingsPagination,
    fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,

    // Payments
    payments,
    paymentsLoading,
    fetchPayments,
    createPayment,

    // General
    loading,
    error,
    setError
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
