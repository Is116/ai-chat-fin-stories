const bcrypt = require('bcryptjs');
const db = require('./database');

const username = 'adminuser';
const newPassword = 'Admin@123';

console.log('🔄 Resetting password for adminuser...\n');

try {
  // Check if admin exists
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  
  if (!admin) {
    console.log('❌ Admin user not found');
    process.exit(1);
  }

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  // Update password in admins table
  db.prepare('UPDATE admins SET password = ? WHERE username = ?').run(hashedPassword, username);
  console.log('✅ Password updated in admins table');

  // Also update in users table if exists
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (user) {
    db.prepare('UPDATE users SET password = ? WHERE username = ?').run(hashedPassword, username);
    console.log('✅ Password updated in users table');
  }

  console.log('\n🎉 Password reset successful!\n');
  console.log('📧 Email: adminuser@literarychat.com');
  console.log('👤 Username: adminuser');
  console.log('🔑 New Password: Admin@123');
  console.log('\n💡 You can now login with either username or email!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

db.close();
