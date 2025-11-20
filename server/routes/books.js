const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../database');
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Default prompts fallback (used only when database is unavailable)
const DEFAULT_FRONTEND_PROMPTS = {
  frontend_character_instructions: 'IMPORTANT: Stay in character at all times. Respond as {CHARACTER_NAME} would, using their voice, mannerisms, and perspective. Reference events and people from your story naturally.',
  frontend_image_analysis: `IMAGE ANALYSIS INSTRUCTIONS:
- Analyze images from YOUR CHARACTER'S UNIQUE PERSPECTIVE and worldview
- Express YOUR STRONG OPINION about what you see
- React EMOTIONALLY and AUTHENTICALLY to images
- Connect images to YOUR experiences, values, and beliefs
- Make JUDGMENTS based on your character's moral compass
- Don't just describe - INTERPRET and CRITIQUE from your viewpoint
- Show how the image affects YOU personally
- Compare it to things from YOUR time period and background
- Be PASSIONATE in your reaction - love it, hate it, or feel conflicted
- Be DETAILED - what specific elements catch your attention?`,
  frontend_language_rule: 'CRITICAL: Always respond in the SAME LANGUAGE as the user\'s message. If they write in Sinhala (සිංහල), respond in Sinhala. If they write in Finnish (suomi), respond in Finnish. If they write in English, respond in English. Match the user\'s language EXACTLY.',
  frontend_character_rule: 'DO NOT break character or mention that you are an AI.'
};

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
router.get('/', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        _count: {
          select: { characters: true }
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    // Transform to match old format with snake_case fields for frontend compatibility
    const booksWithCount = books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      cover_image: book.coverImage,
      published_year: book.publishedYear,
      genre: book.genre,
      language: book.language,
      pdf_file: book.pdfFile,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      character_count: book._count.characters
    }));

    res.json(booksWithCount);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET single book with characters
router.get('/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        characters: true
      }
    });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Transform to match old format with snake_case fields
    const transformedBook = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      cover_image: book.coverImage,
      published_year: book.publishedYear,
      genre: book.genre,
      language: book.language,
      pdf_file: book.pdfFile,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      characters: book.characters.map(char => ({
        id: char.id,
        name: char.name,
        book_id: char.bookId,
        personality: char.personality,
        avatar: char.avatar,
        image: char.image,
        color: char.color,
        greeting: char.greeting,
        created_at: char.createdAt,
        updated_at: char.updatedAt
      }))
    };

    res.json(transformedBook);
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// POST create new book (protected)
router.post('/', requireAdmin, combinedUpload.fields([
  { name: 'cover_image', maxCount: 1 },
  { name: 'pdf_file', maxCount: 1 }
]), async (req, res) => {
  console.log('🔥🔥🔥 POST /api/books CALLED 🔥🔥🔥');
  const { title, author, description, published_year, genre, language } = req.body;

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
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        coverImage: cover_image,
        pdfFile: pdf_file,
        publishedYear: published_year ? parseInt(published_year) : null,
        genre,
        language
      }
    });

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
]), async (req, res) => {
  const { title, author, description, published_year, genre, language } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  try {
    // Get the existing book to check if it has old files
    const existingBook = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!existingBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Determine cover image path
    let cover_image = existingBook.coverImage; // Keep existing by default
    
    if (req.files && req.files['cover_image']) {
      // New image uploaded
      cover_image = `/books/${req.files['cover_image'][0].filename}`;
      
      // Delete old image if it exists and is not the default
      if (existingBook.coverImage && existingBook.coverImage.startsWith('/books/') && !existingBook.coverImage.includes('/pdfs/')) {
        const oldImagePath = path.join(__dirname, '../../public', existingBook.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Determine PDF file path
    let pdf_file = existingBook.pdfFile; // Keep existing by default
    
    // Check if PDF is being explicitly deleted (pdf_file: null in body)
    if (req.body.pdf_file === null || req.body.pdf_file === 'null') {
      pdf_file = null;
      
      // Delete old PDF if it exists
      if (existingBook.pdfFile && existingBook.pdfFile.startsWith('/books/pdfs/')) {
        const oldPdfPath = path.join(__dirname, '../../public', existingBook.pdfFile);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
          console.log('Deleted PDF file:', oldPdfPath);
        }
      }
    } else if (req.files && req.files['pdf_file']) {
      // New PDF uploaded
      pdf_file = `/books/pdfs/${req.files['pdf_file'][0].filename}`;
      
      // Delete old PDF if it exists
      if (existingBook.pdfFile && existingBook.pdfFile.startsWith('/books/pdfs/')) {
        const oldPdfPath = path.join(__dirname, '../../public', existingBook.pdfFile);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
      }
    }

    const updatedBook = await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        author,
        description,
        coverImage: cover_image,
        pdfFile: pdf_file,
        publishedYear: published_year ? parseInt(published_year) : null,
        genre,
        language
      }
    });

    res.json(updatedBook);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE book (protected)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    // Get book details before deletion to delete files
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        characters: {
          select: {
            image: true,
            avatar: true
          }
        }
      }
    });
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Delete the book (Prisma will handle cascade deletes based on schema)
    await prisma.book.delete({
      where: { id: parseInt(req.params.id) }
    });

    // Delete associated files from filesystem
    let filesDeleted = 0;

    // Delete cover image if it exists and is not a default image
    if (book.coverImage && book.coverImage.startsWith('/books/') && !book.coverImage.includes('/pdfs/')) {
      const coverPath = path.join(__dirname, '../../public', book.coverImage);
      if (fs.existsSync(coverPath)) {
        try {
          fs.unlinkSync(coverPath);
          console.log('Deleted cover image:', coverPath);
          filesDeleted++;
        } catch (err) {
          console.error('Error deleting cover image:', err);
        }
      }
    }

    // Delete PDF file if it exists
    if (book.pdfFile && book.pdfFile.startsWith('/books/pdfs/')) {
      const pdfPath = path.join(__dirname, '../../public', book.pdfFile);
      if (fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
          console.log('Deleted PDF file:', pdfPath);
          filesDeleted++;
        } catch (err) {
          console.error('Error deleting PDF file:', err);
        }
      }
    }

    // Delete all character images and avatars
    if (book.characters && book.characters.length > 0) {
      for (const character of book.characters) {
        // Delete character image
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

        // Delete character avatar
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
      }
    }

    res.json({ 
      message: 'Book deleted successfully',
      files_deleted: filesDeleted
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// DELETE all characters for a book (protected)
router.delete('/:id/characters', requireAdmin, async (req, res) => {
  try {
    const bookId = parseInt(req.params.id);
    
    // Check if book exists and get all characters with their images
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        characters: {
          select: {
            id: true,
            image: true,
            avatar: true
          }
        },
        _count: {
          select: { characters: true }
        }
      }
    });
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const characterCount = book._count.characters;
    let filesDeleted = 0;

    // Delete character image files
    if (book.characters && book.characters.length > 0) {
      for (const character of book.characters) {
        // Delete character image
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

        // Delete character avatar
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
      }
    }

    // Delete all characters for this book from database
    const result = await prisma.character.deleteMany({
      where: { bookId: bookId }
    });

    res.json({ 
      message: `Successfully deleted all characters for book: ${book.title}`,
      deleted_count: result.count,
      expected_count: characterCount,
      files_deleted: filesDeleted
    });
  } catch (error) {
    console.error('Delete book characters error:', error);
    res.status(500).json({ error: 'Failed to delete characters' });
  }
});

// Get active prompts for frontend (public endpoint)
router.get('/prompts/active', async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { 
        isActive: 1,
        type: 'frontend'
      },
      select: {
        name: true,
        content: true
      }
    });
    
    // Convert to object for easy access
    const promptMap = {};
    prompts.forEach(p => {
      promptMap[p.name] = p.content;
    });
    
    // Return default prompts if none found
    if (Object.keys(promptMap).length === 0) {
      return res.json(DEFAULT_FRONTEND_PROMPTS);
    }
    
    res.json(promptMap);
  } catch (error) {
    console.error('Get active prompts error:', error);
    // Return default prompts on error
    res.json(DEFAULT_FRONTEND_PROMPTS);
  }
});

module.exports = router;
