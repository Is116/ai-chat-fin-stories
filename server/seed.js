const prisma = require('./database');
const bcrypt = require('bcryptjs');

// Seed initial admin user (username: admin, password: admin123)
const seedAdmin = async () => {
  const checkAdmin = await prisma.admin.findUnique({
    where: { username: 'admin' }
  });
  
  if (!checkAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await prisma.admin.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@literarychat.com'
      }
    });
    console.log('Default admin user created: username=admin, password=admin123');
  } else {
    console.log('ℹAdmin user already exists');
  }
};

// Seed admin user in users table (for role-based access)
const seedAdminUser = async () => {
  const checkAdminUser = await prisma.user.findUnique({
    where: { email: 'superadmin@literarychat.com' }
  });
  
  if (!checkAdminUser) {
    const hashedPassword = bcrypt.hashSync('SuperAdmin123!', 10);
    await prisma.user.create({
      data: {
        username: 'superadmin',
        email: 'superadmin@literarychat.com',
        password: hashedPassword,
        fullName: 'Super Administrator'
      }
    });
    console.log('Admin user created: username=superadmin, password=SuperAdmin123!');
  } else {
    console.log('ℹSuper admin user already exists');
  }
};

// Seed initial characters from existing data
const seedCharacters = async () => {
  const count = await prisma.character.count();
  
  if (count === 0) {
    console.log('ℹNo characters found - please add characters via admin panel after creating books');
    // Note: Characters now require book_id (foreign key to books table)
    // Add characters manually through the admin panel after books are created
  } else {
    console.log(`ℹFound ${count} existing characters`);
  }
};

// Run seeds
async function main() {
  try {
    await seedAdmin();
    await seedAdminUser();
    await seedCharacters();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
