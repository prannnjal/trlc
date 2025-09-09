# Admin Sales Account Creation

## Overview
Admin users can create sales accounts for their team members. This feature allows admins to manage their organization's sales team while maintaining proper data isolation.

## Features

### ✅ **Admin Sales Account Creation**
- **Admins can create sales accounts** for their team members
- **Super users can create both admin and sales accounts**
- **Proper data isolation** - each admin only sees their own sales team
- **Hierarchical management** - admins can only manage users they created

### 🎯 **User Hierarchy**
```
🚀 Super User
├── 👑 Admin A
│   ├── 💼 Sales A1 (created by Admin A)
│   ├── 💼 Sales A2 (created by Admin A)
│   └── 👑 Admin A1 (created by Admin A)
│       └── 💼 Sales A1a (created by Admin A1)
└── 👑 Admin B
    ├── 💼 Sales B1 (created by Admin B)
    └── 💼 Sales B2 (created by Admin B)
```

### 🔐 **Access Control**
- **Super Users**: Can create both Admin and Sales accounts
- **Admin Users**: Can only create Sales accounts
- **Sales Users**: Cannot create any accounts

### 📊 **Data Isolation**
- Each admin can only see and manage:
  - Their own data
  - Data created by their sales team members
  - Users they created

## API Endpoints

### 1. Create Sales Account (Admin Only)
```
POST /api/admin/create-sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "securepassword123"
}
```

### 2. Create User (Super User Only)
```
POST /api/admin/create-admin
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "securepassword123",
  "role": "admin" // or "sales"
}
```

## UI Features

### 🎨 **User Management Interface**
- **Role-based UI**: Different options for super users vs admins
- **Clear labeling**: "Create Sales Account" for admins, "Create New User" for super users
- **Helpful descriptions**: Explains what each role can create
- **Visual indicators**: Emojis and colors to distinguish roles

### 📱 **Dashboard Integration**
- **Create Sales button** on admin dashboard
- **Quick access** to user management
- **Role-specific messaging** and branding

## Usage Examples

### Admin Creating Sales Account
1. Admin logs in to their dashboard
2. Clicks "Create Sales Account" button
3. Fills in sales person details (name, email, password)
4. Sales account is created under their organization
5. Admin can manage the sales account (change password, delete)

### Super User Creating Admin Account
1. Super user logs in to their dashboard
2. Clicks "Create Agent" button
3. Selects "Admin" role from dropdown
4. Fills in admin details
5. Admin account is created with full privileges

## Security Features

- ✅ **Password validation** (minimum 6 characters)
- ✅ **Email uniqueness** checking
- ✅ **Role-based permissions** enforcement
- ✅ **Data isolation** between organizations
- ✅ **Hierarchical access control**
- ✅ **Audit trail** (created_by tracking)

## Benefits

1. **Organizational Structure**: Clear hierarchy with proper data separation
2. **Scalability**: Admins can grow their teams independently
3. **Security**: Each admin's data is completely isolated
4. **Flexibility**: Super users maintain system-wide control
5. **User Experience**: Intuitive interface for different user types

## Demo Credentials

### Super User
- **Email**: `super@travelcrm.com`
- **Password**: `super123`
- **Can create**: Admin and Sales accounts

### Admin User
- **Email**: `admin@travelcrm.com`
- **Password**: `admin123`
- **Can create**: Sales accounts only

### Sales User
- **Email**: `sales@travelcrm.com`
- **Password**: `sales123`
- **Can create**: No accounts (read-only access)
