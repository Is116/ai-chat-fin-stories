const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../database');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/characters');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'character-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)'));
    }
  }
});

// Get all characters (public)
router.get('/', async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      include: {
        book: {
          select: {
            title: true,
            author: true,
            description: true,
            coverImage: true,
            publishedYear: true,
            genre: true
          }
        },
        extractedCharacters: {
          select: {
            description: true
          },
          take: 1
        }
      },
      orderBy: [
        { book: { title: 'asc' } },
        { name: 'asc' }
      ]
    });

    // Transform to match old format
    const formattedCharacters = characters.map(c => ({
      ...c,
      book_title: c.book.title,
      book_author: c.book.author,
      book_description: c.book.description,
      book_cover_image: c.book.coverImage,
      published_year: c.book.publishedYear,
      genre: c.book.genre,
      description: c.extractedCharacters[0]?.description || null,
      extractedCharacters: undefined,
      book: undefined
    }));

    res.json(formattedCharacters);
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get single character (public)
router.get('/:id', async (req, res) => {
  try {
    const character = await prisma.character.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            description: true,
            coverImage: true,
            publishedYear: true,
            genre: true
          }
        },
        extractedCharacters: {
          select: {
            description: true
          },
          take: 1
        }
      }
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Transform to match old format
    const formattedCharacter = {
      ...character,
      book_title: character.book.title,
      book_author: character.book.author,
      book_description: character.book.description,
      book_cover_image: character.book.coverImage,
      published_year: character.book.publishedYear,
      genre: character.book.genre,
      description: character.extractedCharacters[0]?.description || null,
      extractedCharacters: undefined,
      book: undefined
    };
    
    res.json(formattedCharacter);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Create character (protected)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, book_id, personality, avatar, color, greeting } = req.body;

  if (!name || !book_id || !personality || !color || !greeting) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id: parseInt(book_id) }
    });
    
    if (!book) {
      return res.status(400).json({ error: 'Invalid book_id' });
    }

    // Get image path if file was uploaded
    const imagePath = req.file ? `/characters/${req.file.filename}` : '';

    const newCharacter = await prisma.character.create({
      data: {
        name,
        bookId: parseInt(book_id),
        personality,
        avatar: avatar || '',
        image: imagePath,
        color,
        greeting
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    });

    // Transform to match old format
    const formattedCharacter = {
      ...newCharacter,
      book_title: newCharacter.book.title,
      book_author: newCharacter.book.author,
      book: undefined
    };
    
    res.status(201).json(formattedCharacter);
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character (protected)
router.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, book_id, personality, avatar, color, greeting } = req.body;

  try {
    // Get existing character to check for old image
    const existingCharacter = await prisma.character.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Verify book exists if book_id is being changed
    if (book_id) {
      const book = await prisma.book.findUnique({
        where: { id: parseInt(book_id) }
      });
      
      if (!book) {
        return res.status(400).json({ error: 'Invalid book_id' });
      }
    }

    // Determine image path
    let imagePath = existingCharacter.image; // Keep existing image by default
    
    if (req.file) {
      // New file uploaded
      imagePath = `/characters/${req.file.filename}`;
      
      // Delete old image file if it exists and is not a default image
      if (existingCharacter.image && existingCharacter.image.startsWith('/characters/character-')) {
        const oldImagePath = path.join(__dirname, '../../public', existingCharacter.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedCharacter = await prisma.character.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        bookId: parseInt(book_id),
        personality,
        avatar: avatar || '',
        image: imagePath,
        color,
        greeting
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    });

    // Transform to match old format
    const formattedCharacter = {
      ...updatedCharacter,
      book_title: updatedCharacter.book.title,
      book_author: updatedCharacter.book.author,
      book: undefined
    };
    
    res.json(formattedCharacter);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Delete character (protected)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    // Get character details before deletion to delete files
    const character = await prisma.character.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Delete the character (Prisma will handle cascade deletes)
    await prisma.character.delete({
      where: { id: parseInt(req.params.id) }
    });

    let filesDeleted = 0;

    // Delete character image file if it exists and is not a default SVG
    if (character.image && character.image.startsWith('/characters/')) {
      const imagePath = path.join(__dirname, '../../public', character.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log('Deleted character image:', imagePath);
          filesDeleted++;
        } catch (err) {
          console.error('Error deleting character image:', err);
        }
      }
    }

    // Delete character avatar file if it exists
    if (character.avatar && character.avatar.startsWith('/characters/')) {
      const avatarPath = path.join(__dirname, '../../public', character.avatar);
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
          console.log('Deleted character avatar:', avatarPath);
          filesDeleted++;
        } catch (err) {
          console.error('Error deleting character avatar:', err);
        }
      }
    }
    
    res.json({ 
      message: 'Character deleted successfully',
      files_deleted: filesDeleted
    });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

module.exports = router;
