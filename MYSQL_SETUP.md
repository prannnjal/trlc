# MySQL Database Setup for Travel CRM

This guide will help you set up MySQL database for the Travel CRM application.

## 🗄️ Prerequisites

Before setting up the MySQL database, ensure you have:

1. **MySQL Server** installed (version 8.0 or higher recommended)
2. **Node.js** and **npm** installed
3. **MySQL Workbench** or **phpMyAdmin** (optional, for database management)

## 🚀 Quick Setup

### 1. Install MySQL Server

#### Windows
```bash
# Download MySQL Installer from https://dev.mysql.com/downloads/installer/
# Or use Chocolatey
choco install mysql
```

#### macOS
```bash
# Using Homebrew
brew install mysql
brew services start mysql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Secure MySQL Installation

```bash
# Run the security script
sudo mysql_secure_installation
```

### 3. Create Database and User

Connect to MySQL as root:
```bash
mysql -u root -p
```

Create database and user:
```sql
-- Create database
CREATE DATABASE travel_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'travel_crm_user'@'localhost' IDENTIFIED BY 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON travel_crm.* TO 'travel_crm_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 4. Environment Configuration

Create a `.env.local` file in your project root:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=travel_crm_user
DB_PASSWORD=your_password
DB_NAME=travel_crm

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-make-it-long-and-random
JWT_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Travel CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Initialize Database

```bash
npm run init-db
```

This will:
- Create all necessary tables
- Set up indexes and foreign key constraints
- Seed the database with sample data
- Create default users

### 7. Start the Application

```bash
npm run dev
```

## 🔧 Database Schema

The MySQL database includes the following tables:

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

### Key Features

- **UTF8MB4 Character Set** - Full Unicode support including emojis
- **Foreign Key Constraints** - Data integrity enforcement
- **Indexes** - Optimized query performance
- **Auto-incrementing IDs** - Primary keys with auto-increment
- **Timestamps** - Automatic created_at and updated_at tracking
- **JSON Fields** - Flexible permissions storage
- **ENUM Types** - Constrained status and role values

## 🔐 Default Login Credentials

After initialization, you can log in with:

- **Super User**: `super@travelcrm.com` / `super123`
- **Admin User**: `admin@travelcrm.com` / `admin123`
- **Sales User**: `sales@travelcrm.com` / `sales123`

## 🛠️ Database Management

### Connection Pool Configuration

The application uses MySQL2 with connection pooling:

```javascript
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'travel_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
}
```

### Backup and Restore

#### Backup
```bash
# Create backup
mysqldump -u travel_crm_user -p travel_crm > travel_crm_backup.sql

# Compressed backup
mysqldump -u travel_crm_user -p travel_crm | gzip > travel_crm_backup.sql.gz
```

#### Restore
```bash
# Restore from backup
mysql -u travel_crm_user -p travel_crm < travel_crm_backup.sql

# Restore from compressed backup
gunzip < travel_crm_backup.sql.gz | mysql -u travel_crm_user -p travel_crm
```

## 🚀 Production Deployment

### Environment Variables

For production, update your environment variables:

```env
# Production Database
DB_HOST=your-production-host
DB_PORT=3306
DB_USER=travel_crm_prod
DB_PASSWORD=strong-production-password
DB_NAME=travel_crm_production

# Security
JWT_SECRET=very-long-random-production-secret-key
NODE_ENV=production

# Performance
DB_CONNECTION_LIMIT=20
DB_ACQUIRE_TIMEOUT=60000
```

### Security Considerations

1. **Strong Passwords** - Use complex passwords for database users
2. **Limited Privileges** - Grant only necessary permissions
3. **SSL Connections** - Enable SSL for production connections
4. **Firewall Rules** - Restrict database access to application servers
5. **Regular Backups** - Implement automated backup strategies

### Performance Optimization

1. **Connection Pooling** - Already configured with MySQL2
2. **Indexes** - Optimized for common query patterns
3. **Query Optimization** - Use prepared statements
4. **Monitoring** - Set up database monitoring and alerting

## 🔍 Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Start MySQL service
sudo systemctl start mysql
```

#### Access Denied
```sql
-- Check user privileges
SHOW GRANTS FOR 'travel_crm_user'@'localhost';

-- Reset password if needed
ALTER USER 'travel_crm_user'@'localhost' IDENTIFIED BY 'new_password';
```

#### Database Not Found
```sql
-- Create database if missing
CREATE DATABASE travel_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Character Set Issues
```sql
-- Check database character set
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE SCHEMA_NAME = 'travel_crm';

-- Convert existing database
ALTER DATABASE travel_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Debug Mode

Enable debug logging:
```env
DEBUG=mysql:*
NODE_ENV=development
```

## 📊 Monitoring

### Performance Monitoring

Monitor key metrics:
- Connection pool usage
- Query execution times
- Database size and growth
- Slow query log analysis

### Health Checks

The application includes database health checks:
```javascript
// Test connection
const connected = await testConnection()
```

## 🔄 Migration from SQLite

If you're migrating from SQLite:

1. **Export Data** - Export existing data from SQLite
2. **Create MySQL Schema** - Run the initialization script
3. **Import Data** - Import data into MySQL tables
4. **Update Configuration** - Change environment variables
5. **Test Application** - Verify all functionality works

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL2 Node.js Driver](https://github.com/sidorares/node-mysql2)
- [MySQL Performance Tuning](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- [MySQL Security Best Practices](https://dev.mysql.com/doc/refman/8.0/en/security.html)

---

This MySQL setup provides a robust, scalable foundation for your Travel CRM application with proper security, performance, and maintainability features.
