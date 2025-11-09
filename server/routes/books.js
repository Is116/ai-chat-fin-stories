const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

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
router.post('/', authMiddleware, combinedUpload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]), (req, res) => {
  const { title, author, description, published_year, genre } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  // Get cover image path if uploaded
  let cover_image = req.body.cover_image_url || null;
  if (req.files && req.files['cover_image']) {
    cover_image = `/books/${req.files['cover_image'][0].filename}`;
  }

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
router.put('/:id', authMiddleware, combinedUpload.fields([
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
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    // Check if book has characters
    const characterCount = db.prepare('SELECT COUNT(*) as count FROM characters WHERE book_id = ?')
      .get(req.params.id).count;

    if (characterCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete book with ${characterCount} character(s). Delete characters first.` 
      });
    }

    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
