const db = require('./database');

console.log('Adding language column to books table...');

try {
  // Add language column
  db.exec(`
    ALTER TABLE books ADD COLUMN language TEXT DEFAULT 'English';
  `);
  
  console.log('Migration completed successfully!');
  console.log('   - Added "language" column to books table');
  
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('ℹColumn already exists, skipping migration');
  } else {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

process.exit(0);
