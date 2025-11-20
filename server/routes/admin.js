const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../database');

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

// Create new user (admin only)
router.post('/users', verifyAdmin, async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Validate role
    const validRoles = ['user', 'moderator', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Check for duplicate username
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check for duplicate email
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        fullName: full_name || null
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        createdAt: true
      }
    });

    // Transform to snake_case for API response
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.fullName,
        created_at: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users with statistics
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        conversations: {
          include: {
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to match old format with conversation and message counts
    const usersWithStats = users.map(user => {
      const conversationCount = user.conversations.length;
      const messageCount = user.conversations.reduce((acc, conv) => acc + conv.messages.length, 0);
      
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.fullName,
        avatar: user.avatar,
        google_id: user.googleId,
        facebook_id: user.facebookId,
        github_id: user.githubId,
        provider: user.provider,
        profile_photo: user.profilePhoto,
        created_at: user.createdAt,
        last_login: user.lastLogin,
        conversation_count: conversationCount,
        message_count: messageCount
      };
    });

    res.json(usersWithStats);
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

// Update user role
router.patch('/users/:id/role', verifyAdmin, (req, res) => {
  try {
    const { role } = req.body;
    
    // Validate role
    const validRoles = ['user', 'moderator', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be one of: user, moderator, admin' 
      });
    }

    // Check if user exists
    const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update role
    const updateStmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    updateStmt.run(role, req.params.id);

    // Get updated user
    const updatedUser = db.prepare('SELECT id, username, email, role, full_name, created_at FROM users WHERE id = ?')
      .get(req.params.id);

    res.json({
      message: 'User role updated successfully',
      user: updatedUser,
      previous_role: user.role,
      new_role: role
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update user details
router.patch('/users/:id', verifyAdmin, (req, res) => {
  try {
    const { username, email, full_name, password } = req.body;
    
    // Validate at least one field is provided
    if (!username && !email && full_name === undefined && !password) {
      return res.status(400).json({ 
        error: 'At least one field (username, email, full_name, or password) must be provided' 
      });
    }

    // Validate password if provided
    if (password && password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for duplicate username or email (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
        .get(username, req.params.id);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(email, req.params.id);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name || null);
    }
    if (password) {
      updates.push('password = ?');
      values.push(bcrypt.hashSync(password, 10));
    }
    
    values.push(req.params.id);

    // Update user
    const updateStmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    updateStmt.run(...values);

    // Get updated user (without password)
    const updatedUser = db.prepare(`
      SELECT id, username, email, full_name, role, avatar, created_at, last_login
      FROM users WHERE id = ?
    `).get(req.params.id);

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
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

// ==================== PROMPT MANAGEMENT ROUTES ====================

// Get all prompts
router.get('/prompts', verifyAdmin, async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform to snake_case for API compatibility
    const transformedPrompts = prompts.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      content: p.content,
      description: p.description,
      is_active: p.isActive,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }));

    res.json(transformedPrompts);
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ error: 'Failed to fetch prompts', details: error.message });
  }
});

// Get prompt by ID
router.get('/prompts/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = await prisma.prompt.findUnique({
      where: { id: parseInt(id) }
    });

    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Transform to snake_case
    res.json({
      id: prompt.id,
      name: prompt.name,
      type: prompt.type,
      content: prompt.content,
      description: prompt.description,
      is_active: prompt.isActive,
      created_at: prompt.createdAt,
      updated_at: prompt.updatedAt
    });
  } catch (error) {
    console.error('Get prompt error:', error);
    res.status(500).json({ error: 'Failed to fetch prompt' });
  }
});

// Get prompts by type
router.get('/prompts/type/:type', verifyAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    
    const prompts = await prisma.prompt.findMany({
      where: { type },
      orderBy: { name: 'asc' }
    });

    // Transform to snake_case
    const transformedPrompts = prompts.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      content: p.content,
      description: p.description,
      is_active: p.isActive,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    }));

    res.json(transformedPrompts);
  } catch (error) {
    console.error('Get prompts by type error:', error);
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
});

// Create new prompt
router.post('/prompts', verifyAdmin, async (req, res) => {
  try {
    const { name, type, content, description, is_active } = req.body;

    // Validate required fields
    if (!name || !type || !content) {
      return res.status(400).json({ error: 'Name, type, and content are required' });
    }

    // Check if prompt name already exists
    const existing = await prisma.prompt.findUnique({
      where: { name }
    });
    if (existing) {
      return res.status(400).json({ error: 'Prompt name already exists' });
    }

    const newPrompt = await prisma.prompt.create({
      data: {
        name,
        type,
        content,
        description: description || null,
        isActive: is_active !== undefined ? is_active : 1
      }
    });

    // Transform to snake_case
    res.status(201).json({
      id: newPrompt.id,
      name: newPrompt.name,
      type: newPrompt.type,
      content: newPrompt.content,
      description: newPrompt.description,
      is_active: newPrompt.isActive,
      created_at: newPrompt.createdAt,
      updated_at: newPrompt.updatedAt
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Update prompt
router.put('/prompts/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, content, description, is_active } = req.body;

    // Check if prompt exists
    const existing = await prisma.prompt.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    // Validate required fields
    if (!name || !type || !content) {
      return res.status(400).json({ error: 'Name, type, and content are required' });
    }

    // Check if new name conflicts with another prompt
    const nameConflict = await prisma.prompt.findFirst({
      where: {
        name,
        NOT: {
          id: parseInt(id)
        }
      }
    });
    if (nameConflict) {
      return res.status(400).json({ error: 'Prompt name already exists' });
    }

    const updatedPrompt = await prisma.prompt.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        content,
        description: description || null,
        isActive: is_active !== undefined ? is_active : 1
      }
    });

    // Transform to snake_case
    res.json({
      id: updatedPrompt.id,
      name: updatedPrompt.name,
      type: updatedPrompt.type,
      content: updatedPrompt.content,
      description: updatedPrompt.description,
      is_active: updatedPrompt.isActive,
      created_at: updatedPrompt.createdAt,
      updated_at: updatedPrompt.updatedAt
    });
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

// Delete prompt
router.delete('/prompts/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if prompt exists
    const existing = await prisma.prompt.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    await prisma.prompt.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Prompt deleted successfully', deleted: existing });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Toggle prompt active status
router.patch('/prompts/:id/toggle', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, isActive: true }
    });
    if (!prompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const newStatus = prompt.isActive ? 0 : 1;

    const updatedPrompt = await prisma.prompt.update({
      where: { id: parseInt(id) },
      data: { isActive: newStatus }
    });

    // Transform to snake_case
    res.json({
      id: updatedPrompt.id,
      name: updatedPrompt.name,
      type: updatedPrompt.type,
      content: updatedPrompt.content,
      description: updatedPrompt.description,
      is_active: updatedPrompt.isActive,
      created_at: updatedPrompt.createdAt,
      updated_at: updatedPrompt.updatedAt
    });
  } catch (error) {
    console.error('Toggle prompt error:', error);
    res.status(500).json({ error: 'Failed to toggle prompt status' });
  }
});

module.exports = router;
