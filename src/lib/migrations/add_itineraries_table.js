const { connectDB } = require('../mysql')

async function addItinerariesTable() {
  let connection
  
  try {
    connection = await connectDB()
    
    // Create itineraries table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        trip_name VARCHAR(255),
        destination VARCHAR(255),
        start_date DATE,
        end_date DATE,
        duration INT DEFAULT 0,
        nights INT DEFAULT 0,
        travelers INT DEFAULT 1,
        adults INT DEFAULT 1,
        children INT DEFAULT 0,
        hotels JSON,
        activities JSON,
        transportation JSON,
        total_cost DECIMAL(10,2) DEFAULT 0,
        cost_breakdown JSON,
        special_requests TEXT,
        notes TEXT,
        status ENUM('draft', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        INDEX idx_lead_id (lead_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('✅ Itineraries table created successfully')
    
  } catch (error) {
    console.error('❌ Error creating itineraries table:', error)
    throw error
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  addItinerariesTable()
    .then(() => {
      console.log('Migration completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration failed:', error)
      process.exit(1)
    })
}

module.exports = { addItinerariesTable }
