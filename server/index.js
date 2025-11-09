const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const adminRoutes = require('./routes/admin');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files
app.use('/characters', express.static(path.join(__dirname, '../public/characters')));
app.use('/books', express.static(path.join(__dirname, '../public/books')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize database
require('./seed');

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 Literary Chat API Server Running        ║
║                                               ║
║   Port: ${PORT}                                  ║
║   Database: SQLite                            ║
║                                               ║
║   Default Admin Credentials:                  ║
║   Username: admin                             ║
║   Password: admin123                          ║
║                                               ║
║   API Endpoints:                              ║
║   POST   /api/auth/login                      ║
║   GET    /api/auth/verify                     ║
║   GET    /api/characters                      ║
║   POST   /api/characters (protected)          ║
║   PUT    /api/characters/:id (protected)      ║
║   DELETE /api/characters/:id (protected)      ║
╚═══════════════════════════════════════════════╝
  `);
});
