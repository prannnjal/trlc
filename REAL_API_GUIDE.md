# Real API Integration Guide

This guide explains how the Travel CRM frontend now fetches real data from the MySQL database through the API instead of using mock data.

## 🎯 What's Changed

### ✅ Removed Mock Data
- All mock authentication logic removed
- Mock user data replaced with real API calls
- Local storage now stores JWT tokens instead of mock user objects

### ✅ Added Real API Integration
- JWT-based authentication with the backend
- Real-time data fetching from MySQL database
- Comprehensive API utility functions
- Data context for state management
- Custom hooks for API operations

## 🏗️ Architecture Overview

```
Frontend (React/Next.js)
    ↓ API Calls
Backend API Routes (/api/*)
    ↓ Database Queries
MySQL Database
```

## 📁 New Files Created

### 1. API Utilities (`src/lib/api.js`)
- Centralized API functions for all endpoints
- Automatic JWT token handling
- Error handling and response processing
- Support for all CRUD operations

### 2. Custom Hooks (`src/hooks/useAPI.js`)
- `useAPI` - For simple data fetching
- `useAPIMutation` - For POST/PUT/DELETE operations
- `usePaginatedAPI` - For paginated data
- `useRealtimeAPI` - For real-time updates

### 3. Data Context (`src/contexts/DataContext.js`)
- Centralized state management for all CRM data
- Automatic data fetching and caching
- Real-time updates and error handling
- Integration with authentication context

### 4. Test Page (`src/app/test-data/page.js`)
- Demonstrates real data fetching
- Shows all CRM entities from database
- Visual confirmation of API integration

## 🔧 How to Use

### 1. Authentication
The authentication now works with real JWT tokens:

```javascript
import { useAuth } from '@/contexts/AuthContext'

const { user, login, logout, isAuthenticated } = useAuth()

// Login with real credentials
const result = await login({
  email: 'super@travelcrm.com',
  password: 'super123'
})

if (result.success) {
  // User is now authenticated with JWT token
  console.log('Logged in user:', result.user)
}
```

### 2. Data Fetching
Use the DataContext to access real database data:

```javascript
import { useData } from '@/contexts/DataContext'

const { 
  customers, 
  customersLoading, 
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer 
} = useData()

// Data is automatically loaded when component mounts
// Use the functions to perform CRUD operations
```

### 3. Direct API Calls
For custom operations, use the API utilities:

```javascript
import { customersAPI } from '@/lib/api'

// Get all customers
const result = await customersAPI.getAll({ search: 'john' })

// Create new customer
const newCustomer = await customersAPI.create({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
})
```

### 4. Custom Hooks
For specific use cases, use the custom hooks:

```javascript
import { useAPI, useAPIMutation } from '@/hooks/useAPI'
import { customersAPI } from '@/lib/api'

// Simple data fetching
const { data: customers, loading, error } = useAPI(customersAPI.getAll)

// Mutation operations
const { mutate: createCustomer, loading: creating } = useAPIMutation(customersAPI.create)
```

## 🌐 Available API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - User registration

### Customers
- `GET /api/customers` - List customers (with pagination/search)
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Leads
- `GET /api/leads` - List leads (with filtering)
- `POST /api/leads` - Create lead
- `GET /api/leads/[id]` - Get lead details
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Quotes
- `GET /api/quotes` - List quotes (with filtering)
- `POST /api/quotes` - Create quote
- `GET /api/quotes/[id]` - Get quote details
- `PUT /api/quotes/[id]` - Update quote
- `DELETE /api/quotes/[id]` - Delete quote

### Bookings
- `GET /api/bookings` - List bookings (with filtering)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment

### Users (Admin Only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔐 Authentication Flow

1. **Login**: User enters credentials
2. **API Call**: Frontend calls `/api/auth/login`
3. **JWT Token**: Backend returns JWT token
4. **Storage**: Token stored in localStorage
5. **API Requests**: All subsequent requests include token in Authorization header
6. **Validation**: Backend validates token on each request
7. **Logout**: Token removed from storage

## 📊 Data Flow

1. **Component Mount**: DataContext automatically fetches initial data
2. **User Actions**: CRUD operations trigger API calls
3. **State Update**: Local state updated with new data
4. **UI Refresh**: Components re-render with updated data
5. **Error Handling**: Errors displayed to user

## 🧪 Testing the Integration

### 1. Start the Application
```bash
npm run dev
```

### 2. Initialize Database
```bash
npm run init-db
```

### 3. Access Test Page
Go to: `http://localhost:3000/test-data`

This page shows:
- Real dashboard statistics from database
- Live customer data
- Live lead data
- Live quote data
- Live booking data

### 4. Verify Data
- All data should be real (not mock)
- Loading states should work
- Data should refresh automatically
- Error handling should work

## 🔧 Configuration

### Environment Variables
Make sure your `.env.local` file has:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=travel_crm_user
DB_PASSWORD=1234567890
DB_NAME=travel_crm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d
```

### API Base URL
The API calls use relative URLs by default. For production, you can set:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## 🚀 Production Considerations

### 1. Security
- Use strong JWT secrets
- Enable HTTPS
- Implement rate limiting
- Add CORS configuration

### 2. Performance
- Implement caching strategies
- Use connection pooling
- Optimize database queries
- Add pagination for large datasets

### 3. Monitoring
- Add error tracking
- Monitor API performance
- Set up database monitoring
- Implement logging

## 🆘 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT secret configuration
   - Verify token storage
   - Check API endpoint responses

2. **Data Not Loading**
   - Verify database connection
   - Check API endpoint availability
   - Review browser network tab

3. **CORS Issues**
   - Configure CORS in API routes
   - Check domain configuration
   - Verify request headers

### Debug Mode
Enable debug logging:

```env
NODE_ENV=development
DEBUG=travel-crm:*
```

## 📚 Next Steps

1. **Update Components**: Replace mock data usage with DataContext
2. **Add Error Handling**: Implement proper error boundaries
3. **Optimize Performance**: Add caching and pagination
4. **Add Real-time Updates**: Implement WebSocket connections
5. **Enhance Security**: Add input validation and sanitization

---

The Travel CRM now has a complete real API integration with MySQL database. All data is fetched from the database, and the application provides a solid foundation for production use.
