const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'literary-chat.db'));

console.log('🔄 Adding adminuser to admins table...');

try {
  // Check if adminuser already exists in admins table
  const existingAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('adminuser');
  
  if (existingAdmin) {
    console.log('⚠️  adminuser already exists in admins table');
  } else {
    // Get the password from users table
    const userRecord = db.prepare('SELECT password FROM users WHERE username = ?').get('adminuser');
    
    if (!userRecord) {
      console.log('❌ adminuser not found in users table');
      process.exit(1);
    }

    // Insert adminuser into admins table with the same password hash
    const insert = db.prepare('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)');
    insert.run('adminuser', userRecord.password, 'adminuser@literarychat.com');
    
    console.log('✅ Successfully added adminuser to admins table');
    console.log('📧 Email: adminuser@literarychat.com');
    console.log('👤 Username: adminuser');
    console.log('🔑 Password: (same as in users table)');
  }

  // Display all admins
  const admins = db.prepare('SELECT id, username, email FROM admins').all();
  console.log('\n📊 Current admin accounts:');
  console.table(admins);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

db.close();
