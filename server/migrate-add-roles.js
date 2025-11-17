const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'literary-chat.db'));

console.log('Starting database migration: Adding role column to users table...');

try {
  // Check if role column already exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const roleColumnExists = tableInfo.some(col => col.name === 'role');

  if (roleColumnExists) {
    console.log('Role column already exists in users table');
  } else {
    // Add role column with default value 'user'
    db.exec(`
      ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' NOT NULL
    `);
    console.log('Successfully added role column to users table');
  }

  // Update any existing users to have 'user' role if null
  const updateResult = db.prepare(`
    UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''
  `).run();
  
  if (updateResult.changes > 0) {
    console.log(`Updated ${updateResult.changes} existing users with 'user' role`);
  }

  // Display current users with their roles
  const users = db.prepare('SELECT id, username, email, role FROM users').all();
  console.log('\n Current users and their roles:');
  console.table(users);

  console.log('\n Migration completed successfully!');
  console.log('\n Available roles:');
  console.log('   - user: Regular user (default)');
  console.log('   - moderator: Can moderate content');
  console.log('   - admin: Full administrative access');

} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}

db.close();
