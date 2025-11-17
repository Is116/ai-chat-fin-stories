const bcrypt = require('bcryptjs');
const db = require('./database');

console.log('Testing passwords for adminuser account...\n');

// Get the password hash from database
const admin = db.prepare('SELECT username, email, password FROM admins WHERE username = ?').get('adminuser');

if (!admin) {
  console.log('adminuser not found in admins table');
  process.exit(1);
}

console.log('Found admin account:');
console.log('Username:', admin.username);
console.log('Email:', admin.email);
console.log('Password Hash:', admin.password.substring(0, 20) + '...\n');

// Test common passwords
const testPasswords = [
  'admin123',
  'adminuser',
  'Admin123',
  'password',
  'Admin@123',
  'Adminuser123',
  'adminuser123'
];

console.log('Testing common passwords:\n');

let foundPassword = null;

for (const pwd of testPasswords) {
  const isMatch = bcrypt.compareSync(pwd, admin.password);
  if (isMatch) {
    console.log(`MATCH FOUND! Password is: "${pwd}"`);
    foundPassword = pwd;
    break;
  } else {
    console.log(`"${pwd}" - No match`);
  }
}

if (!foundPassword) {
  console.log('\n Password not found in common passwords list.');
  console.log('The password was likely set manually when the account was created.');
  console.log('\n Options:');
  console.log('   1. Try to remember the password used when creating the account');
  console.log('   2. Reset the password (I can help with this)');
  console.log('   3. Use the default admin account (username: admin, password: admin123)');
} else {
  console.log(`\n You can now login with:`);
  console.log(`   Username: adminuser (or email: ${admin.email})`);
  console.log(`   Password: ${foundPassword}`);
}

db.close();
