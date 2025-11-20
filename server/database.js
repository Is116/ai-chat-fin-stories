const { PrismaClient } = require('@prisma/client');

// PrismaClient singleton to avoid multiple instances
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Initialize database (run migrations if needed)
async function initializeDatabase() {
  try {
    // Test the connection
    await prisma.$connect();
    console.log('Prisma database connection established');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Initialize on module load
initializeDatabase();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
