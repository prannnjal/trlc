# Travel CRM Backend Setup

This document provides comprehensive information about the backend implementation for the Travel CRM application.

## 🏗️ Architecture Overview

The backend is built using Next.js API routes with the following key components:

- **Database**: MySQL with mysql2 for high performance and scalability
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Joi for request validation
- **Middleware**: Custom authentication and authorization middleware
- **API Routes**: RESTful API endpoints for all CRM operations

## 📁 Project Structure

```
src/
├── lib/
│   ├── database.js          # Database configuration and utilities
│   ├── mysql.js             # MySQL connection and query utilities
│   ├── auth.js              # Authentication utilities
│   ├── middleware.js        # Authentication and authorization middleware
│   ├── seed.js              # Database seeding with sample data
│   └── init-db.js           # Database initialization script
├── app/api/
│   ├── auth/
│   │   ├── login/route.js   # User login endpoint
│   │   ├── register/route.js # User registration endpoint
│   │   ├── me/route.js      # Get current user endpoint
│   │   └── logout/route.js  # User logout endpoint
│   ├── customers/
│   │   ├── route.js         # List and create customers
│   │   └── [id]/route.js    # Get, update, delete customer
│   ├── leads/
│   │   ├── route.js         # List and create leads
│   │   └── [id]/route.js    # Get, update, delete lead
│   ├── quotes/
│   │   ├── route.js         # List and create quotes
│   │   └── [id]/route.js    # Get, update, delete quote
│   ├── bookings/
│   │   ├── route.js         # List and create bookings
│   │   └── [id]/route.js    # Get, update, delete booking
│   ├── payments/
│   │   └── route.js         # List and create payments
│   ├── users/
│   │   ├── route.js         # List and create users
│   │   └── [id]/route.js    # Get, update, delete user
│   └── dashboard/
│       └── stats/route.js   # Dashboard statistics
```

## 🗄️ Database Schema

### Core Tables

1. **users** - System users with role-based access
2. **customers** - Customer information and contact details
3. **leads** - Sales leads with source, destination, and status
4. **quotes** - Detailed travel quotes with line items
5. **quote_items** - Individual items within quotes
6. **bookings** - Confirmed travel bookings
7. **payments** - Payment transactions for bookings
8. **activities** - Activity log for all entities
9. **settings** - System configuration settings

### Key Relationships

- Customers can have multiple leads, quotes, and bookings
- Leads can be converted to quotes
- Quotes can be converted to bookings
- Bookings can have multiple payments
- All entities have activity logs

## 🔐 Authentication & Authorization

### User Roles

1. **Super User** (`super`)
   - Full system access
   - User management
   - System configuration
   - Audit logs access

2. **Admin** (`admin`)
   - Full CRM access
   - User management
   - System reports

3. **Sales** (`sales`)
   - Leads, quotes, bookings management
   - Customer management
   - Basic reports

### JWT Token Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "admin",
  "permissions": ["all"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up MySQL Database

First, ensure MySQL is installed and running. Then create the database:

```sql
CREATE DATABASE travel_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'travel_crm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON travel_crm.* TO 'travel_crm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=travel_crm_user
DB_PASSWORD=your_password
DB_NAME=travel_crm
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 4. Initialize Database

```bash
npm run init-db
```

This will:
- Connect to MySQL database
- Create all tables with proper relationships and indexes
- Seed with sample data and default users

### 5. Start Development Server

```bash
npm run dev
```

### 6. Default Login Credentials

- **Super User**: `super@travelcrm.com` / `super123`
- **Admin User**: `admin@travelcrm.com` / `admin123`
- **Sales User**: `sales@travelcrm.com` / `sales123`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Customers

- `GET /api/customers` - List customers (with pagination and search)
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Leads

- `GET /api/leads` - List leads (with filtering)
- `POST /api/leads` - Create new lead
- `GET /api/leads/[id]` - Get lead details with activities
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead

### Quotes

- `GET /api/quotes` - List quotes (with filtering)
- `POST /api/quotes` - Create new quote with items
- `GET /api/quotes/[id]` - Get quote details with items and activities
- `PUT /api/quotes/[id]` - Update quote and items
- `DELETE /api/quotes/[id]` - Delete quote

### Bookings

- `GET /api/bookings` - List bookings (with filtering)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get booking details with payments and activities
- `PUT /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Delete booking

### Payments

- `GET /api/payments` - List payments (with filtering)
- `POST /api/payments` - Create new payment

### Users (Admin Only)

- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics and analytics

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_PATH=./data/travel_crm.db

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Travel CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Database Configuration

The MySQL database is configured with:

- **UTF8MB4 Character Set** - Full Unicode support including emojis
- **Foreign key constraints** for data integrity
- **Optimized indexes** for query performance
- **Connection pooling** for scalability
- **Automatic timestamps** for audit trails
- **ENUM types** for constrained values
- **JSON fields** for flexible data storage

## 🛡️ Security Features

### Authentication Security

- JWT tokens with configurable expiration
- Bcrypt password hashing with salt rounds
- Role-based access control
- Permission-based authorization

### API Security

- Request validation with Joi schemas
- SQL injection prevention with prepared statements
- Rate limiting capabilities
- CORS configuration
- Helmet security headers

### Data Security

- Password hashing with bcrypt
- Input sanitization and validation
- SQL injection prevention
- XSS protection

## 📊 Sample Data

The seeding script creates:

- 3 default users (super, admin, sales)
- 3 sample customers with complete profiles
- 3 sample leads with different statuses
- 2 sample quotes with detailed line items
- 1 sample booking with payment
- Activity logs for all entities
- System settings

## 🔄 Data Flow

1. **Lead Generation**: New leads are created from various sources
2. **Lead Qualification**: Leads are qualified and assigned to sales reps
3. **Quote Creation**: Qualified leads are converted to detailed quotes
4. **Quote Approval**: Customers review and approve quotes
5. **Booking Confirmation**: Approved quotes become confirmed bookings
6. **Payment Processing**: Payments are recorded against bookings
7. **Travel Execution**: Bookings are managed through completion

## 🚀 Production Deployment

### Database

The MySQL setup is production-ready with:
- Connection pooling for high concurrency
- Optimized indexes for performance
- UTF8MB4 support for international data
- Automated backup strategies
- Monitoring and alerting capabilities

### Security

- Change default JWT secret
- Use environment variables for all secrets
- Enable HTTPS
- Implement proper logging
- Set up monitoring and alerting

### Performance

- Database indexes are already optimized for common queries
- Connection pooling is configured with MySQL2
- Consider implementing Redis caching for high-traffic scenarios
- Monitor query performance and optimize as needed

## 🧪 Testing

The API endpoints can be tested using:

- Postman collections
- curl commands
- Frontend integration tests
- Unit tests for business logic

## 📈 Monitoring & Analytics

The dashboard provides:

- Revenue analytics
- Conversion rate tracking
- Customer insights
- Lead source analysis
- Payment tracking
- Activity monitoring

## 🔧 Maintenance

### Database Maintenance

- Regular backups of MySQL database
- Index optimization and monitoring
- Data cleanup for old records
- Performance monitoring and query optimization
- Connection pool monitoring

### Code Maintenance

- Regular dependency updates
- Security patch management
- Code review processes
- Documentation updates

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed**: Check MySQL service and credentials
2. **Database not found**: Run `npm run init-db`
3. **Authentication errors**: Check JWT secret configuration
4. **Permission denied**: Verify user roles and permissions
5. **Validation errors**: Check request body format
6. **Connection timeout**: Check MySQL connection limits and pool settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=travel-crm:*
```

## 📚 Additional Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL2 Node.js Driver](https://github.com/sidorares/node-mysql2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)

---

This backend provides a solid foundation for a Travel CRM system with room for future enhancements and scaling.
