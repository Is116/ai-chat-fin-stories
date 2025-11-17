# 📚 Literary Chat - AI-Powered Book Character Conversations

A full-stack web application that allows users to upload books, extract characters using AI, and have engaging conversations with those characters in multiple languages. Built with React, Node.js, Express, SQLite, and Google Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Dependencies](#-dependencies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Multilingual Support](#-multilingual-support)
- [Social Authentication](#-social-authentication)
- [Admin Panel](#-admin-panel)
- [File Uploads](#-file-uploads)
- [Contributing](#-contributing)

---

## Features

### Core Features
- **PDF Book Upload** - Upload books in PDF format
- **AI Character Extraction** - Automatically extract main characters using Google Gemini AI
- **Character Chat** - Have conversations with book characters
- **Opinionated Personalities** - Characters express strong opinions and emotions
- **Multilingual Support** - Chat in English, Sinhala, Finnish, and more
- **User Authentication** - Local and Google OAuth login
- **Admin Dashboard** - Manage books, characters, and users
- **Auto-Generated Book Covers** - AI creates beautiful cover images
- **Character Avatars** - Auto-generated unique avatars using DiceBear API
- **Book Metadata Extraction** - AI extracts title, author, genre, year, description, language

### Advanced Features
- **RAG (Retrieval Augmented Generation)** - Context-aware responses using book chunks
- **Character Personas** - Deep personality analysis and authentic voices
- **Image Chat Support** - Upload images for character analysis
- **Conversation History** - Persistent chat history
- **Responsive Design** - Mobile-friendly interface
- **Beautiful UI** - Gradient backgrounds, animations, modern design

---

## Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router DOM 7.9** - Client-side routing
- **Vite 4.3** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **i18next** - Internationalization framework
- **React i18next** - React bindings for i18next

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1** - Web framework
- **Better-SQLite3 12.4** - Embedded database
- **Passport.js** - Authentication middleware
- **JWT (jsonwebtoken)** - Token-based auth
- **Multer** - File upload handling
- **Express Session** - Session management
- **BCrypt.js** - Password hashing

### AI & ML
- **Google Gemini AI** - Advanced language model
- **@google/generative-ai 0.24** - Gemini API SDK
- **@google-cloud/aiplatform 5.13** - Vertex AI integration
- **@google-cloud/vertexai 1.10** - Vertex AI SDK

### Document Processing
- **pdf-parse 2.4** - PDF text extraction
- **canvas 3.2** - Image generation (book covers)
- **pdfjs-dist 5.4** - PDF parsing

### Utilities
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **concurrently** - Run multiple commands

---

## 📁 Project Structure

```
ai-chat-fin-stories/
│
├── 📂 public/                          # Static assets
│   ├── 📂 books/                       # Book cover images
│   │   ├── 📂 pdfs/                    # Uploaded PDF files
│   │   │   ├── .gitkeep
│   │   │   └── book-*.pdf
│   │   ├── .gitkeep
│   │   └── book-cover-*.png
│   ├── 📂 characters/                  # Character avatar images
│   │   ├── .gitkeep
│   │   └── character-*.png
│   └── book.svg                        # Placeholder book icon
│
├── 📂 server/                          # Backend application
│   │
│   ├── 📂 config/                      # Configuration files
│   │   ├── google-cloud.js             # Google Cloud & Gemini AI config
│   │   ├── google-cloud-credentials.json # (gitignored) Service account
│   │   └── passport.js                 # Passport.js OAuth strategies
│   │
│   ├── 📂 middleware/                  # Express middleware
│   │   └── auth.js                     # JWT authentication middleware
│   │
│   ├── 📂 routes/                      # API route handlers
│   │   ├── admin.js                    # Admin panel endpoints
│   │   ├── ai-processing.js            # AI book/character processing
│   │   ├── auth.js                     # Local authentication
│   │   ├── books.js                    # Book CRUD operations
│   │   ├── characters.js               # Character CRUD operations
│   │   ├── conversations.js            # Chat conversation endpoints
│   │   ├── social-auth.js              # Google OAuth routes
│   │   └── users.js                    # User management
│   │
│   ├── 📂 services/                    # Business logic services
│   │   ├── ai-chat.js                  # Character conversation AI
│   │   ├── book-processor.js           # Book chunking & processing
│   │   ├── character-extractor.js      # Extract characters from books
│   │   └── persona-generator.js        # Generate character personas
│   │
│   ├── index.js                        # Express app entry point
│   ├── database.js                     # SQLite database setup
│   ├── seed.js                         # Database initialization
│   │
│   ├── 📂 migrations/                  # Database migrations
│   │   ├── add-adminuser.js            # Create admin user
│   │   ├── migrate-add-ai-tables.js    # AI-related tables
│   │   ├── migrate-add-language.js     # Language column
│   │   ├── migrate-add-pdf.js          # PDF file support
│   │   ├── migrate-add-roles.js        # User roles
│   │   ├── migrate-add-social-login.js # OAuth fields
│   │   ├── migrate-books.js            # Books table
│   │   ├── reset-adminuser-password.js # Admin password reset
│   │   └── test-adminuser-password.js  # Test admin login
│   │
│   └── literary-chat.db                # SQLite database file (gitignored)
│
├── 📂 src/                             # Frontend application
│   │
│   ├── 📂 components/                  # React components
│   │   │
│   │   ├── 📂 admin/                   # Admin panel components
│   │   │   ├── AdminDashboard.jsx      # Main admin interface
│   │   │   ├── AdminLogin.jsx          # Admin login page
│   │   │   └── AIBookProcessing.jsx    # Book processing UI
│   │   │
│   │   ├── 📂 pages/                   # Page components
│   │   │   ├── About.jsx               # About page
│   │   │   ├── AuthCallback.jsx        # OAuth redirect handler
│   │   │   ├── BookCharacters.jsx      # Book character listing
│   │   │   ├── Books.jsx               # All books page
│   │   │   ├── Contact.jsx             # Contact page
│   │   │   ├── FAQ.jsx                 # FAQ page
│   │   │   ├── HowItWorks.jsx          # How it works page
│   │   │   └── PrivacyPolicy.jsx       # Privacy policy
│   │   │
│   │   ├── CharacterCard.jsx           # Character display card
│   │   ├── CharacterSelection.jsx      # Character picker interface
│   │   ├── ChatInterface.jsx           # Chat UI component
│   │   ├── Footer.jsx                  # Site footer
│   │   ├── Message.jsx                 # Chat message bubble
│   │   ├── Navbar.jsx                  # Navigation bar
│   │   ├── UserLogin.jsx               # User login page
│   │   └── UserSignup.jsx              # User registration page
│   │
│   ├── 📂 i18n/                        # Internationalization
│   │   ├── config.js                   # i18next configuration
│   │   └── 📂 locales/                 # Translation files
│   │       ├── en.json                 # English translations
│   │       └── fi.json                 # Finnish translations
│   │
│   ├── 📂 utils/                       # Utility functions
│   │   └── api.js                      # API helper functions
│   │
│   ├── App.jsx                         # Main app component
│   ├── main.jsx                        # React entry point
│   └── index.css                       # Global styles
│
├── 📄 Configuration Files
│   ├── .env                            # Environment variables (gitignored)
│   ├── .gitignore                      # Git ignore rules
│   ├── index.html                      # HTML template
│   ├── package.json                    # NPM dependencies
│   ├── postcss.config.js               # PostCSS configuration
│   ├── tailwind.config.js              # Tailwind CSS config
│   └── vite.config.js                  # Vite configuration
│
└── 📄 Documentation
    ├── README.md                       # This file
    ├── GOOGLE_LOGIN_README.md          # OAuth setup guide
    └── SOCIAL_LOGIN_*.md               # Social login docs
```

---

## Dependencies

### Frontend Dependencies

```json
{
  "react": "^18.2.0",                    // UI framework
  "react-dom": "^18.2.0",                // React DOM rendering
  "react-router-dom": "^7.9.5",          // Client-side routing
  "react-i18next": "^16.2.4",            // React i18n bindings
  "i18next": "^25.6.1",                  // Internationalization
  "i18next-browser-languagedetector": "^8.2.0", // Auto language detection
  "lucide-react": "^0.263.1"             // Icon library
}
```

### Backend Dependencies

```json
{
  "express": "^5.1.0",                   // Web framework
  "better-sqlite3": "^12.4.1",           // SQLite database
  "cors": "^2.8.5",                      // CORS middleware
  "dotenv": "^17.2.3",                   // Environment variables
  "bcryptjs": "^3.0.3",                  // Password hashing
  "jsonwebtoken": "^9.0.2",              // JWT tokens
  "multer": "^2.0.2",                    // File uploads
  "passport": "^0.7.0",                  // Authentication
  "passport-google-oauth20": "^2.0.0",   // Google OAuth
  "express-session": "^1.18.2"           // Session management
}
```

### AI & Processing Dependencies

```json
{
  "@google/generative-ai": "^0.24.1",    // Gemini AI SDK
  "@google-cloud/aiplatform": "^5.13.0", // Vertex AI
  "@google-cloud/vertexai": "^1.10.0",   // Vertex AI SDK
  "pdf-parse": "^2.4.5",                 // PDF text extraction
  "canvas": "^3.2.0",                    // Image generation
  "pdfjs-dist": "^5.4.394"               // PDF parsing
}
```

### Dev Dependencies

```json
{
  "@vitejs/plugin-react": "^4.0.0",      // Vite React plugin
  "vite": "^4.3.9",                      // Build tool
  "tailwindcss": "^3.3.2",               // CSS framework
  "autoprefixer": "^10.4.14",            // CSS autoprefixer
  "postcss": "^8.4.24",                  // CSS processor
  "concurrently": "^9.2.1"               // Run parallel commands
}
```

---

## Installation

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **bun** package manager
- **Google Cloud Account** (for Gemini AI API key)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Is116/ai-chat-fin-stories.git
cd ai-chat-fin-stories
```

### Step 2: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 3: Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_PATH=./server/literary-chat.db

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
SESSION_SECRET=your-session-secret-change-this-in-production

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./server/config/google-cloud-credentials.json
VERTEX_AI_LOCATION=us-central1

# Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key

# Frontend Gemini API Key (for chat)
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Step 4: Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to `GEMINI_API_KEY` in `.env`

### Step 5: (Optional) Setup Google OAuth

See `GOOGLE_LOGIN_README.md` for detailed instructions.

---

## Configuration

### Database Configuration

The database is automatically initialized on first run. To manually run migrations:

```bash
# Add social login fields
node server/migrate-add-social-login.js

# Add language support
node server/migrate-add-language.js

# Add AI tables
node server/migrate-add-ai-tables.js

# Create admin user
node server/add-adminuser.js
```

### Admin User

Default admin credentials:
- **Username**: `admin`
- **Password**: `admin123`

**Change these immediately in production!**

### File Upload Limits

Configure in `server/routes/ai-processing.js`:

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});
```

---

## 🏃 Running the Application

### Development Mode

Run frontend and backend concurrently:

```bash
npm run dev:full
# or
bun run dev:full
```

Or run separately:

```bash
# Terminal 1 - Frontend (Vite dev server)
npm run dev

# Terminal 2 - Backend (Express server)
npm run server
```

### Production Mode

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Run backend
npm run server
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3000/admin/dashboard

---

## API Documentation

### Authentication Endpoints

#### Local Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response: { "token": "jwt-token", "user": {...} }
```

#### Google OAuth

```http
GET /api/auth/google
# Redirects to Google login

GET /api/auth/google/callback
# OAuth callback handler
```

### Book Endpoints

```http
# Get all books
GET /api/books

# Get single book
GET /api/books/:id

# Create book (protected, multipart/form-data)
POST /api/books
Headers: Authorization: Bearer <token>
Body: {
  title, author, description, genre,
  published_year, cover_image (file),
  pdf_file (file)
}

# Update book
PUT /api/books/:id

# Delete book
DELETE /api/books/:id
```

### Character Endpoints

```http
# Get all characters
GET /api/characters

# Get characters by book
GET /api/characters/book/:bookId

# Get single character
GET /api/characters/:id

# Create character (protected)
POST /api/characters
```

### AI Processing Endpoints

```http
# Analyze PDF for metadata
POST /api/ai-processing/analyze-book-metadata
Body: { file: PDF }
Response: { title, author, description, genre, year, language, cover_image }

# Extract characters from book
POST /api/ai-processing/process-and-generate/:bookId
Response: { characters: [...], count: 5 }
```

### Chat Endpoints

```http
# Send message to character
POST /api/conversations/chat
Body: {
  characterId, message, conversationId?,
  image? (base64)
}
Response: { reply, conversationId }

# Get conversation history
GET /api/conversations/:conversationId
```

---

## 🗄 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password TEXT,
  google_id TEXT UNIQUE,
  facebook_id TEXT UNIQUE,
  github_id TEXT UNIQUE,
  provider TEXT DEFAULT 'local',
  profile_photo TEXT,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);
```

### Books Table

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_image TEXT,
  pdf_file TEXT,
  genre TEXT,
  published_year INTEGER,
  language TEXT DEFAULT 'English',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Characters Table

```sql
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  book_id INTEGER,
  personality TEXT,
  avatar TEXT,
  image TEXT,
  color TEXT,
  greeting TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

### Conversations Table

```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  character_id INTEGER,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (character_id) REFERENCES characters(id)
);
```

### Book Chunks Table (RAG)

```sql
CREATE TABLE book_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

### Character Personas Table

```sql
CREATE TABLE character_personas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  character_id INTEGER UNIQUE NOT NULL,
  persona_json TEXT NOT NULL,
  system_instruction TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
```

---

## 🤖 AI Integration

### Google Gemini AI

The application uses **Google Gemini 2.5 Flash** for:

1. **Book Metadata Extraction**
   - Analyzes first 3000 characters of PDF
   - Extracts: title, author, description, genre, year, language
   - Returns structured JSON

2. **Character Extraction**
   - Analyzes full book text
   - Identifies 5 main characters
   - Extracts personality, description, role

3. **Character Personas**
   - Deep personality analysis
   - Speaking style and typical phrases
   - Relationships, motivations, worldview
   - Strong opinions and emotional traits

4. **Conversation AI**
   - Context-aware responses using RAG
   - Maintains conversation history
   - Multilingual support
   - Opinionated personality expressions

### RAG (Retrieval Augmented Generation)

Books are chunked into 2000-character segments for efficient retrieval:

```javascript
// Book processing
chunkSize: 2000 characters
overlap: 200 characters
storage: book_chunks table

// Context retrieval
query: user message
scoring: keyword matching
limit: top 5 relevant chunks
```

### AI Configuration

```javascript
// Gemini models
GEMINI_PRO: 'gemini-2.0-flash-exp'
GEMINI_PRO_VISION: 'gemini-2.0-flash-exp'

// Generation config
temperature: 0.7 (creative)
topP: 0.8
topK: 40
maxOutputTokens: 2048
```

---

## 🌍 Multilingual Support

### Supported Languages

- **English** (en)
- **Finnish** (fi)
- **Sinhala** (si)
- **Spanish** (es)
- **French** (fr)
- **German** (de)
- And more...

### How It Works

1. **UI Translation**: i18next with locale files
2. **AI Language Detection**: Gemini detects book language
3. **Response Matching**: Characters respond in user's language
4. **Fallback Translations**: Language-specific fallbacks

### Adding New Languages

1. Create translation file: `src/i18n/locales/[lang].json`
2. Add fallback in `server/routes/ai-processing.js`
3. Update language detection in AI prompts

---

## 🔐 Social Authentication

### Google OAuth Setup

1. **Google Cloud Console**
   - Create project
   - Enable Google+ API
   - Create OAuth Client ID

2. **Authorized URLs**
   - Origins: `http://localhost:3000`
   - Redirects: `http://localhost:3001/api/auth/google/callback`

3. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```

4. **Flow**
   - User clicks "Sign in with Google"
   - Redirects to Google authorization
   - Google redirects to callback
   - Backend creates/links user
   - Generates JWT token
   - Frontend stores token

### Account Linking

Users with same email across providers are automatically linked.

---

## Admin Panel

### Access

Navigate to: `http://localhost:3000/admin/dashboard`

### Features

1. **Books Management**
   - Upload PDFs
   - AI metadata extraction
   - Edit/delete books
   - View all books

2. **Character Management**
   - AI character extraction
   - Generate personas
   - Edit character details
   - Manage avatars

3. **User Management**
   - View all users
   - Edit user roles
   - Delete users
   - View login history

4. **AI Processing**
   - Analyze PDFs
   - Extract characters
   - Generate personas
   - View processing logs

### Admin Routes

Protected by JWT authentication + role check:

```javascript
router.use(authenticateToken);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});
```

---

## File Uploads

### Book Covers

- **Path**: `public/books/`
- **Format**: PNG
- **Naming**: `book-cover-{timestamp}-{random}.png`
- **Generation**: Canvas API with 8 color schemes

### PDF Files

- **Path**: `public/books/pdfs/`
- **Format**: PDF
- **Naming**: `book-{timestamp}-{random}.pdf`
- **Max Size**: 100MB

### Character Avatars

- **Path**: `public/characters/`
- **Format**: PNG
- **Source**: DiceBear API (avatars.dicebear.com)
- **Naming**: `character-{timestamp}-{random}.png`

### Upload Security

```javascript
// Multer config
storage: memoryStorage() // No direct disk access
limits: { fileSize: 100MB }
fileFilter: PDF only for books
```

---

## UI Components

### Design System

- **Colors**: Gradient backgrounds (purple-blue-pink)
- **Typography**: System fonts with bold headings
- **Icons**: Lucide React icon library
- **Layout**: Responsive grid and flexbox
- **Animations**: Tailwind transitions and transforms

### Key Components

1. **CharacterSelection**: Grid of character cards
2. **ChatInterface**: Message list + input
3. **AdminDashboard**: Tabbed interface (Books, Characters, Users)
4. **UserLogin**: Form with Google OAuth button
5. **Navbar**: Responsive navigation with language switcher

---

## 🧪 Testing

### Test Admin Login

```bash
node server/test-adminuser-password.js
```

### Reset Admin Password

```bash
node server/reset-adminuser-password.js
```

### Manual Testing

1. Upload a book PDF
2. Extract characters using AI
3. Generate character personas
4. Start a conversation
5. Test multilingual responses
6. Upload image in chat
7. Test Google OAuth login

---

## Troubleshooting

### Common Issues

**1. "GEMINI_API_KEY not found"**
- Add API key to `.env` file
- Restart server

**2. "Database locked"**
- Close all database connections
- Delete `literary-chat.db` and restart

**3. "OAuth redirect mismatch"**
- Verify callback URL in Google Console
- Check `FRONTEND_URL` in `.env`

**4. "PDF extraction failed"**
- Ensure PDF has text (not scanned images)
- Check file size < 100MB

**5. "Character responses always in English"**
- Verify language detection in book metadata
- Check AI prompt includes language instruction

---

## Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` and `SESSION_SECRET`
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure Google OAuth production URLs
- [ ] Enable HTTPS
- [ ] Set secure cookie options
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Configure logging
- [ ] Add monitoring (Sentry, etc.)

### Environment Variables

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

---

## License

MIT License - see LICENSE file for details

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## Support

For issues and questions:
- **GitHub Issues**: https://github.com/Is116/ai-chat-fin-stories/issues
- **Email**: support@example.com

---

## Acknowledgments

- Google Gemini AI for powerful language models
- DiceBear for avatar generation
- React and Vite communities
- All open-source contributors

---

**Built with using React, Node.js, and Google Gemini AI
  book: "Book Title",
  author: "Author Name",
  personality: "Character description and speaking style...",
  avatar: "",
  greeting: "Character's greeting message"

## API Information

This app uses the Anthropic Claude API. The API calls are made directly from the browser without requiring an API key (handled on the backend in the Claude.ai environment).

## License

MIT

## Acknowledgments

- Character personalities inspired by the original literary works
- Powered by Anthropic's Claude AI
- Icons by Lucide React
