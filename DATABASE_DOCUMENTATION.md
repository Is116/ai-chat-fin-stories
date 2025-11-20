# Database Documentation

## Overview

This document provides a comprehensive overview of the database structure, relationships, and data flow for the Literary Chat application.

## Database Technology

- **ORM**: Prisma
- **Current Database**: SQLite (located at `prisma/literary-chat.db`)
- **Migrations**: Managed by Prisma Migrate
- **Portable**: Can be migrated to PostgreSQL, MySQL, MongoDB, or other databases

---

## Database Architecture

### Entity Relationship Overview

```
Users ──< Conversations >── Characters ──< Books
              │                   │
              │                   └─< CharacterPersona
              │                   │
              └──< Messages        └─< ExtractedCharacters
                   
Books ──< BookChunks
      └─< ExtractedCharacters

Admins (separate authentication)

Prompts (system-wide AI instructions)
```

---

## Tables (Models)

### 1. Users Table

**Purpose**: Store user accounts for the chat application

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| username | TEXT | Unique username |
| email | TEXT | Unique email address |
| password | TEXT | Hashed password |
| google_id | TEXT | Google OAuth ID (nullable, unique) |
| profile_pic | TEXT | URL to profile picture (nullable) |
| created_at | DATETIME | Account creation timestamp |

**Relationships**:
- One user can have many conversations

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `username`, `email`, `google_id`

---

### 2. Characters Table

**Purpose**: Store literary characters that users can chat with

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| book_id | INTEGER | Foreign key to books table |
| name | TEXT | Character name |
| description | TEXT | Character description (nullable) |
| personality | TEXT | Character personality traits (nullable) |
| greeting | TEXT | Default greeting message (nullable) |
| image_url | TEXT | Character image path (nullable) |
| avatar_url | TEXT | Character avatar path (nullable) |
| created_at | DATETIME | Record creation timestamp |

**Relationships**:
- Belongs to one book (CASCADE on delete)
- Has many conversations
- Has many personas (RAG-generated)

**Indexes**:
- PRIMARY KEY on `id`
- FOREIGN KEY on `book_id` → `books(id)`

**Files Associated**:
- Images stored in `public/characters/`
- Avatars stored in `public/characters/`

---

### 3. Books Table

**Purpose**: Store uploaded books and their processing status

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| title | TEXT | Book title |
| author | TEXT | Book author (nullable) |
| cover_image | TEXT | Cover image filename (nullable) |
| pdf_file | TEXT | PDF filename (nullable) |
| uploaded_at | DATETIME | Upload timestamp |
| processing_status | TEXT | Status: pending, processing, completed, error |
| error_message | TEXT | Error details if processing failed (nullable) |
| characters_extracted | INTEGER | Count of extracted characters (default: 0) |
| total_chunks | INTEGER | Count of text chunks (default: 0) |
| processed_at | DATETIME | Processing completion time (nullable) |

**Relationships**:
- Has many characters (CASCADE on delete)
- Has many book chunks (CASCADE on delete)
- Has many extracted characters (CASCADE on delete)

**Processing Statuses**:
- `pending` - Uploaded but not processed
- `processing` - Currently being processed
- `extracting_characters` - Extracting characters with AI
- `characters_extracted` - Characters extracted successfully
- `completed` - Fully processed
- `error` - Processing failed

**Files Associated**:
- Cover images in `public/books/`
- PDF files in `public/books/pdfs/`

---

### 4. BookChunks Table (RAG)

**Purpose**: Store text chunks from books for Retrieval-Augmented Generation (RAG)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| book_id | INTEGER | Foreign key to books table |
| chunk_id | TEXT | Unique chunk identifier |
| chapter_number | INTEGER | Chapter number (nullable) |
| chunk_index | INTEGER | Index within chapter/book |
| chunk_text | TEXT | The actual text chunk |
| word_count | INTEGER | Number of words in chunk |
| created_at | DATETIME | Chunk creation timestamp |

**Relationships**:
- Belongs to one book (CASCADE on delete)

**Purpose in RAG**:
- Text is split into ~500-word chunks
- Chunks are searched for relevant context during conversations
- Enables characters to reference specific book content

---

### 5. ExtractedCharacters Table

**Purpose**: Store AI-extracted characters before approval

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| book_id | INTEGER | Foreign key to books table |
| name | TEXT | Character name |
| mention_count | INTEGER | Approximate mentions in book |
| role | TEXT | Character role (protagonist, antagonist, etc.) |
| brief_description | TEXT | One-sentence description (nullable) |
| extraction_status | TEXT | Status: extracted, approved, rejected |
| character_id | INTEGER | FK to characters if approved (nullable) |
| created_at | DATETIME | Extraction timestamp |

**Relationships**:
- Belongs to one book (CASCADE on delete)
- Links to character after approval (SET NULL on delete)

**Workflow**:
1. AI analyzes book and extracts characters
2. Characters stored with status `extracted`
3. Admin reviews and approves/rejects
4. Approved characters get `character_id` and status `approved`

---

### 6. CharacterPersona Table

**Purpose**: Store RAG-generated character personas for enhanced conversations

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| character_id | INTEGER | Foreign key to characters table |
| persona_json | TEXT | Structured persona data (JSON) |
| context | TEXT | Book context used for generation (nullable) |
| system_instruction | TEXT | AI system instruction for this persona |
| created_at | DATETIME | Persona creation timestamp |

**Relationships**:
- Belongs to one character (CASCADE on delete)

**Purpose**:
- Stores AI-generated personas based on book analysis
- Contains system instructions for character conversations
- Includes personality traits, speech patterns, knowledge

---

### 7. Conversations Table

**Purpose**: Store chat conversations between users and characters

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| user_id | INTEGER | Foreign key to users table |
| character_id | INTEGER | Foreign key to characters table |
| started_at | DATETIME | Conversation start timestamp |
| last_message | DATETIME | Timestamp of last message (nullable) |

**Relationships**:
- Belongs to one user (CASCADE on delete)
- Belongs to one character (CASCADE on delete)
- Has many messages (CASCADE on delete)

**Indexes**:
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` → `users(id)`
- FOREIGN KEY on `character_id` → `characters(id)`

---

### 8. Messages Table

**Purpose**: Store individual messages within conversations

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| conversation_id | INTEGER | Foreign key to conversations table |
| sender | TEXT | Message sender: 'user' or 'character' |
| message | TEXT | Message content |
| image_url | TEXT | Attached image URL (nullable) |
| timestamp | DATETIME | Message timestamp |

**Relationships**:
- Belongs to one conversation (CASCADE on delete)

**Sender Types**:
- `user` - Message from the user
- `character` - Response from AI character

**Image Support**:
- Users can send images with messages
- Images stored as base64 or file paths in `image_url`

---

### 9. Prompts Table

**Purpose**: Store AI prompts and instructions (database-driven, not hardcoded)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| name | TEXT | Unique prompt identifier |
| type | TEXT | Prompt category |
| content | TEXT | The actual prompt text |
| description | TEXT | Human-readable description (nullable) |
| is_active | INTEGER | Active flag (1 = active, 0 = inactive) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

**Prompt Types**:
- `fallback_personality_instructions` - Basic character behavior
- `fallback_image_analysis` - Image description instructions (fallback)
- `fallback_response_style` - Response formatting (fallback)
- `persona_enhanced_personality` - Enhanced persona instructions
- `persona_image_response` - Image handling with persona
- `persona_language_rule` - Multi-language rules
- `image_response` - Image analysis instructions
- `character_extraction_prompt` - For extracting characters from books
- `book_processor` - For book analysis
- `persona_generator` - For generating character personas

**Editability**:
- All prompts can be edited through admin panel
- Changes take effect immediately (1-minute cache)
- No code deployment needed for prompt updates

---

### 10. Admins Table

**Purpose**: Store admin accounts (separate from regular users)

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| username | TEXT | Unique admin username |
| password | TEXT | Hashed password |
| created_at | DATETIME | Account creation timestamp |

**Security**:
- Separate authentication from regular users
- Password hashing with bcrypt
- Admin-only routes protected by middleware

---

## Data Flow

### User Registration & Login

```
1. User registers → User record created
2. Password hashed with bcrypt
3. Session created (passport.js)
4. User can access chat features
```

### Book Upload & Processing

```
1. Admin uploads PDF → Book record created (status: pending)
2. PDF saved to public/books/pdfs/
3. Cover image uploaded → saved to public/books/
4. Background processing:
   a. Extract text from PDF
   b. Split into chunks → BookChunk records
   c. AI extracts characters → ExtractedCharacter records
   d. Update status to 'characters_extracted'
5. Admin reviews extracted characters
6. Approved characters → Character records created
7. AI generates personas → CharacterPersona records
```

### Chat Conversation Flow

```
1. User selects character → Conversation created (if new)
2. User sends message → Message record (sender: 'user')
3. AI processes:
   a. Retrieve character + persona
   b. Search book chunks for relevant context (RAG)
   c. Analyze past conversations for continuity
   d. Get active prompts from database
   e. Generate response using Gemini AI
4. Response saved → Message record (sender: 'character')
5. Conversation.last_message updated
```

### Image Analysis Flow

```
1. User sends message with image
2. Image encoded as base64 in message.image_url
3. AI retrieves 'image_response' prompt
4. Multimodal generation (text + image)
5. Character responds describing image in-character
```

---

## Indexes and Performance

### Existing Indexes

- **Primary Keys**: All tables have auto-increment primary keys
- **Unique Constraints**:
  - users(username, email, google_id)
  - characters: none
  - prompts(name)
  - admins(username)

### Foreign Key Cascade Rules

| Parent → Child | On Delete | Reasoning |
|----------------|-----------|-----------|
| books → characters | CASCADE | Delete characters when book deleted |
| books → book_chunks | CASCADE | Delete chunks when book deleted |
| books → extracted_characters | CASCADE | Delete extractions when book deleted |
| characters → conversations | CASCADE | Delete conversations when character deleted |
| characters → character_personas | CASCADE | Delete personas when character deleted |
| users → conversations | CASCADE | Delete conversations when user deleted |
| conversations → messages | CASCADE | Delete messages when conversation deleted |
| extracted_characters → characters | SET NULL | Keep extraction record if character deleted |

---

## File Storage

### Directory Structure

```
public/
├── books/
│   ├── cover-image-1.jpg
│   ├── cover-image-2.jpg
│   └── pdfs/
│       ├── book-1.pdf
│       └── book-2.pdf
└── characters/
    ├── character-1-image.jpg
    ├── character-1-avatar.jpg
    ├── character-2-image.jpg
    └── character-2-avatar.jpg
```

### File Cleanup

When deleting records:
- **Delete Book**: Removes cover image, PDF, and all associated character images/avatars
- **Delete Character**: Removes character image and avatar
- **Delete All Characters (bulk)**: Removes all character files

---

## Backup and Recovery

### Backup SQLite Database

```bash
# Create backup
cp prisma/literary-chat.db prisma/literary-chat-backup-$(date +%Y%m%d).db

# Or use SQLite command
sqlite3 prisma/literary-chat.db ".backup prisma/backup.db"
```

### Restore Database

```bash
# Stop server first
cp prisma/literary-chat-backup.db prisma/literary-chat.db

# Restart server
```

### Export Data

```bash
# Export to SQL
sqlite3 prisma/literary-chat.db .dump > backup.sql

# Export specific table
sqlite3 prisma/literary-chat.db "SELECT * FROM users;" > users.csv
```

---

## Database Size Considerations

### Storage Estimates

- **Users**: ~500 bytes per user
- **Characters**: ~1-2 KB per character
- **Books**: Minimal (metadata only, ~500 bytes)
- **BookChunks**: ~500-1000 bytes per chunk (books have 100-500 chunks)
- **Messages**: ~200-500 bytes per message
- **Conversations**: ~100 bytes per conversation

### Scaling Considerations

For large deployments (>10,000 users), consider:
1. Migrating to PostgreSQL or MySQL
2. Adding indexes on frequently queried fields
3. Implementing pagination for all list queries
4. Archiving old conversations
5. Implementing message retention policies

---

## Security Considerations

### Passwords

- All passwords hashed with bcrypt (salt rounds: 10)
- Never store plain-text passwords
- Admin and user passwords stored separately

### SQL Injection

- Prisma ORM prevents SQL injection by design
- All queries use parameterized statements
- Never concatenate user input into queries

### File Upload Security

- PDF files validated before upload
- File sizes limited by middleware
- Files stored outside web root when possible
- Images validated for type and size

### Data Privacy

- User passwords never exposed in API responses
- Soft delete option available for user data
- Conversation data tied to user accounts

---

## Monitoring

### Useful Queries

**Count active users**:
```sql
SELECT COUNT(*) FROM users;
```

**Books by processing status**:
```sql
SELECT processing_status, COUNT(*) 
FROM books 
GROUP BY processing_status;
```

**Most active characters**:
```sql
SELECT c.name, COUNT(conv.id) as conversation_count
FROM characters c
LEFT JOIN conversations conv ON c.id = conv.character_id
GROUP BY c.id
ORDER BY conversation_count DESC
LIMIT 10;
```

**Database size** (SQLite):
```sql
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

---

## Migration History

### Migration #1: Initial Schema (20251120104818_init)
- Created all 10 tables
- Set up relationships and foreign keys
- Established cascade rules

### Migration #2: Update BookChunks (20251120122719_update_book_chunks_schema)
- Added `chapter_number`, `chunk_index`, `chunk_text`, `word_count`
- Added `chunk_id` field
- Updated Book model with processing fields

---

## Troubleshooting

### "database is locked" Error

SQLite issue when multiple processes access database:
```bash
# Check for running processes
lsof prisma/literary-chat.db

# Restart server
```

### Missing Tables

```bash
# Run migrations
npx prisma migrate deploy
```

### Data Corruption

```bash
# Check database integrity
sqlite3 prisma/literary-chat.db "PRAGMA integrity_check;"

# Restore from backup if needed
```

### Performance Issues

```bash
# Analyze database
sqlite3 prisma/literary-chat.db "ANALYZE;"

# Check for missing indexes
sqlite3 prisma/literary-chat.db ".schema"
```

---

## Future Enhancements

### Potential Schema Additions

1. **User Preferences Table**
   - Theme settings
   - Language preferences
   - Notification settings

2. **Character Ratings Table**
   - User ratings for characters
   - Favorite characters

3. **Conversation Analytics Table**
   - Message counts
   - Session duration
   - User engagement metrics

4. **Character Relationships Table**
   - Map relationships between characters
   - Enhance context in multi-character conversations

---

## Conclusion

This database design supports:
- ✅ Scalable user management
- ✅ Efficient book processing pipeline
- ✅ RAG-enhanced conversations
- ✅ Multi-language support
- ✅ Image analysis capabilities
- ✅ Database-driven AI prompts
- ✅ Conversation memory and continuity
- ✅ Easy migration to other databases

For implementation details, see `PRISMA_GUIDE.md`.
