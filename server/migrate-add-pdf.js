const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'literary-chat.db'));

console.log('📄 Adding PDF column to books table...');

try {
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(books)").all();
  const hasPdfColumn = tableInfo.some(col => col.name === 'pdf_file');
  
  if (hasPdfColumn) {
    console.log('✅ PDF column already exists');
  } else {
    // Add pdf_file column to books table
    db.exec(`
      ALTER TABLE books ADD COLUMN pdf_file TEXT;
    `);
    console.log('✅ PDF column added successfully');
  }
  
  // Verify the change
  const updatedTableInfo = db.prepare("PRAGMA table_info(books)").all();
  console.log('\nBooks table structure:');
  updatedTableInfo.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}`);
  });
  
  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}

db.close();
