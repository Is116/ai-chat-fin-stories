const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password required' });
  }

  try {
    // Find admin by username or email
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register new admin (protected - only existing admins can create new ones)
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        email
      }
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { id: result.id, username, email }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, email: true }
    });
    
    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    res.json({ admin });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
