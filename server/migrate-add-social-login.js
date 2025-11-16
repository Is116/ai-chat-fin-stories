const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'literary-chat.db');
const db = new Database(dbPath);

console.log('🔧 Starting social login migration...');

try {
  // Add social login fields to users table
  const alterations = [
    'ALTER TABLE users ADD COLUMN google_id TEXT',
    'ALTER TABLE users ADD COLUMN facebook_id TEXT',
    'ALTER TABLE users ADD COLUMN github_id TEXT',
    'ALTER TABLE users ADD COLUMN provider TEXT DEFAULT "local"',
    'ALTER TABLE users ADD COLUMN profile_photo TEXT',
    'ALTER TABLE users ADD COLUMN email TEXT'
  ];

  alterations.forEach((sql, index) => {
    try {
      db.exec(sql);
      console.log(`✅ Added column ${index + 1}/6`);
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log(`⚠️  Column ${index + 1}/6 already exists, skipping`);
      } else {
        throw error;
      }
    }
  });

  // Create indexes for social IDs for faster lookups
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id)',
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
  ];

  indexes.forEach((sql, index) => {
    db.exec(sql);
    console.log(`✅ Created index ${index + 1}/4`);
  });

  // Update existing users to have 'local' provider if null
  db.exec("UPDATE users SET provider = 'local' WHERE provider IS NULL");
  console.log('✅ Updated existing users with local provider');

  console.log('✅ Social login migration completed successfully!');
  console.log('\n📋 New fields added to users table:');
  console.log('   - google_id: TEXT');
  console.log('   - facebook_id: TEXT');
  console.log('   - github_id: TEXT');
  console.log('   - provider: TEXT (local/google/facebook/github)');
  console.log('   - profile_photo: TEXT');
  console.log('   - email: TEXT');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
