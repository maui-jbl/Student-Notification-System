const pool = require('./src/config/db');

async function runMigration() {
  try {
    // Check if columns already exist
    const [columns] = await pool.query("SHOW COLUMNS FROM users LIKE 'first_name'");
    if (columns.length > 0) {
      console.log('Columns already updated');
      return;
    }
    
    // Add new columns
    await pool.query("ALTER TABLE users ADD COLUMN first_name VARCHAR(50) NOT NULL DEFAULT ''");
    await pool.query("ALTER TABLE users ADD COLUMN last_name VARCHAR(50) NOT NULL DEFAULT ''");
    await pool.query("ALTER TABLE users ADD COLUMN middle_initial VARCHAR(10) NULL");
    
    // Migrate existing data (assuming name format is "First Last")
    await pool.query(`UPDATE users SET 
      first_name = CASE WHEN name IS NOT NULL AND name != '' THEN SUBSTRING_INDEX(name, ' ', 1) ELSE '' END,
      last_name = CASE WHEN name IS NOT NULL AND name != '' THEN CASE WHEN name LIKE '% %' THEN SUBSTRING_INDEX(name, ' ', -1) ELSE name END ELSE '' END
    `);
    
    // Set proper values for seeded accounts
    await pool.query("UPDATE users SET first_name='Admin', last_name='User', middle_initial=NULL WHERE email='admin@school.com'");
    await pool.query("UPDATE users SET first_name='Teacher', last_name='One', middle_initial=NULL WHERE email='teacher1@school.com'");
    await pool.query("UPDATE users SET first_name='Student', last_name='One', middle_initial=NULL WHERE email='student1@school.com'");
    await pool.query("UPDATE users SET first_name='Student', last_name='Two', middle_initial=NULL WHERE email='student2@school.com'");
    
    // Remove old column
    await pool.query("ALTER TABLE users DROP COLUMN name");
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();