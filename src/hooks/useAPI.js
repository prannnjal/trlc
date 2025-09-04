import { useState, useEffect, useCallback } from 'react'
import { handleAPIError } from '@/lib/api'

// Custom hook for API data fetching
export const useAPI = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetch, setRefetch] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction()
      setData(result.data || result)
    } catch (err) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData, refetch])

  const refetchData = useCallback(() => {
    setRefetch(prev => prev + 1)
  }, [])

  return {
    data,
    loading,
    error,
    refetch: refetchData
  }
}

// Custom hook for API mutations (POST, PUT, DELETE)
export const useAPIMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (data) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction(data)
      return result
    } catch (err) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  return {
    mutate,
    loading,
    error
  }
}

// Custom hook for paginated data
export const usePaginatedAPI = (apiFunction, initialParams = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [params, setParams] = useState(initialParams)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiFunction({
        ...params,
        page: pagination.page,
        limit: pagination.limit
      })
      
      if (result.data) {
        setData(result.data[Object.keys(result.data)[0]] || [])
        setPagination(result.data.pagination || pagination)
      } else {
        setData(result)
      }
    } catch (err) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [apiFunction, params, pagination.page, pagination.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const changeLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }, [])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    pagination,
    updateParams,
    changePage,
    changeLimit,
    refetch
  }
}

// Custom hook for real-time data updates
export const useRealtimeAPI = (apiFunction, interval = 30000) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await apiFunction()
      setData(result.data || result)
    } catch (err) {
      const errorMessage = handleAPIError(err)
      setError(errorMessage)
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  useEffect(() => {
    fetchData()
    
    const intervalId = setInterval(fetchData, interval)
    
    return () => clearInterval(intervalId)
  }, [fetchData, interval])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

export default {
  useAPI,
  useAPIMutation,
  usePaginatedAPI,
  useRealtimeAPI
}
