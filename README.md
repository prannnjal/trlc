# Travel CRM - Complete Travel Agency Management System

A comprehensive Customer Relationship Management (CRM) software built specifically for travel agencies, tour operators, and Destination Management Companies (DMCs) using Next.js and JavaScript.

## 🚀 Features

### 2.1 Sales & Lead Management
- **Lead/Query Intake**: Capture enquiries from multiple channels (web, email, social media, call)
- **Lifecycle Management**: Manage leads through stages: New → In Progress → Converted → On Trip → Cancelled
- **Follow-ups & Reminders**: Automated notifications for pending leads, payments, or conversions
- **Quote Generation**: Efficient quote creation, sharing, and automated conversion to bookings

### 2.2 Booking & Itinerary Management
- **Itinerary Builder**: Visually appealing, template-based itinerary creation (~60 seconds)
- **Export Options**: PDF/Word export and sharing via email or WhatsApp
- **Hotel Booking Tracking**: Manage booking status across stages (Initialized, In Progress, Changed, Booked, Dropped)
- **Voucher Generation**: Automated voucher creation for confirmed bookings
- **Cab/Transport Scheduling**: Assign transport services with team visibility

### 2.3 Accounting & Payments
- **Two-way Ledger**: Track receivables (payments due) and payables (to suppliers)
- **Proforma Invoicing**: Generate professional invoices with automated calculations
- **Payment Tracking**: Monitor payment statuses with automated follow-up notifications
- **Markup & Taxation**: Automated costing, markups (percentage or absolute), and tax calculations

### 2.4 Supplier Management
- **Contracts & Suppliers**: Manage supplier relationships, contracts, and costing details
- **Performance Tracking**: Monitor supplier performance and reliability

### 2.5 Reporting & Analytics
- **Dashboard & KPIs**: Key metrics including revenue vs targets, payment status, active tours, conversion rates
- **Automated Reports**: Generate sales, payment, and booking summaries
- **Data Consolidation**: Unified repository for customer data, interactions, bookings, payments, and supplier information

### 2.6 Organization Settings & Administration
- **Multi-user & Role Management**: User roles (super, admin, sales, ops, accounts) with permission control
- **Team Management**: Manage teams, branding, and organization profile
- **Branding Customization**: Customize the system with your organization's branding

### 2.7 API & Integrations
- **API Access**: Authentication endpoints and data exchange capabilities
- **External Integrations**: Support for websites, ad platforms, accounting tools

### 2.8 🚀 Super User Features (NEW!)
- **System Monitoring**: Real-time system health, uptime, and performance metrics
- **Enhanced Security**: Advanced user management and permission controls
- **Data Management**: Comprehensive data export, backup, and audit capabilities
- **System Configuration**: Advanced system settings and integration management
- **Audit Logs**: Complete system activity tracking and security monitoring

## 🎯 User Roles & Permissions

| Role | Access Rights | Special Features |
|------|---------------|------------------|
| **🚀 Super User** | Full system access + Super admin privileges | System monitoring, Enhanced security, Data management, Audit logs |
| **👑 Admin** | Full system configuration, user management, analytics, integrations | Standard admin capabilities |
| **💼 Sales** | Manage leads/queries, quotes, follow-ups, bookings | Sales-focused operations |
| **🏗️ Operations** | Handle itinerary building, hotel/cab booking, vouchers | Operational tasks |
| **💰 Accounting** | Manage transactions, invoicing, payment reminders, receivables/payables | Financial operations |
| **📊 Reporting** | Access dashboard, generate reports | Data analysis and reporting |

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, JavaScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Heroicons, Lucide React
- **Forms**: React Hook Form
- **State Management**: Zustand
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Credentials

### 🚀 Super User Access
- **Email**: `super@travelcrm.com`
- **Password**: `super123`
- **Permissions**: Full system access + Super admin privileges
- **Features**: System monitoring, Enhanced security, Data management, Audit logs

### 👑 Admin Access
- **Email**: `admin@travelcrm.com`
- **Password**: `admin123`
- **Permissions**: Full system access
- **Features**: Standard admin capabilities

### 💼 Sales Access
- **Email**: `sales@travelcrm.com`
- **Password**: `sales123`
- **Permissions**: Leads, quotes, bookings, reports
- **Features**: Sales-focused operations

## 📱 Sample Workflow: From Lead to Trip

1. **Lead Capture** → Enter query from website/social
2. **Quote Generation** → Create and send quote swiftly
3. **Follow-up** → System sends reminders for unpaid or unconverted quotes
4. **Booking** → On confirmation, quote auto-converts to booking
5. **Itinerary & Supplier Booking** → Build itinerary; finalize hotel/cab bookings
6. **Accounting** → Invoice created; payment reminders sent; mark received
7. **Reporting** → Metrics updated in dashboard; periodic reports generated

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── leads/            # Leads management
│   ├── globals.css       # Global styles
│   ├── layout.js         # Root layout
│   └── page.js           # Home/login page
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── layout/           # Layout components
│   ├── leads/            # Lead management components
│   └── ui/               # UI components
└── contexts/             # React contexts
    ├── AuthContext.js    # Authentication context
    └── SidebarContext.js # Sidebar navigation context
```

## 🎨 Key Components

- **DashboardLayout**: Main application layout with sidebar navigation
- **Sidebar**: Navigation menu with role-based access control
- **DashboardOverview**: KPI cards, charts, and recent activity
- **SuperUserDashboard**: Enhanced dashboard for super users with system monitoring
- **LeadsTable**: Sortable and filterable leads table
- **LeadFilters**: Advanced filtering and search functionality
- **CreateLeadModal**: Form for adding new leads

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌟 Key Features Implemented

- ✅ **Authentication System** with role-based access control
- ✅ **🚀 Super User System** with enhanced privileges and system monitoring
- ✅ **Responsive Dashboard** with KPI metrics and charts
- ✅ **Lead Management** with filtering, sorting, and CRUD operations
- ✅ **Modern UI/UX** with Tailwind CSS and smooth animations
- ✅ **Mobile Responsive** design for all screen sizes
- ✅ **Real-time Search** and filtering capabilities
- ✅ **Status Management** for leads and bookings
- ✅ **Permission System** based on user roles
- ✅ **Enhanced Navigation** with super user specific features

## 🚧 Upcoming Features

- [ ] **Itinerary Builder** with drag-and-drop interface
- [ ] **Quote Generation** system with templates
- [ ] **Booking Management** with status tracking
- [ ] **Accounting Module** with invoicing and payment tracking
- [ ] **Supplier Management** system
- [ ] **Advanced Reporting** with export capabilities
- [ ] **Email Integration** for automated communications
- [ ] **API Endpoints** for external integrations
- [ ] **Real-time Notifications** for system alerts
- [ ] **Advanced Security** features for super users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for the travel industry**

**🚀 Now with Super User capabilities for enterprise-level management!**
#   t r l c  
 