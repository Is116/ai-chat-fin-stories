const db = require('./database');
const bcrypt = require('bcryptjs');

// Seed initial admin user (username: admin, password: admin123)
const seedAdmin = () => {
  const checkAdmin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
  
  if (!checkAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const insert = db.prepare('INSERT INTO admins (username, password, email) VALUES (?, ?, ?)');
    insert.run('admin', hashedPassword, 'admin@literarychat.com');
    console.log('Default admin user created: username=admin, password=admin123');
  }
};

// Seed admin user in users table (for role-based access)
const seedAdminUser = () => {
  const checkAdminUser = db.prepare('SELECT * FROM users WHERE email = ?').get('superadmin@literarychat.com');
  
  if (!checkAdminUser) {
    const hashedPassword = bcrypt.hashSync('SuperAdmin123!', 10);
    const insert = db.prepare('INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)');
    insert.run('superadmin', 'superadmin@literarychat.com', hashedPassword, 'Super Administrator', 'admin');
    console.log('Admin user created in users table: username=superadmin, password=SuperAdmin123!, role=admin');
  }
};

// Seed initial characters from existing data
const seedCharacters = () => {
  const count = db.prepare('SELECT COUNT(*) as count FROM characters').get();
  
  if (count.count === 0) {
    console.log('Character seeding skipped - please add characters via admin panel after creating books');
    // Note: Characters now require book_id (foreign key to books table)
    // Add characters manually through the admin panel after books are created
  }
};

// Run seeds
seedAdmin();
seedAdminUser();
seedCharacters();

console.log('Database initialization complete');
