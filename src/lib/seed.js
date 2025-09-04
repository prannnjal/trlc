import db from './database.js'
import { hashPassword } from './auth.js'

// Seed the database with initial data
export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...')
    
    // Check if users already exist
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get()
    if (existingUsers.count > 0) {
      console.log('✅ Database already seeded')
      return
    }
    
    // Create default users
    const users = [
      {
        name: 'Super Administrator',
        email: 'super@travelcrm.com',
        password: await hashPassword('super123'),
        role: 'super',
        permissions: JSON.stringify(['all', 'super_admin', 'system_config', 'user_management', 'data_export', 'api_access', 'audit_logs']),
        avatar: 'https://ui-avatars.com/api/?name=Super&background=dc2626&color=fff'
      },
      {
        name: 'Admin User',
        email: 'admin@travelcrm.com',
        password: await hashPassword('admin123'),
        role: 'admin',
        permissions: JSON.stringify(['all']),
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
      },
      {
        name: 'Sales User',
        email: 'sales@travelcrm.com',
        password: await hashPassword('sales123'),
        role: 'sales',
        permissions: JSON.stringify(['leads', 'quotes', 'bookings', 'reports']),
        avatar: 'https://ui-avatars.com/api/?name=Sales&background=10b981&color=fff'
      }
    ]
    
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role, permissions, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    for (const user of users) {
      insertUser.run(user.name, user.email, user.password, user.role, user.permissions, user.avatar)
    }
    
    console.log('✅ Users created')
    
    // Create sample customers
    const customers = [
      {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postal_code: '10001',
        date_of_birth: '1985-06-15',
        passport_number: 'US123456789',
        passport_expiry: '2030-06-15',
        emergency_contact_name: 'Jane Smith',
        emergency_contact_phone: '+1-555-0124',
        notes: 'Prefers window seats, vegetarian meals',
        created_by: 1
      },
      {
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@email.com',
        phone: '+1-555-0125',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        postal_code: '90210',
        date_of_birth: '1990-03-22',
        passport_number: 'US987654321',
        passport_expiry: '2029-03-22',
        emergency_contact_name: 'Carlos Garcia',
        emergency_contact_phone: '+1-555-0126',
        notes: 'Allergic to nuts, needs wheelchair assistance',
        created_by: 1
      },
      {
        first_name: 'David',
        last_name: 'Johnson',
        email: 'david.johnson@email.com',
        phone: '+1-555-0127',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        postal_code: '60601',
        date_of_birth: '1978-11-08',
        passport_number: 'US456789123',
        passport_expiry: '2031-11-08',
        emergency_contact_name: 'Sarah Johnson',
        emergency_contact_phone: '+1-555-0128',
        notes: 'Business traveler, frequent flyer',
        created_by: 2
      }
    ]
    
    const insertCustomer = db.prepare(`
      INSERT INTO customers (
        first_name, last_name, email, phone, address, city, state, country,
        postal_code, date_of_birth, passport_number, passport_expiry,
        emergency_contact_name, emergency_contact_phone, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const customer of customers) {
      insertCustomer.run(
        customer.first_name, customer.last_name, customer.email, customer.phone,
        customer.address, customer.city, customer.state, customer.country,
        customer.postal_code, customer.date_of_birth, customer.passport_number,
        customer.passport_expiry, customer.emergency_contact_name,
        customer.emergency_contact_phone, customer.notes, customer.created_by
      )
    }
    
    console.log('✅ Sample customers created')
    
    // Create sample leads
    const leads = [
      {
        customer_id: 1,
        source: 'New York',
        destination: 'Paris, France',
        travel_date: '2024-06-15',
        return_date: '2024-06-25',
        travelers_count: 2,
        budget_range: '$3000-$5000',
        status: 'qualified',
        priority: 'high',
        notes: 'Honeymoon trip, interested in luxury accommodations',
        assigned_to: 3,
        created_by: 1
      },
      {
        customer_id: 2,
        source: 'Los Angeles',
        destination: 'Tokyo, Japan',
        travel_date: '2024-07-10',
        return_date: '2024-07-20',
        travelers_count: 1,
        budget_range: '$2000-$3000',
        status: 'contacted',
        priority: 'medium',
        notes: 'Solo travel, interested in cultural experiences',
        assigned_to: 3,
        created_by: 2
      },
      {
        customer_id: 3,
        source: 'Chicago',
        destination: 'London, UK',
        travel_date: '2024-08-05',
        return_date: '2024-08-12',
        travelers_count: 1,
        budget_range: '$1500-$2500',
        status: 'new',
        priority: 'low',
        notes: 'Business trip, needs flexible dates',
        assigned_to: 3,
        created_by: 1
      }
    ]
    
    const insertLead = db.prepare(`
      INSERT INTO leads (
        customer_id, source, destination, travel_date, return_date,
        travelers_count, budget_range, status, priority, notes, assigned_to, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const lead of leads) {
      insertLead.run(
        lead.customer_id, lead.source, lead.destination, lead.travel_date,
        lead.return_date, lead.travelers_count, lead.budget_range,
        lead.status, lead.priority, lead.notes, lead.assigned_to, lead.created_by
      )
    }
    
    console.log('✅ Sample leads created')
    
    // Create sample quotes
    const quotes = [
      {
        lead_id: 1,
        customer_id: 1,
        quote_number: 'QT-20241201-001',
        title: 'Paris Honeymoon Package',
        description: '10-day luxury honeymoon package to Paris including flights, hotel, and activities',
        total_amount: 4500.00,
        currency: 'USD',
        valid_until: '2024-12-31',
        status: 'sent',
        terms_conditions: 'Valid for 30 days. 50% deposit required to confirm booking.',
        created_by: 3
      },
      {
        lead_id: 2,
        customer_id: 2,
        quote_number: 'QT-20241201-002',
        title: 'Tokyo Cultural Experience',
        description: '10-day cultural tour of Tokyo with traditional experiences',
        total_amount: 2800.00,
        currency: 'USD',
        valid_until: '2024-12-31',
        status: 'draft',
        terms_conditions: 'Valid for 30 days. 30% deposit required to confirm booking.',
        created_by: 3
      }
    ]
    
    const insertQuote = db.prepare(`
      INSERT INTO quotes (
        lead_id, customer_id, quote_number, title, description,
        total_amount, currency, valid_until, status, terms_conditions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    for (const quote of quotes) {
      insertQuote.run(
        quote.lead_id, quote.customer_id, quote.quote_number, quote.title,
        quote.description, quote.total_amount, quote.currency, quote.valid_until,
        quote.status, quote.terms_conditions, quote.created_by
      )
    }
    
    console.log('✅ Sample quotes created')
    
    // Create sample quote items
    const quoteItems = [
      // Paris package items
      { quote_id: 1, item_type: 'Flight', description: 'Round-trip flights NYC to Paris', quantity: 2, unit_price: 1200.00, total_price: 2400.00 },
      { quote_id: 1, item_type: 'Accommodation', description: '5-star hotel in Paris (8 nights)', quantity: 1, unit_price: 1500.00, total_price: 1500.00 },
      { quote_id: 1, item_type: 'Activities', description: 'City tour and Seine river cruise', quantity: 1, unit_price: 300.00, total_price: 300.00 },
      { quote_id: 1, item_type: 'Meals', description: 'Daily breakfast and 3 dinners', quantity: 1, unit_price: 300.00, total_price: 300.00 },
      
      // Tokyo package items
      { quote_id: 2, item_type: 'Flight', description: 'Round-trip flights LAX to Tokyo', quantity: 1, unit_price: 1000.00, total_price: 1000.00 },
      { quote_id: 2, item_type: 'Accommodation', description: 'Traditional ryokan (8 nights)', quantity: 1, unit_price: 1200.00, total_price: 1200.00 },
      { quote_id: 2, item_type: 'Activities', description: 'Cultural experiences and tours', quantity: 1, unit_price: 400.00, total_price: 400.00 },
      { quote_id: 2, item_type: 'Transportation', description: 'JR Pass for local travel', quantity: 1, unit_price: 200.00, total_price: 200.00 }
    ]
    
    const insertQuoteItem = db.prepare(`
      INSERT INTO quote_items (quote_id, item_type, description, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    for (const item of quoteItems) {
      insertQuoteItem.run(item.quote_id, item.item_type, item.description, item.quantity, item.unit_price, item.total_price)
    }
    
    console.log('✅ Sample quote items created')
    
    // Create sample booking
    const booking = {
      quote_id: 1,
      customer_id: 1,
      booking_number: 'BK-20241201-001',
      title: 'Paris Honeymoon Package',
      description: 'Confirmed booking for Paris honeymoon package',
      total_amount: 4500.00,
      currency: 'USD',
      deposit_amount: 2250.00,
      balance_amount: 2250.00,
      travel_date: '2024-06-15',
      return_date: '2024-06-25',
      status: 'confirmed',
      payment_status: 'partial',
      special_requests: 'Anniversary celebration, room upgrade requested',
      created_by: 3
    }
    
    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        quote_id, customer_id, booking_number, title, description,
        total_amount, currency, deposit_amount, balance_amount,
        travel_date, return_date, status, payment_status, special_requests, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertBooking.run(
      booking.quote_id, booking.customer_id, booking.booking_number, booking.title,
      booking.description, booking.total_amount, booking.currency, booking.deposit_amount,
      booking.balance_amount, booking.travel_date, booking.return_date, booking.status,
      booking.payment_status, booking.special_requests, booking.created_by
    )
    
    console.log('✅ Sample booking created')
    
    // Create sample payment
    const payment = {
      booking_id: 1,
      amount: 2250.00,
      currency: 'USD',
      payment_method: 'Credit Card',
      payment_date: '2024-12-01',
      reference_number: 'TXN-20241201-001',
      notes: 'Initial deposit payment',
      created_by: 3
    }
    
    const insertPayment = db.prepare(`
      INSERT INTO payments (
        booking_id, amount, currency, payment_method, payment_date, reference_number, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    insertPayment.run(
      payment.booking_id, payment.amount, payment.currency, payment.payment_method,
      payment.payment_date, payment.reference_number, payment.notes, payment.created_by
    )
    
    console.log('✅ Sample payment created')
    
    // Create sample activities
    const activities = [
      {
        entity_type: 'lead',
        entity_id: 1,
        activity_type: 'note',
        title: 'Initial contact made',
        description: 'Customer called to inquire about honeymoon packages to Paris',
        created_by: 3
      },
      {
        entity_type: 'lead',
        entity_id: 1,
        activity_type: 'status_change',
        title: 'Lead qualified',
        description: 'Customer has confirmed budget and travel dates',
        created_by: 3
      },
      {
        entity_type: 'quote',
        entity_id: 1,
        activity_type: 'created',
        title: 'Quote created',
        description: 'Detailed quote prepared for Paris honeymoon package',
        created_by: 3
      },
      {
        entity_type: 'quote',
        entity_id: 1,
        activity_type: 'sent',
        title: 'Quote sent to customer',
        description: 'Quote emailed to customer for review',
        created_by: 3
      },
      {
        entity_type: 'booking',
        entity_id: 1,
        activity_type: 'created',
        title: 'Booking confirmed',
        description: 'Customer accepted quote and booking was created',
        created_by: 3
      },
      {
        entity_type: 'booking',
        entity_id: 1,
        activity_type: 'payment',
        title: 'Deposit received',
        description: 'Initial deposit of $2,250 received via credit card',
        created_by: 3
      }
    ]
    
    const insertActivity = db.prepare(`
      INSERT INTO activities (entity_type, entity_id, activity_type, title, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    for (const activity of activities) {
      insertActivity.run(
        activity.entity_type, activity.entity_id, activity.activity_type,
        activity.title, activity.description, activity.created_by
      )
    }
    
    console.log('✅ Sample activities created')
    
    // Create system settings
    const settings = [
      { key: 'company_name', value: 'Travel CRM', description: 'Company name' },
      { key: 'company_email', value: 'info@travelcrm.com', description: 'Company email' },
      { key: 'company_phone', value: '+1-555-TRAVEL', description: 'Company phone' },
      { key: 'default_currency', value: 'USD', description: 'Default currency' },
      { key: 'quote_validity_days', value: '30', description: 'Default quote validity in days' },
      { key: 'deposit_percentage', value: '50', description: 'Default deposit percentage' }
    ]
    
    const insertSetting = db.prepare(`
      INSERT INTO settings (key, value, description, updated_by)
      VALUES (?, ?, ?, ?)
    `)
    
    for (const setting of settings) {
      insertSetting.run(setting.key, setting.value, setting.description, 1)
    }
    
    console.log('✅ System settings created')
    console.log('🎉 Database seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}
