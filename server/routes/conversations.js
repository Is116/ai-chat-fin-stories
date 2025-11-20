const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../database');
const { generateCharacterResponse } = require('../services/ai-chat');

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
router.get('/', verifyUser, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: req.userId },
      include: {
        character: {
          select: {
            name: true,
            avatar: true,
            color: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Format response to match old structure
    const formattedConversations = conversations.map(c => ({
      id: c.id,
      user_id: c.userId,
      character_id: c.characterId,
      title: c.title,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
      character_name: c.character.name,
      character_avatar: c.character.avatar,
      character_color: c.character.color,
      message_count: c._count.messages,
      last_message: c.messages[0]?.content || null
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get single conversation with messages
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      },
      include: {
        character: {
          select: {
            name: true,
            avatar: true,
            color: true,
            image: true,
            personality: true,
            greeting: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Format response to match old structure
    const formattedConversation = {
      id: conversation.id,
      user_id: conversation.userId,
      character_id: conversation.characterId,
      title: conversation.title,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
      character_name: conversation.character.name,
      character_avatar: conversation.character.avatar,
      character_color: conversation.character.color,
      character_image: conversation.character.image,
      personality: conversation.character.personality,
      greeting: conversation.character.greeting,
      messages: conversation.messages.map(m => ({
        id: m.id,
        conversation_id: m.conversationId,
        role: m.role,
        content: m.content,
        image: m.image,
        created_at: m.createdAt
      }))
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new conversation
router.post('/', verifyUser, async (req, res) => {
  const { characterId, title } = req.body;

  if (!characterId) {
    return res.status(400).json({ error: 'Character ID is required' });
  }

  try {
    // Check if character exists
    const character = await prisma.character.findUnique({
      where: { id: parseInt(characterId) }
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const conversationTitle = title || `Chat with ${character.name}`;

    // Create conversation with initial greeting message
    const conversation = await prisma.conversation.create({
      data: {
        userId: req.userId,
        characterId: parseInt(characterId),
        title: conversationTitle,
        messages: {
          create: {
            role: 'assistant',
            content: character.greeting
          }
        }
      },
      include: {
        character: {
          select: {
            name: true,
            avatar: true,
            color: true,
            image: true,
            personality: true,
            greeting: true
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Format response to match old structure
    const formattedConversation = {
      id: conversation.id,
      user_id: conversation.userId,
      character_id: conversation.characterId,
      title: conversation.title,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
      character_name: conversation.character.name,
      character_avatar: conversation.character.avatar,
      character_color: conversation.character.color,
      character_image: conversation.character.image,
      personality: conversation.character.personality,
      greeting: conversation.character.greeting,
      messages: conversation.messages.map(m => ({
        id: m.id,
        conversation_id: m.conversationId,
        role: m.role,
        content: m.content,
        image: m.image,
        created_at: m.createdAt
      }))
    };

    res.status(201).json(formattedConversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Add message to conversation
router.post('/:id/messages', verifyUser, async (req, res) => {
  const { role, content, image } = req.body;

  if (!role || !content) {
    return res.status(400).json({ error: 'Role and content are required' });
  }

  if (role !== 'user' && role !== 'assistant') {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            personality: true
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Insert user message and update conversation timestamp
    const message = await prisma.message.create({
      data: {
        conversationId: parseInt(req.params.id),
        role,
        content,
        image: image || null
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: parseInt(req.params.id) },
      data: { updatedAt: new Date() }
    });

    // Format message to match old structure
    const formattedMessage = {
      id: message.id,
      conversation_id: message.conversationId,
      role: message.role,
      content: message.content,
      image: message.image,
      created_at: message.createdAt
    };

    // If it's a user message, generate AI response
    if (role === 'user') {
      try {
        // Get conversation history
        const conversationHistory = await prisma.message.findMany({
          where: { conversationId: parseInt(req.params.id) },
          orderBy: { createdAt: 'asc' },
          select: {
            role: true,
            content: true,
            image: true
          }
        });

        // Generate AI response using the AI chat service (with RAG)
        const aiResponseData = await generateCharacterResponse(
          conversation.character.id,
          content,
          conversationHistory,
          image,  // Pass the image to AI
          req.userId  // Pass userId to enable memory of past conversations
        );

        // Extract the message from the response object
        const aiResponse = aiResponseData.message || aiResponseData;

        // Save AI response
        const aiMessage = await prisma.message.create({
          data: {
            conversationId: parseInt(req.params.id),
            role: 'assistant',
            content: aiResponse
          }
        });

        // Format AI message
        const formattedAiMessage = {
          id: aiMessage.id,
          conversation_id: aiMessage.conversationId,
          role: aiMessage.role,
          content: aiMessage.content,
          image: aiMessage.image,
          created_at: aiMessage.createdAt
        };

        // Return both user message and AI response
        return res.status(201).json({
          userMessage: formattedMessage,
          aiMessage: formattedAiMessage
        });
      } catch (aiError) {
        console.error('AI response generation error:', aiError);
        
        // Return user message even if AI fails
        // The frontend can handle the error
        return res.status(201).json({
          userMessage: formattedMessage,
          error: 'Failed to generate AI response',
          errorMessage: aiError.message
        });
      }
    }

    // If it's an assistant message (manual), just return it
    res.status(201).json({ userMessage: formattedMessage });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Delete conversation
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    // Check if conversation exists and belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Delete conversation (messages will be cascade deleted based on schema)
    await prisma.conversation.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// Update conversation title
router.put('/:id', verifyUser, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    // Check if conversation exists and belongs to user
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.userId
      }
    });

    if (!existingConversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Update conversation
    const conversation = await prisma.conversation.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        updatedAt: new Date()
      }
    });

    // Format response
    const formattedConversation = {
      id: conversation.id,
      user_id: conversation.userId,
      character_id: conversation.characterId,
      title: conversation.title,
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt
    };

    res.json(formattedConversation);
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

module.exports = router;
