# Prisma Database Guide

## Overview

This application uses **Prisma ORM** as the database management layer, providing type-safe database access and easy migrations. The database is currently configured to use **SQLite** but can be migrated to any SQL or NoSQL database supported by Prisma.

## Table of Contents

- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [Common Prisma Commands](#common-prisma-commands)
- [Migrations](#migrations)
- [Querying Data](#querying-data)
- [Switching Databases](#switching-databases)
- [Best Practices](#best-practices)

---

## Getting Started

### Installation

Prisma is already installed in this project. If you need to reinstall:

```bash
npm install @prisma/client
npm install -D prisma
```

### Initialize Prisma (Already Done)

The project is already set up with Prisma. The configuration files are:

- `prisma/schema.prisma` - Database schema definition
- `server/database.js` - Prisma client singleton
- `prisma/migrations/` - Migration history

### Database Location

The SQLite database file is located at:
```
prisma/literary-chat.db
```

---

## Database Schema

### Models Overview

The application has **10 main models**:

1. **User** - Application users
2. **Character** - Book characters that users can chat with
3. **Book** - Books uploaded to the system
4. **BookChunk** - Text chunks from books for RAG (Retrieval-Augmented Generation)
5. **ExtractedCharacter** - Characters extracted from books by AI
6. **CharacterPersona** - AI-generated personas for characters
7. **Conversation** - Chat conversations between users and characters
8. **Message** - Individual messages in conversations
9. **Prompt** - AI prompts stored in database for easy management
10. **Admin** - Admin users

### Detailed Schema

#### User Model
```prisma
model User {
  id            Int            @id @default(autoincrement())
  username      String         @unique
  email         String         @unique
  password      String
  googleId      String?        @unique @map("google_id")
  profilePic    String?        @map("profile_pic")
  createdAt     DateTime       @default(now()) @map("created_at")
  conversations Conversation[]

  @@map("users")
}
```

#### Character Model
```prisma
model Character {
  id            Int            @id @default(autoincrement())
  bookId        Int            @map("book_id")
  name          String
  description   String?
  personality   String?
  greeting      String?
  imageUrl      String?        @map("image_url")
  avatarUrl     String?        @map("avatar_url")
  createdAt     DateTime       @default(now()) @map("created_at")
  book          Book           @relation(fields: [bookId], references: [id], onDelete: Cascade)
  conversations Conversation[]
  personas      CharacterPersona[]

  @@map("characters")
}
```

#### Book Model
```prisma
model Book {
  id                   Int                 @id @default(autoincrement())
  title                String
  author               String?
  coverImage           String?             @map("cover_image")
  pdfFile              String?             @map("pdf_file")
  uploadedAt           DateTime            @default(now()) @map("uploaded_at")
  processingStatus     String              @default("pending") @map("processing_status")
  errorMessage         String?             @map("error_message")
  charactersExtracted  Int                 @default(0) @map("characters_extracted")
  totalChunks          Int                 @default(0) @map("total_chunks")
  processedAt          DateTime?           @map("processed_at")
  characters           Character[]
  chunks               BookChunk[]
  extractedCharacters  ExtractedCharacter[]

  @@map("books")
}
```

#### BookChunk Model (for RAG)
```prisma
model BookChunk {
  id            Int      @id @default(autoincrement())
  bookId        Int      @map("book_id")
  chunkId       String   @map("chunk_id")
  chapterNumber Int?     @map("chapter_number")
  chunkIndex    Int      @map("chunk_index")
  chunkText     String   @map("chunk_text")
  wordCount     Int      @map("word_count")
  createdAt     DateTime @default(now()) @map("created_at")
  book          Book     @relation(fields: [bookId], references: [id], onDelete: Cascade)

  @@map("book_chunks")
}
```

#### Conversation Model
```prisma
model Conversation {
  id          Int       @id @default(autoincrement())
  userId      Int       @map("user_id")
  characterId Int       @map("character_id")
  startedAt   DateTime  @default(now()) @map("started_at")
  lastMessage DateTime? @map("last_message")
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
  messages    Message[]

  @@map("conversations")
}
```

#### Message Model
```prisma
model Message {
  id             Int          @id @default(autoincrement())
  conversationId Int          @map("conversation_id")
  sender         String
  message        String
  imageUrl       String?      @map("image_url")
  timestamp      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("messages")
}
```

#### Prompt Model
```prisma
model Prompt {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  type        String
  content     String
  description String?
  isActive    Int      @default(1) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @default(now()) @map("updated_at")

  @@map("prompts")
}
```

---

## Common Prisma Commands

### Generate Prisma Client

After any schema changes, regenerate the client:

```bash
npx prisma generate
```

### View Database in Prisma Studio

Open a GUI to view and edit your database:

```bash
npx prisma studio
```

This will open `http://localhost:5555` with a visual database browser.

### Format Schema File

Auto-format your `schema.prisma`:

```bash
npx prisma format
```

### Validate Schema

Check if your schema is valid:

```bash
npx prisma validate
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

---

## Migrations

### Creating a Migration

When you modify `prisma/schema.prisma`, create a migration:

```bash
npx prisma migrate dev --name descriptive_migration_name
```

Example:
```bash
npx prisma migrate dev --name add_user_profile_fields
```

This will:
1. Generate SQL migration files
2. Apply the migration to your database
3. Regenerate Prisma Client

### Applying Migrations (Production)

In production, use:

```bash
npx prisma migrate deploy
```

### Viewing Migration Status

```bash
npx prisma migrate status
```

### Migration History

All migrations are stored in `prisma/migrations/` directory. Each migration has:
- A timestamp folder (e.g., `20251120104818_init/`)
- A `migration.sql` file with the actual SQL

### Current Migrations

1. **20251120104818_init** - Initial database schema
2. **20251120122719_update_book_chunks_schema** - Updated BookChunk fields

---

## Querying Data

### Import Prisma Client

```javascript
const prisma = require('./database'); // or const { PrismaClient } = require('@prisma/client')
```

### Basic CRUD Operations

#### Create
```javascript
// Create a new user
const user = await prisma.user.create({
  data: {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'hashed_password'
  }
});
```

#### Read (Find)
```javascript
// Find unique record
const user = await prisma.user.findUnique({
  where: { id: 1 }
});

// Find first matching record
const character = await prisma.character.findFirst({
  where: { name: 'Harry Potter' }
});

// Find many records
const books = await prisma.book.findMany({
  where: { processingStatus: 'completed' },
  orderBy: { uploadedAt: 'desc' },
  take: 10 // Limit to 10 results
});
```

#### Update
```javascript
// Update a record
const updatedBook = await prisma.book.update({
  where: { id: bookId },
  data: { 
    processingStatus: 'completed',
    totalChunks: 150
  }
});
```

#### Delete
```javascript
// Delete a record
await prisma.character.delete({
  where: { id: characterId }
});

// Delete many
await prisma.message.deleteMany({
  where: { conversationId: convId }
});
```

### Advanced Queries

#### Relations (Include/Select)
```javascript
// Include related data
const conversation = await prisma.conversation.findUnique({
  where: { id: conversationId },
  include: {
    user: true,
    character: true,
    messages: {
      orderBy: { timestamp: 'asc' },
      take: 20
    }
  }
});

// Select specific fields
const characters = await prisma.character.findMany({
  select: {
    id: true,
    name: true,
    book: {
      select: {
        title: true,
        author: true
      }
    }
  }
});
```

#### Filtering
```javascript
// Multiple conditions (AND)
const prompts = await prisma.prompt.findMany({
  where: {
    isActive: 1,
    type: 'image_response'
  }
});

// OR conditions
const characters = await prisma.character.findMany({
  where: {
    OR: [
      { name: { contains: 'Harry' } },
      { description: { contains: 'wizard' } }
    ]
  }
});

// NOT conditions
const users = await prisma.user.findMany({
  where: {
    NOT: { googleId: null }
  }
});
```

#### Sorting and Pagination
```javascript
const books = await prisma.book.findMany({
  orderBy: [
    { uploadedAt: 'desc' },
    { title: 'asc' }
  ],
  skip: 20,  // Skip first 20 (for page 3 if pageSize = 10)
  take: 10   // Take 10 records
});
```

#### Aggregation
```javascript
// Count
const userCount = await prisma.user.count();

// Count with filter
const completedBooks = await prisma.book.count({
  where: { processingStatus: 'completed' }
});

// Aggregate
const stats = await prisma.message.aggregate({
  where: { conversationId: convId },
  _count: true,
  _max: { timestamp: true },
  _min: { timestamp: true }
});
```

### Transactions

```javascript
// Execute multiple operations atomically
const result = await prisma.$transaction([
  prisma.user.create({ data: { username: 'user1', email: 'user1@example.com', password: 'hash' } }),
  prisma.book.update({ where: { id: 1 }, data: { processingStatus: 'completed' } }),
  prisma.character.delete({ where: { id: 5 } })
]);
```

---

## Switching Databases

Prisma supports multiple databases. Here's how to switch:

### PostgreSQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/literary_chat?schema=public"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

### MySQL

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="mysql://user:password@localhost:3306/literary_chat"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

### MongoDB

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Note: MongoDB requires different field types (@id -> @map("_id") @db.ObjectId)
```

2. Update `.env`:
```env
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/literary_chat"
```

### Supported Databases

- PostgreSQL
- MySQL
- SQLite (current)
- SQL Server
- MongoDB
- CockroachDB

---

## Best Practices

### 1. Use Prisma Client Singleton

Always use the singleton pattern (already implemented in `server/database.js`):

```javascript
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
```

### 2. Handle Disconnection

Always disconnect Prisma on app shutdown:

```javascript
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### 3. Use Transactions for Related Operations

```javascript
// Good: Atomic operation
await prisma.$transaction([
  prisma.extractedCharacter.update({
    where: { id: extractedId },
    data: { extractionStatus: 'approved' }
  }),
  prisma.character.create({
    data: { /* ... */ }
  })
]);
```

### 4. Use Select/Include Wisely

Don't fetch unnecessary data:

```javascript
// Bad: Fetches all fields
const users = await prisma.user.findMany();

// Good: Only fetch needed fields
const users = await prisma.user.findMany({
  select: { id: true, username: true, email: true }
});
```

### 5. Use Pagination

For large datasets, always paginate:

```javascript
const pageSize = 20;
const page = 1;

const messages = await prisma.message.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { timestamp: 'desc' }
});
```

### 6. Error Handling

```javascript
try {
  const user = await prisma.user.create({ data: { /* ... */ } });
} catch (error) {
  if (error.code === 'P2002') {
    // Unique constraint violation
    console.error('User already exists');
  } else {
    console.error('Database error:', error);
  }
}
```

### 7. Field Naming Convention

- **Prisma Schema**: Use camelCase (e.g., `userId`, `createdAt`)
- **Database**: Use snake_case via `@map()` (e.g., `user_id`, `created_at`)

This allows JavaScript code to use camelCase while maintaining SQL conventions:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now()) @map("created_at")
  
  @@map("users")
}
```

---

## Troubleshooting

### "Prisma Client could not locate the binary"

```bash
npx prisma generate
```

### Migration conflicts

```bash
# Reset and recreate database (⚠️ deletes data)
npx prisma migrate reset

# Or resolve manually
npx prisma migrate resolve --applied <migration_name>
```

### Database connection issues

Check your `.env` file and ensure `DATABASE_URL` is correct.

### Schema out of sync

```bash
npx prisma db push  # Push schema changes without migration
# OR
npx prisma migrate dev  # Create a new migration
```

---

## Useful Resources

- **Prisma Documentation**: https://www.prisma.io/docs
- **Prisma Schema Reference**: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Prisma Client API**: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- **Prisma Examples**: https://github.com/prisma/prisma-examples

---

## Support

For issues or questions:
1. Check Prisma documentation
2. Run `npx prisma studio` to inspect database
3. Check migration history with `npx prisma migrate status`
4. Review error logs in terminal

