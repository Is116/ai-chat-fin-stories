const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Admin access required' });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all users with statistics
router.get('/users', verifyAdmin, (req, res) => {
  try {
    const users = db.prepare(`
      SELECT 
        u.*,
        COUNT(DISTINCT c.id) as conversation_count,
        COUNT(DISTINCT m.id) as message_count
      FROM users u
      LEFT JOIN conversations c ON u.id = c.user_id
      LEFT JOIN messages m ON c.id = m.conversation_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    // Remove passwords from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user details
router.get('/users/:id', verifyAdmin, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT 
        u.*,
        COUNT(DISTINCT c.id) as conversation_count,
        COUNT(DISTINCT m.id) as message_count
      FROM users u
      LEFT JOIN conversations c ON u.id = c.user_id
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE u.id = ?
      GROUP BY u.id
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password
    const { password, ...sanitizedUser } = user;

    // Get user's conversations
    const conversations = db.prepare(`
      SELECT 
        c.*,
        ch.name as character_name,
        COUNT(m.id) as message_count
      FROM conversations c
      JOIN characters ch ON c.character_id = ch.id
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.user_id = ?
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `).all(req.params.id);

    res.json({
      ...sanitizedUser,
      conversations
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Delete user (and all their conversations/messages via CASCADE)
router.delete('/users/:id', verifyAdmin, (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = deleteStmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User deleted successfully',
      deleted: {
        user_id: req.params.id,
        conversations_deleted: true,
        messages_deleted: true
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get platform statistics
router.get('/stats', verifyAdmin, (req, res) => {
  try {
    const stats = {
      total_users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      total_characters: db.prepare('SELECT COUNT(*) as count FROM characters').get().count,
      total_conversations: db.prepare('SELECT COUNT(*) as count FROM conversations').get().count,
      total_messages: db.prepare('SELECT COUNT(*) as count FROM messages').get().count,
      users_today: db.prepare(`
        SELECT COUNT(*) as count FROM users 
        WHERE DATE(created_at) = DATE('now')
      `).get().count,
      active_users_week: db.prepare(`
        SELECT COUNT(DISTINCT user_id) as count FROM conversations 
        WHERE DATE(updated_at) >= DATE('now', '-7 days')
      `).get().count
    };

    // Most popular characters
    const popularCharacters = db.prepare(`
      SELECT 
        ch.name,
        ch.avatar,
        COUNT(c.id) as conversation_count
      FROM characters ch
      LEFT JOIN conversations c ON ch.id = c.character_id
      GROUP BY ch.id
      ORDER BY conversation_count DESC
      LIMIT 5
    `).all();

    // Recent activity
    const recentActivity = db.prepare(`
      SELECT 
        u.username,
        ch.name as character_name,
        c.title,
        c.created_at
      FROM conversations c
      JOIN users u ON c.user_id = u.id
      JOIN characters ch ON c.character_id = ch.id
      ORDER BY c.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      ...stats,
      popular_characters: popularCharacters,
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
