const pool = require('./src/config/db');

async function runMigration() {
  try {
    const [columns] = await pool.query("SHOW COLUMNS FROM notifications LIKE 'status'");
    const currentType = columns[0]?.Type || '';

    if (currentType.includes('cancelled') && currentType.includes('pending')) {
      console.log('Status ENUM already updated');
      return;
    }

    await pool.query("ALTER TABLE notifications MODIFY COLUMN status ENUM('pending','scheduled','sent','delivered','cancelled') DEFAULT 'pending'");
    console.log('Notification status ENUM updated successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    process.exit(0);
  }
}

runMigration();
