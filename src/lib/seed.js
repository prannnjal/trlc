const { query, execute } = require('./mysql.js')
const { hashPassword } = require('./auth.js')

// Seed the database with initial data
const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...')
    
    // Check if users already exist
    const existingUsers = await query('SELECT COUNT(*) as count FROM users')
    if (existingUsers[0].count > 0) {
      console.log('✅ Database already seeded')
      return
    }
    
    // Create default users
    const users = [
      {
        name: 'Super Administrator',
        email: 'super@travelcrm.com',
        password: 'super123',
        role: 'super',
        permissions: ['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs']
      },
      {
        name: 'Admin User 1',
        email: 'admin1@travelcrm.com',
        password: 'admin123',
        role: 'admin',
        permissions: ['leads', 'quotes', 'bookings', 'reports', 'user_management'],
        created_by: 1
      },
      {
        name: 'Admin User 2',
        email: 'admin2@travelcrm.com',
        password: 'admin123',
        role: 'admin',
        permissions: ['leads', 'quotes', 'bookings', 'reports', 'user_management'],
        created_by: 1
      },
      {
        name: 'Caller User 1',
        email: 'caller1@travelcrm.com',
        password: 'caller123',
        role: 'caller',
        permissions: ['leads', 'quotes', 'bookings'],
        created_by: 2
      },
      {
        name: 'Caller User 2',
        email: 'caller2@travelcrm.com',
        password: 'caller123',
        role: 'caller',
        permissions: ['leads', 'quotes', 'bookings'],
        created_by: 2
      },
      {
        name: 'Caller User 3',
        email: 'caller3@travelcrm.com',
        password: 'caller123',
        role: 'caller',
        permissions: ['leads', 'quotes', 'bookings'],
        created_by: 3
      }
    ]
    
    // Insert users
    for (const user of users) {
      const hashedPassword = await hashPassword(user.password)
      await execute(`
        INSERT INTO users (name, email, password, role, permissions, avatar, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user.name,
        user.email,
        hashedPassword,
        user.role,
        JSON.stringify(user.permissions),
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${user.role === 'super' ? 'dc2626' : user.role === 'admin' ? '3b82f6' : '10b981'}&color=fff`,
        user.created_by || null
      ])
    }
    
    // Create sample customers
    const customers = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
        created_by: 1
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0124',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postal_code: '90210',
        created_by: 2
      },
      {
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0125',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postal_code: '60601',
        created_by: 3
      }
    ]
    
    for (const customer of customers) {
      await execute(`
        INSERT INTO customers (first_name, last_name, email, phone, address, city, state, country, postal_code, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customer.first_name,
        customer.last_name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
        customer.country,
        customer.postal_code,
        customer.created_by
      ])
    }
    
    // Create sample leads
    const leads = [
      {
        customer_id: 1,
        source: 'Website',
        destination: 'Paris, France',
        travel_date: '2024-06-15',
        return_date: '2024-06-22',
        travelers_count: 2,
        budget_range: '$3000-$5000',
        status: 'new',
        priority: 'high',
        notes: 'Honeymoon trip',
        assigned_to: 4,
        created_by: 1
      },
      {
        customer_id: 2,
        source: 'Referral',
        destination: 'Tokyo, Japan',
        travel_date: '2024-07-10',
        return_date: '2024-07-20',
        travelers_count: 1,
        budget_range: '$2000-$4000',
        status: 'contacted',
        priority: 'medium',
        notes: 'Business trip',
        assigned_to: 5,
        created_by: 2
      },
      {
        customer_id: 3,
        source: 'Social Media',
        destination: 'Barcelona, Spain',
        travel_date: '2024-08-05',
        return_date: '2024-08-12',
        travelers_count: 4,
        budget_range: '$4000-$6000',
        status: 'qualified',
        priority: 'medium',
        notes: 'Family vacation',
        assigned_to: 6,
        created_by: 3
      }
    ]
    
    for (const lead of leads) {
      await execute(`
        INSERT INTO leads (customer_id, source, destination, travel_date, return_date, travelers_count, budget_range, status, priority, notes, assigned_to, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lead.customer_id,
        lead.source,
        lead.destination,
        lead.travel_date,
        lead.return_date,
        lead.travelers_count,
        lead.budget_range,
        lead.status,
        lead.priority,
        lead.notes,
        lead.assigned_to,
        lead.created_by
      ])
    }
    
    // Create sample quotes
    const quotes = [
      {
        lead_id: 1,
        customer_id: 1,
        title: 'Paris Honeymoon Package',
        description: '7-day romantic getaway to Paris including flights, hotel, and city tours',
        total_amount: 4500.00,
        currency: 'USD',
        valid_until: '2024-05-15',
        status: 'sent',
        created_by: 1
      },
      {
        lead_id: 2,
        customer_id: 2,
        title: 'Tokyo Business Trip',
        description: '10-day business trip to Tokyo with hotel and local transportation',
        total_amount: 3200.00,
        currency: 'USD',
        valid_until: '2024-06-10',
        status: 'draft',
        created_by: 2
      },
      {
        lead_id: 3,
        customer_id: 3,
        title: 'Barcelona Family Vacation',
        description: '7-day family vacation to Barcelona with flights, hotel, and activities',
        total_amount: 5200.00,
        currency: 'USD',
        valid_until: '2024-07-05',
        status: 'accepted',
        created_by: 3
      }
    ]
    
    for (const quote of quotes) {
      await execute(`
        INSERT INTO quotes (lead_id, customer_id, title, description, total_amount, currency, valid_until, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        quote.lead_id,
        quote.customer_id,
        quote.title,
        quote.description,
        quote.total_amount,
        quote.currency,
        quote.valid_until,
        quote.status,
        quote.created_by
      ])
    }
    
    // Create sample bookings
    const bookings = [
      {
        customer_id: 1,
        quote_id: 1,
        destination: 'Paris, France',
        departure_date: '2024-06-15',
        return_date: '2024-06-22',
        travelers_count: 2,
        total_amount: 4500.00,
        status: 'confirmed',
        notes: 'Honeymoon booking confirmed',
        created_by: 1
      },
      {
        customer_id: 3,
        quote_id: 3,
        destination: 'Barcelona, Spain',
        departure_date: '2024-08-05',
        return_date: '2024-08-12',
        travelers_count: 4,
        total_amount: 5200.00,
        status: 'confirmed',
        notes: 'Family vacation booking confirmed',
        created_by: 3
      }
    ]
    
    for (const booking of bookings) {
      await execute(`
        INSERT INTO bookings (customer_id, quote_id, destination, departure_date, return_date, travelers_count, total_amount, status, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        booking.customer_id,
        booking.quote_id,
        booking.destination,
        booking.departure_date,
        booking.return_date,
        booking.travelers_count,
        booking.total_amount,
        booking.status,
        booking.notes,
        booking.created_by
      ])
    }
    
    // Create sample payments
    const payments = [
      {
        booking_id: 1,
        amount: 2250.00,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'completed',
        transaction_id: 'TXN-001',
        payment_date: '2024-04-15',
        notes: '50% deposit payment',
        created_by: 1
      },
      {
        booking_id: 1,
        amount: 2250.00,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'completed',
        transaction_id: 'TXN-002',
        payment_date: '2024-05-15',
        notes: 'Final payment',
        created_by: 1
      },
      {
        booking_id: 2,
        amount: 2600.00,
        currency: 'USD',
        payment_method: 'bank_transfer',
        status: 'completed',
        transaction_id: 'TXN-003',
        payment_date: '2024-07-05',
        notes: '50% deposit payment',
        created_by: 3
      }
    ]
    
    for (const payment of payments) {
      await execute(`
        INSERT INTO payments (booking_id, amount, currency, payment_method, status, transaction_id, payment_date, notes, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        payment.booking_id,
        payment.amount,
        payment.currency,
        payment.payment_method,
        payment.status,
        payment.transaction_id,
        payment.payment_date,
        payment.notes,
        payment.created_by
      ])
    }
    
    // Create sample activities
    const activities = [
      {
        type: 'call',
        subject: 'Initial consultation call',
        description: 'Called customer to discuss travel preferences and requirements',
        related_type: 'lead',
        related_id: 1,
        due_date: '2024-04-10',
        completed_at: '2024-04-10',
        created_by: 4
      },
      {
        type: 'email',
        subject: 'Quote sent to customer',
        description: 'Sent detailed quote for Paris honeymoon package',
        related_type: 'quote',
        related_id: 1,
        due_date: '2024-04-12',
        completed_at: '2024-04-12',
        created_by: 1
      },
      {
        type: 'meeting',
        subject: 'Customer meeting',
        description: 'Met with customer to discuss Barcelona family vacation',
        related_type: 'lead',
        related_id: 3,
        due_date: '2024-04-15',
        completed_at: '2024-04-15',
        created_by: 6
      }
    ]
    
    for (const activity of activities) {
      await execute(`
        INSERT INTO activities (type, subject, description, related_type, related_id, due_date, completed_at, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        activity.type,
        activity.subject,
        activity.description,
        activity.related_type,
        activity.related_id,
        activity.due_date,
        activity.completed_at,
        activity.created_by
      ])
    }
    
    // Create default settings
    const settings = [
      {
        key: 'company_name',
        value: 'Travel CRM',
        type: 'string',
        description: 'Company name'
      },
      {
        key: 'company_email',
        value: 'info@travelcrm.com',
        type: 'string',
        description: 'Company email address'
      },
      {
        key: 'company_phone',
        value: '+1-555-0123',
        type: 'string',
        description: 'Company phone number'
      },
      {
        key: 'default_currency',
        value: 'USD',
        type: 'string',
        description: 'Default currency for quotes and payments'
      },
      {
        key: 'quote_validity_days',
        value: '30',
        type: 'number',
        description: 'Default quote validity in days'
      },
      {
        key: 'lead_auto_assignment',
        value: 'true',
        type: 'boolean',
        description: 'Automatically assign new leads to available callers'
      }
    ]
    
    for (const setting of settings) {
      await execute(`
        INSERT INTO settings (key, value, type, description)
        VALUES (?, ?, ?, ?)
      `, [
        setting.key,
        setting.value,
        setting.type,
        setting.description
      ])
    }
    
    console.log('✅ Database seeded successfully')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

module.exports = { seedDatabase }