/**
 * Database Migration: Add AI Processing Tables
 * Run this to add tables for AI-powered book processing
 */

const db = require('./database');

async function migrate() {
  try {
    console.log('Creating AI processing tables...');

    // Add processing columns to books table
    try {
      db.exec(`ALTER TABLE books ADD COLUMN processing_status TEXT DEFAULT 'pending'`);
      console.log('✅ Added processing_status column');
    } catch (e) {
      console.log('Column processing_status already exists');
    }

    try {
      db.exec(`ALTER TABLE books ADD COLUMN total_chunks INTEGER DEFAULT 0`);
      console.log('✅ Added total_chunks column');
    } catch (e) {
      console.log('Column total_chunks already exists');
    }

    try {
      db.exec(`ALTER TABLE books ADD COLUMN characters_extracted INTEGER DEFAULT 0`);
      console.log('✅ Added characters_extracted column');
    } catch (e) {
      console.log('Column characters_extracted already exists');
    }

    try {
      db.exec(`ALTER TABLE books ADD COLUMN processed_at TIMESTAMP`);
      console.log('✅ Added processed_at column');
    } catch (e) {
      console.log('Column processed_at already exists');
    }

    try {
      db.exec(`ALTER TABLE books ADD COLUMN error_message TEXT`);
      console.log('✅ Added error_message column');
    } catch (e) {
      console.log('Column error_message already exists');
    }

    // Create book_chunks table
    db.exec(`
      CREATE TABLE IF NOT EXISTS book_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        chunk_id TEXT UNIQUE NOT NULL,
        chunk_text TEXT NOT NULL,
        chapter_number INTEGER,
        chunk_index INTEGER,
        word_count INTEGER,
        embedding_vector TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created book_chunks table');

    db.exec(`CREATE INDEX IF NOT EXISTS idx_book_chunks_book_id ON book_chunks(book_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_book_chunks_chapter ON book_chunks(chapter_number)`);

    // Create extracted_characters table
    db.exec(`
      CREATE TABLE IF NOT EXISTS extracted_characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        character_id INTEGER,
        name TEXT NOT NULL,
        mention_count INTEGER,
        role TEXT,
        brief_description TEXT,
        extraction_status TEXT DEFAULT 'extracted',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created extracted_characters table');

    db.exec(`CREATE INDEX IF NOT EXISTS idx_extracted_characters_book_id ON extracted_characters(book_id)`);

    // Create character_personas table
    db.exec(`
      CREATE TABLE IF NOT EXISTS character_personas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER UNIQUE NOT NULL,
        persona_json TEXT NOT NULL,
        system_instruction TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Created character_personas table');

    db.exec(`CREATE INDEX IF NOT EXISTS idx_character_personas_character_id ON character_personas(character_id)`);

    console.log('');
    console.log('✅ AI processing tables created successfully!');
    console.log('');
    console.log('New tables:');
    console.log('  - book_chunks: Stores text chunks for RAG');
    console.log('  - extracted_characters: Stores AI-extracted characters');
    console.log('  - character_personas: Stores generated character personas');
    console.log('');
    console.log('Updated books table with processing status columns');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
