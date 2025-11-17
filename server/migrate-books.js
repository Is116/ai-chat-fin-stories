const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'literary-chat.db'));
db.pragma('foreign_keys = ON');

console.log('Starting database migration to add books table...\n');

try {
  // Step 1: Check if books table exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='books'
  `).get();

  if (!tableExists) {
    console.log('Creating books table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT,
        cover_image TEXT,
        published_year INTEGER,
        genre TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Books table created\n');
  } else {
    console.log('Books table already exists\n');
  }

  // Step 2: Get existing characters
  console.log('Extracting books from existing characters...');
  const characters = db.prepare('SELECT * FROM characters').all();
  
  if (characters.length > 0) {
    // Extract unique books
    const booksMap = new Map();
    characters.forEach(char => {
      const key = `${char.book}|${char.author}`;
      if (!booksMap.has(key)) {
        booksMap.set(key, {
          title: char.book,
          author: char.author,
          description: `The literary world of ${char.book}`,
          genre: 'Classic Literature'
        });
      }
    });

    console.log(`   Found ${booksMap.size} unique books\n`);

    // Step 3: Insert books
    console.log('Inserting books...');
    const insertBook = db.prepare(`
      INSERT INTO books (title, author, description, genre)
      VALUES (?, ?, ?, ?)
    `);

    const bookIdMap = new Map();
    for (const [key, book] of booksMap.entries()) {
      const result = insertBook.run(book.title, book.author, book.description, book.genre);
      bookIdMap.set(key, result.lastInsertRowid);
      console.log(`   ✓ "${book.title}" by ${book.author} (ID: ${result.lastInsertRowid})`);
    }
    console.log('Books inserted\n');

    // Step 4: Check if characters table needs migration
    const tableInfo = db.prepare('PRAGMA table_info(characters)').all();
    const hasBookId = tableInfo.some(col => col.name === 'book_id');
    const hasBookColumn = tableInfo.some(col => col.name === 'book');

    if (!hasBookId && hasBookColumn) {
      console.log('Migrating characters table...');
      
      // Create new characters table with book_id
      db.exec(`
        CREATE TABLE characters_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          book_id INTEGER NOT NULL,
          personality TEXT NOT NULL,
          avatar TEXT,
          image TEXT,
          color TEXT NOT NULL,
          greeting TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
      `);

      // Copy data with book_id mapping
      const insertChar = db.prepare(`
        INSERT INTO characters_new (id, name, book_id, personality, avatar, image, color, greeting, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      characters.forEach(char => {
        const key = `${char.book}|${char.author}`;
        const bookId = bookIdMap.get(key);
        insertChar.run(
          char.id,
          char.name,
          bookId,
          char.personality,
          char.avatar,
          char.image,
          char.color,
          char.greeting,
          char.created_at,
          char.updated_at
        );
        console.log(`   ✓ Migrated "${char.name}" to book ID ${bookId}`);
      });

      // Drop old table and rename new one
      db.exec(`DROP TABLE characters`);
      db.exec(`ALTER TABLE characters_new RENAME TO characters`);
      
      console.log('Characters table migrated\n');
    } else if (hasBookId) {
      console.log('Characters table already has book_id column\n');
    }
  } else {
    console.log('No existing characters found, skipping migration\n');
  }

  console.log('Migration completed successfully!\n');

} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}

db.close();
