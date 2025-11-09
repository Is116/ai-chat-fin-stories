const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

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
router.get('/', (req, res) => {
  try {
    const characters = db.prepare(`
      SELECT 
        c.*,
        b.title as book_title,
        b.author as book_author,
        b.description as book_description,
        b.cover_image as book_cover_image,
        b.published_year,
        b.genre
      FROM characters c
      JOIN books b ON c.book_id = b.id
      ORDER BY b.title, c.name
    `).all();
    
    res.json(characters);
  } catch (error) {
    console.error('Get characters error:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// Get single character (public)
router.get('/:id', (req, res) => {
  try {
    const character = db.prepare(`
      SELECT 
        c.*,
        b.title as book_title,
        b.author as book_author,
        b.description as book_description,
        b.cover_image as book_cover_image,
        b.published_year,
        b.genre
      FROM characters c
      JOIN books b ON c.book_id = b.id
      WHERE c.id = ?
    `).get(req.params.id);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json(character);
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

// Create character (protected)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  const { name, book_id, personality, avatar, color, greeting } = req.body;

  if (!name || !book_id || !personality || !color || !greeting) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify book exists
    const book = db.prepare('SELECT id FROM books WHERE id = ?').get(book_id);
    if (!book) {
      return res.status(400).json({ error: 'Invalid book_id' });
    }

    // Get image path if file was uploaded
    const imagePath = req.file ? `/characters/${req.file.filename}` : '';

    const insert = db.prepare(`
      INSERT INTO characters (name, book_id, personality, avatar, image, color, greeting)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = insert.run(name, book_id, personality, avatar || '', imagePath, color, greeting);
    
    const newCharacter = db.prepare(`
      SELECT 
        c.*,
        b.title as book_title,
        b.author as book_author
      FROM characters c
      JOIN books b ON c.book_id = b.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);
    
    res.status(201).json(newCharacter);
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// Update character (protected)
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  const { name, book_id, personality, avatar, color, greeting } = req.body;

  try {
    // Get existing character to check for old image
    const existingCharacter = db.prepare('SELECT image FROM characters WHERE id = ?').get(req.params.id);
    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Verify book exists if book_id is being changed
    if (book_id) {
      const book = db.prepare('SELECT id FROM books WHERE id = ?').get(book_id);
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

    const update = db.prepare(`
      UPDATE characters 
      SET name = ?, book_id = ?, personality = ?, avatar = ?, image = ?, color = ?, greeting = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = update.run(name, book_id, personality, avatar || '', imagePath, color, greeting, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const updatedCharacter = db.prepare(`
      SELECT 
        c.*,
        b.title as book_title,
        b.author as book_author
      FROM characters c
      JOIN books b ON c.book_id = b.id
      WHERE c.id = ?
    `).get(req.params.id);
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// Delete character (protected)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const deleteStmt = db.prepare('DELETE FROM characters WHERE id = ?');
    const result = deleteStmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

module.exports = router;
