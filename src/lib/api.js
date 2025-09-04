// API utility functions for Travel CRM

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('crm_token')
  }
  return null
}

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  
  return headers
}

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: createHeaders(options.includeAuth !== false),
    ...options
  }
  
  try {
    const response = await fetch(url, config)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed')
    }
    
    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      includeAuth: false
    })
  },
  
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST'
    })
  },
  
  getCurrentUser: async () => {
    return apiRequest('/api/auth/me')
  },
  
  register: async (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      includeAuth: false
    })
  }
}

// Customers API
export const customersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/api/customers${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: async (id) => {
    return apiRequest(`/api/customers/${id}`)
  },
  
  create: async (customerData) => {
    return apiRequest('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    })
  },
  
  update: async (id, customerData) => {
    return apiRequest(`/api/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    })
  },
  
  delete: async (id) => {
    return apiRequest(`/api/customers/${id}`, {
      method: 'DELETE'
    })
  }
}

// Leads API
export const leadsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/api/leads${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: async (id) => {
    return apiRequest(`/api/leads/${id}`)
  },
  
  create: async (leadData) => {
    return apiRequest('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    })
  },
  
  update: async (id, leadData) => {
    return apiRequest(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    })
  },
  
  delete: async (id) => {
    return apiRequest(`/api/leads/${id}`, {
      method: 'DELETE'
    })
  }
}

// Quotes API
export const quotesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/api/quotes${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: async (id) => {
    return apiRequest(`/api/quotes/${id}`)
  },
  
  create: async (quoteData) => {
    return apiRequest('/api/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    })
  },
  
  update: async (id, quoteData) => {
    return apiRequest(`/api/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quoteData)
    })
  },
  
  delete: async (id) => {
    return apiRequest(`/api/quotes/${id}`, {
      method: 'DELETE'
    })
  }
}

// Bookings API
export const bookingsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/api/bookings${queryString ? `?${queryString}` : ''}`)
  },
  
  getById: async (id) => {
    return apiRequest(`/api/bookings/${id}`)
  },
  
  create: async (bookingData) => {
    return apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    })
  },
  
  update: async (id, bookingData) => {
    return apiRequest(`/api/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData)
    })
  },
  
  delete: async (id) => {
    return apiRequest(`/api/bookings/${id}`, {
      method: 'DELETE'
    })
  }
}

// Payments API
export const paymentsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/api/payments${queryString ? `?${queryString}` : ''}`)
  },
  
  create: async (paymentData) => {
    return apiRequest('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }
}

// Users API (Admin only)
export const usersAPI = {
  getAll: async () => {
    return apiRequest('/api/users')
  },
  
  getById: async (id) => {
    return apiRequest(`/api/users/${id}`)
  },
  
  create: async (userData) => {
    return apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  },
  
  update: async (id, userData) => {
    return apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  },
  
  delete: async (id) => {
    return apiRequest(`/api/users/${id}`, {
      method: 'DELETE'
    })
  }
}

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return apiRequest('/api/dashboard/stats')
  }
}

// Generic error handler
export const handleAPIError = (error) => {
  if (error.message === 'Unauthorized' || error.message.includes('401')) {
    // Redirect to login or clear auth
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
      window.location.href = '/'
    }
  }
  return error.message || 'An error occurred'
}

export default {
  authAPI,
  customersAPI,
  leadsAPI,
  quotesAPI,
  bookingsAPI,
  paymentsAPI,
  usersAPI,
  dashboardAPI,
  handleAPIError
}
