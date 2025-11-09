const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'user') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all conversations for a user
router.get('/', verifyUser, (req, res) => {
  try {
    const conversations = db.prepare(`
      SELECT c.*, ch.name as character_name, ch.avatar as character_avatar, ch.color as character_color,
             (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM conversations c
      JOIN characters ch ON c.character_id = ch.id
      WHERE c.user_id = ?
      ORDER BY c.updated_at DESC
    `).all(req.userId);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get single conversation with messages
router.get('/:id', verifyUser, (req, res) => {
  try {
    const conversation = db.prepare(`
      SELECT c.*, ch.name as character_name, ch.avatar as character_avatar, 
             ch.color as character_color, ch.image as character_image, ch.personality, ch.greeting
      FROM conversations c
      JOIN characters ch ON c.character_id = ch.id
      WHERE c.id = ? AND c.user_id = ?
    `).get(req.params.id, req.userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `).all(req.params.id);

    res.json({ ...conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new conversation
router.post('/', verifyUser, (req, res) => {
  const { characterId, title } = req.body;

  if (!characterId) {
    return res.status(400).json({ error: 'Character ID is required' });
  }

  try {
    // Check if character exists
    const character = db.prepare('SELECT * FROM characters WHERE id = ?').get(characterId);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Create conversation
    const insert = db.prepare(`
      INSERT INTO conversations (user_id, character_id, title)
      VALUES (?, ?, ?)
    `);

    const conversationTitle = title || `Chat with ${character.name}`;
    const result = insert.run(req.userId, characterId, conversationTitle);

    // Add initial greeting message
    const messageInsert = db.prepare(`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (?, 'assistant', ?)
    `);
    messageInsert.run(result.lastInsertRowid, character.greeting);

    // Get created conversation
    const conversation = db.prepare(`
      SELECT c.*, ch.name as character_name, ch.avatar as character_avatar,
             ch.color as character_color, ch.image as character_image,
             ch.personality, ch.greeting
      FROM conversations c
      JOIN characters ch ON c.character_id = ch.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
      .all(result.lastInsertRowid);

    res.status(201).json({ ...conversation, messages });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Add message to conversation
router.post('/:id/messages', verifyUser, (req, res) => {
  const { role, content, image } = req.body;

  if (!role || !content) {
    return res.status(400).json({ error: 'Role and content are required' });
  }

  if (role !== 'user' && role !== 'assistant') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Verify conversation belongs to user
    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Insert message
    const insert = db.prepare(`
      INSERT INTO messages (conversation_id, role, content, image)
      VALUES (?, ?, ?, ?)
    `);

    const result = insert.run(req.params.id, role, content, image || null);

    // Update conversation timestamp
    db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(req.params.id);

    // Get created message
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(message);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Delete conversation
router.delete('/:id', verifyUser, (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?');
    const result = deleteStmt.run(req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Update conversation title
router.put('/:id', verifyUser, (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const update = db.prepare('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?');
    const result = update.run(title, req.params.id, req.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
    res.json(conversation);
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

module.exports = router;
