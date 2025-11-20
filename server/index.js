require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { configurePassport } = require('./config/passport');
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const adminRoutes = require('./routes/admin');
const bookRoutes = require('./routes/books');
const aiProcessingRoutes = require('./routes/ai-processing');
const socialAuthRoutes = require('./routes/social-auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/api/ai-processing', aiProcessingRoutes);

// Serve static files
app.use('/characters', express.static(path.join(__dirname, '../public/characters')));
app.use('/books', express.static(path.join(__dirname, '../public/books')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', socialAuthRoutes); // Social login routes
app.use('/api/books', bookRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server and initialize database
async function startServer() {
  try {
    // Initialize database with seed data
    await require('./seed');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`
║   Port: ${PORT}                               
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
