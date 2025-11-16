const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for book cover image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/books');
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
    cb(null, 'book-cover-' + uniqueSuffix + ext);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
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

// Configure multer for PDF uploads with larger file size limit
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/books/pdfs');
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
    cb(null, 'book-' + uniqueSuffix + ext);
  }
});

const pdfUpload = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (ext === '.pdf' && mimetype === 'application/pdf') {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Combined upload for both cover image and PDF
const combinedUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      if (file.mimetype === 'application/pdf') {
        uploadDir = path.join(__dirname, '../../public/books/pdfs');
      } else {
        uploadDir = path.join(__dirname, '../../public/books');
      }
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const prefix = file.mimetype === 'application/pdf' ? 'book-' : 'book-cover-';
      cb(null, prefix + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Allow images
    const imageTypes = /jpeg|jpg|png|gif|webp|svg/;
    if (imageTypes.test(ext.substring(1)) && imageTypes.test(mimetype)) {
      return cb(null, true);
    }
    
    // Allow PDFs
    if (ext === '.pdf' && mimetype === 'application/pdf') {
      return cb(null, true);
    }
    
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP, SVG) and PDF files are allowed'));
  }
});

// GET all books with character counts
router.get('/', (req, res) => {
  try {
    const books = db.prepare(`
      SELECT 
        b.*,
        COUNT(c.id) as character_count
      FROM books b
      LEFT JOIN characters c ON b.id = c.book_id
      GROUP BY b.id
      ORDER BY b.title
    `).all();

    res.json(books);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET single book with characters
router.get('/:id', (req, res) => {
  try {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get characters for this book
    const characters = db.prepare('SELECT * FROM characters WHERE book_id = ?').all(req.params.id);

    res.json({
      ...book,
      characters
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST create new book (protected)
router.post('/', requireAdmin, combinedUpload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]), (req, res) => {
  console.log('🔥🔥🔥 POST /api/books CALLED 🔥🔥🔥');
  const { title, author, description, published_year, genre } = req.body;

  console.log('📥 Create book request body:', req.body);
  console.log('📁 Files:', req.files);

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  // Get cover image path - check multiple sources
  let cover_image = req.body.cover_image || req.body.cover_image_url || null;
  console.log('📝 cover_image from req.body:', req.body.cover_image);
  console.log('📝 cover_image_url from req.body:', req.body.cover_image_url);
  
  if (req.files && req.files['cover_image']) {
    cover_image = `/books/${req.files['cover_image'][0].filename}`;
    console.log('📝 cover_image from uploaded file:', cover_image);
  }
  
  console.log('🖼️  Final cover_image value:', cover_image);

  // Get PDF file path if uploaded
  let pdf_file = null;
  if (req.files && req.files['pdf_file']) {
    pdf_file = `/books/pdfs/${req.files['pdf_file'][0].filename}`;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, description, cover_image, pdf_file, published_year, genre)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, author, description, cover_image, pdf_file, published_year, genre);

    const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(newBook);
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Failed to create book' });
  }
});

// PUT update book (protected)
router.put('/:id', requireAdmin, combinedUpload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]), (req, res) => {
  const { title, author, description, published_year, genre } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  try {
    // Get the existing book to check if it has old files
    const existingBook = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Determine cover image path
    let cover_image = existingBook.cover_image; // Keep existing by default
    
    if (req.files && req.files['cover_image']) {
      // New image uploaded
      cover_image = `/books/${req.files['cover_image'][0].filename}`;
      
      // Delete old image if it exists and is not the default
      if (existingBook.cover_image && existingBook.cover_image.startsWith('/books/') && !existingBook.cover_image.includes('/pdfs/')) {
        const oldImagePath = path.join(__dirname, '../../public', existingBook.cover_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Determine PDF file path
    let pdf_file = existingBook.pdf_file; // Keep existing by default
    
    // Check if PDF is being explicitly deleted (pdf_file: null in body)
    if (req.body.pdf_file === null || req.body.pdf_file === 'null') {
      pdf_file = null;
      
      // Delete old PDF if it exists
      if (existingBook.pdf_file && existingBook.pdf_file.startsWith('/books/pdfs/')) {
        const oldPdfPath = path.join(__dirname, '../../public', existingBook.pdf_file);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
          console.log('Deleted PDF file:', oldPdfPath);
        }
      }
    } else if (req.files && req.files['pdf_file']) {
      // New PDF uploaded
      pdf_file = `/books/pdfs/${req.files['pdf_file'][0].filename}`;
      
      // Delete old PDF if it exists
      if (existingBook.pdf_file && existingBook.pdf_file.startsWith('/books/pdfs/')) {
        const oldPdfPath = path.join(__dirname, '../../public', existingBook.pdf_file);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
      }
    }

    const stmt = db.prepare(`
      UPDATE books
      SET title = ?, author = ?, description = ?, cover_image = ?, pdf_file = ?,
          published_year = ?, genre = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(title, author, description, cover_image, pdf_file, published_year, genre, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);

    res.json(updatedBook);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE book (protected)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    // Get book details before deletion to delete files
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get all characters associated with this book
    const characters = db.prepare('SELECT id FROM characters WHERE book_id = ?').all(req.params.id);
    const characterIds = characters.map(c => c.id);

    // Delete in proper order to avoid foreign key constraints
    // 1. Delete character personas for these characters
    if (characterIds.length > 0) {
      const placeholders = characterIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM character_personas WHERE character_id IN (${placeholders})`).run(...characterIds);
    }

    // 2. Delete extracted characters for this book
    db.prepare('DELETE FROM extracted_characters WHERE book_id = ?').run(req.params.id);

    // 3. Delete book chunks
    db.prepare('DELETE FROM book_chunks WHERE book_id = ?').run(req.params.id);

    // 4. Delete messages in conversations with these characters
    if (characterIds.length > 0) {
      const conversations = db.prepare(`
        SELECT id FROM conversations WHERE character_id IN (${characterIds.map(() => '?').join(',')})
      `).all(...characterIds);
      
      const conversationIds = conversations.map(c => c.id);
      if (conversationIds.length > 0) {
        const convPlaceholders = conversationIds.map(() => '?').join(',');
        db.prepare(`DELETE FROM messages WHERE conversation_id IN (${convPlaceholders})`).run(...conversationIds);
        db.prepare(`DELETE FROM conversations WHERE id IN (${convPlaceholders})`).run(...conversationIds);
      }
    }

    // 5. Delete characters
    db.prepare('DELETE FROM characters WHERE book_id = ?').run(req.params.id);

    // 6. Delete the book itself
    const deleteBookStmt = db.prepare('DELETE FROM books WHERE id = ?');
    const result = deleteBookStmt.run(req.params.id);

    // 7. Delete associated files from filesystem
    // Delete cover image if it exists and is not a default image
    if (book.cover_image && book.cover_image.startsWith('/books/') && !book.cover_image.includes('/pdfs/')) {
      const coverPath = path.join(__dirname, '../../public', book.cover_image);
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
          console.log('Deleted cover image:', coverPath);
        } catch (err) {
          console.error('Error deleting cover image:', err);
        }
      }
    }

    // Delete PDF file if it exists
    if (book.pdf_file && book.pdf_file.startsWith('/books/pdfs/')) {
      const pdfPath = path.join(__dirname, '../../public', book.pdf_file);
      if (fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
          console.log('Deleted PDF file:', pdfPath);
        } catch (err) {
          console.error('Error deleting PDF file:', err);
        }
      }
    }

    res.json({ 
      message: 'Book deleted successfully',
      deleted: {
        book_id: req.params.id,
        characters_deleted: characters.length,
        files_deleted: true
      }
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
