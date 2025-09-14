export async function up(query, execute) {
  // Create import_logs table
  await execute(`
    CREATE TABLE IF NOT EXISTS import_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      import_type VARCHAR(50) NOT NULL,
      total_records INT NOT NULL DEFAULT 0,
      successful_imports INT NOT NULL DEFAULT 0,
      failed_imports INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_import_type (import_type),
      INDEX idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)

  console.log('✅ Created import_logs table')
}

export async function down(query, execute) {
  // Drop import_logs table
  await execute(`DROP TABLE IF EXISTS import_logs`)
  
  console.log('✅ Dropped import_logs table')
}
