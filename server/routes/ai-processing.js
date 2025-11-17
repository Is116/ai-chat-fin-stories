const express = require('express');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { processBook } = require('../services/book-processor');
const { extractCharactersFromBook, getExtractedCharacters, approveExtractedCharacter } = require('../services/character-extractor');
const { generateCharacterPersona, getCharacterPersona, generateAllPersonasForBook } = require('../services/persona-generator');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Configure multer for PDF uploads (memory storage for analysis)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'admin') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    req.adminId = decoded.id;
    req.username = decoded.username;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


async function downloadCharacterImage(characterName, bookTitle) {
  try {
    // Use DiceBear API for consistent, unique character avatars
    // Style options: adventurer, avataaars, bottts, personas, lorelei
    const encodedName = encodeURIComponent(characterName);
    const seed = `${characterName}-${bookTitle}`;
    const encodedSeed = encodeURIComponent(seed);
    
    // Use DiceBear's "personas" style for literary characters
    const dicebearUrl = `https://api.dicebear.com/7.x/personas/png?seed=${encodedSeed}&size=400`;
    
    return new Promise((resolve, reject) => {
      https.get(dicebearUrl, (response) => {
        if (response.statusCode !== 200) {
          console.log(`DiceBear failed with status ${response.statusCode}, trying fallback...`);
          // Fallback to UI Avatars
          const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodedName}&size=400&background=random&bold=true`;
          
          https.get(uiAvatarUrl, (fallbackResponse) => {
            if (fallbackResponse.statusCode !== 200) {
              return resolve(null);
            }
            
            const filename = `character-${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
            const filepath = path.join(__dirname, '../../public/characters', filename);
            
            const dir = path.dirname(filepath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            const fileStream = fs.createWriteStream(filepath);
            fallbackResponse.pipe(fileStream);
            
            fileStream.on('finish', () => {
              fileStream.close();
              resolve(`/characters/${filename}`);
            });

            fileStream.on('error', (err) => {
              console.error('Error writing fallback image:', err);
              fs.unlink(filepath, () => {});
              resolve(null);
            });
          }).on('error', () => resolve(null));
          
          return;
        }

        // Generate unique filename
        const filename = `character-${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
        const filepath = path.join(__dirname, '../../public/characters', filename);
        
        // Ensure directory exists
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const fileStream = fs.createWriteStream(filepath);
        
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(`/characters/${filename}`);
        });

        fileStream.on('error', (err) => {
          console.error('Error writing image file:', err);
          fs.unlink(filepath, () => {}); // Delete partial file
          resolve(null);
        });
      }).on('error', (err) => {
        console.error('Error downloading from DiceBear:', err);
        resolve(null);
      });
    });
  } catch (error) {
    console.error('Error in downloadCharacterImage:', error);
    return null;
  }
}


router.post('/analyze-book-metadata', verifyAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('📖 Analyzing PDF for metadata extraction...');
    
    // Import required services
    const { PDFParse } = require('pdf-parse');
    const { getGeminiAI } = require('../config/google-cloud');

    // Extract text from PDF buffer
    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const bookText = result.text;

    if (!bookText || bookText.length === 0) {
      return res.status(400).json({ error: 'No text found in PDF' });
    }

    console.log(`Extracted ${bookText.length} characters from PDF`);

    // Use first 3000 characters for metadata analysis
    const sampleText = bookText.substring(0, 3000);

    // Use Gemini AI to extract metadata
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `Analyze this book excerpt and extract metadata. The book can be in ANY language (English, Sinhala, Finnish, Spanish, etc.). 

Return ONLY a JSON object with these fields:

{
  "title": "exact book title in its original language",
  "author": "author name in its original language", 
  "description": "2-3 sentence description in the SAME language as the book",
  "genre": "primary genre in English (e.g., Fiction, Mystery, Romance, Science Fiction, Fantasy, Classic Literature, etc.)",
  "published_year": "year as number (e.g., 1897) or estimated year if exact year unknown",
  "language": "detected language of the book (e.g., 'English', 'Sinhala', 'Finnish', 'Spanish', etc.)"
}

CRITICAL RULES - NEVER return null values:
1. If title is not found, create a descriptive title based on the main theme/topic in the book's language
2. If author is not found, use "Unknown Author" in the book's language (e.g., "නොදන්නා කතුවරයා" for Sinhala, "Tuntematon kirjailija" for Finnish)
3. If published_year is not found, estimate based on writing style, language, and themes (modern books: 2000-2024, classic books: 1800-1950, contemporary: 1950-2000)
4. Description must always be 2-3 sentences summarizing the main content IN THE BOOK'S ORIGINAL LANGUAGE
5. Detect the language accurately - this is critical for multilingual support

Important: Keep title, author, and description in the ORIGINAL LANGUAGE of the book.

Book excerpt:
${sampleText}

Return only the JSON object, no other text. NEVER use null for any field.`;

    console.log('Calling AI to extract metadata...');
    const aiResult = await model.generateContent(prompt);
    const responseText = aiResult.response.text();
    
    console.log('AI Response:', responseText.substring(0, 500));

    // Extract JSON from response
    let jsonText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('No JSON found in AI response');
      return res.status(500).json({ error: 'Failed to extract metadata from AI response' });
    }

    const metadata = JSON.parse(jsonMatch[0]);
    
    // Apply intelligent fallbacks based on detected language
    const detectedLanguage = metadata.language || 'English';
    
    // Language-specific fallbacks
    const fallbacks = {
      'Sinhala': {
        author: 'නොදන්නා කතුවරයා',
        title: 'නිර්නාමික පොත',
        description: 'මෙම පොත පිළිබඳ සවිස්තර තොරතුරු ලබා ගත නොහැකි විය.'
      },
      'Finnish': {
        author: 'Tuntematon kirjailija',
        title: 'Nimetön kirja',
        description: 'Yksityiskohtaisia tietoja tästä kirjasta ei ollut saatavilla.'
      },
      'Spanish': {
        author: 'Autor desconocido',
        title: 'Libro sin título',
        description: 'No se pudo obtener información detallada sobre este libro.'
      },
      'French': {
        author: 'Auteur inconnu',
        title: 'Livre sans titre',
        description: 'Les informations détaillées sur ce livre n\'ont pas pu être obtenues.'
      },
      'German': {
        author: 'Unbekannter Autor',
        title: 'Unbenanntes Buch',
        description: 'Detaillierte Informationen zu diesem Buch konnten nicht abgerufen werden.'
      },
      'default': {
        author: 'Unknown Author',
        title: 'Untitled Book',
        description: 'Detailed information about this book could not be extracted.'
      }
    };
    
    const languageFallback = fallbacks[detectedLanguage] || fallbacks['default'];
    
    // Apply fallbacks only if values are null/empty
    metadata.title = metadata.title || languageFallback.title;
    metadata.author = metadata.author || languageFallback.author;
    metadata.description = metadata.description || languageFallback.description;
    metadata.genre = metadata.genre || 'General';
    metadata.published_year = metadata.published_year || new Date().getFullYear();
    metadata.language = detectedLanguage;
    
    console.log('Extracted metadata:', metadata);

    // Generate book cover with title and author
    console.log('Creating book cover image...');
    const coverUrl = await generateBookCoverFromPdf(req.file.buffer, metadata.title, metadata.author);
    
    if (coverUrl) {
      console.log('Cover image created successfully:', coverUrl);
    } else {
      console.log('Cover creation failed, book will have no cover');
    }

    // Return the extracted metadata with cover image
    // Return the extracted metadata with cover image (all fields guaranteed to have values)
    res.json({
      success: true,
      title: metadata.title,
      author: metadata.author,
      description: metadata.description,
      genre: metadata.genre,
      published_year: metadata.published_year,
      language: metadata.language,
      cover_image: coverUrl || ''
    });

  } catch (error) {
    console.error('Error analyzing PDF metadata:', error);
    res.status(500).json({ error: error.message });
  }
});



async function generateBookCoverFromPdf(pdfBuffer, title, author) {
  try {
    const { createCanvas } = require('canvas');
    
    // Handle null or empty title/author
    const bookTitle = title || 'Untitled Book';
    const bookAuthor = author || 'Unknown Author';
    
    // Create a nice book cover with canvas
    const width = 400;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Generate a color based on the title
    const colors = [
      { bg: '#2C3E50', text: '#ECF0F1' }, // Dark blue
      { bg: '#8E44AD', text: '#ECF0F1' }, // Purple
      { bg: '#27AE60', text: '#ECF0F1' }, // Green
      { bg: '#E74C3C', text: '#ECF0F1' }, // Red
      { bg: '#3498DB', text: '#ECF0F1' }, // Blue
      { bg: '#F39C12', text: '#2C3E50' }, // Orange
      { bg: '#1ABC9C', text: '#ECF0F1' }, // Turquoise
      { bg: '#C0392B', text: '#ECF0F1' }, // Dark red
    ];
    
    const colorIndex = (bookTitle.charCodeAt(0) + bookTitle.length) % colors.length;
    const color = colors[colorIndex];
    
    // Background
    ctx.fillStyle = color.bg;
    ctx.fillRect(0, 0, width, height);
    
    // Add decorative border
    ctx.strokeStyle = color.text;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, width - 40, height - 40);
    
    // Title
    ctx.fillStyle = color.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap title text
    const maxWidth = width - 60;
    const lineHeight = 50;
    let fontSize = 40;
    ctx.font = `bold ${fontSize}px serif`;
    
    const words = bookTitle.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    
    // Draw title lines
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });
    
    // Author
    ctx.font = 'italic 24px serif';
    ctx.fillText(bookAuthor, width / 2, height - 80);
    
    // Save canvas to file
    const filename = `book-cover-${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
    const filepath = path.join(__dirname, '../../public/books', filename);
    
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write PNG file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    console.log(`✅ Cover image created: ${filename}`);
    return `/books/${filename}`;
    
  } catch (error) {
    console.error('❌ Error creating book cover:', error);
    return null;
  }
}


router.post('/process-and-generate/:bookId', verifyAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get(bookId);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!book.pdf_file) {
      return res.status(400).json({ error: 'Book has no PDF file' });
    }

    // Import required services
    const { extractTextFromPDF } = require('../services/book-processor');
    const path = require('path');
    const { getGeminiAI } = require('../config/google-cloud');

    // Step 1: Extract text from PDF
    console.log(`Step 1: Extracting text from PDF for book ${bookId}...`);
    const pdfPath = path.join(__dirname, '..', '..', book.pdf_file.replace('/books/pdfs/', 'public/books/pdfs/'));
    
    const bookText = await extractTextFromPDF(pdfPath);

    if (!bookText || bookText.length === 0) {
      return res.status(400).json({ error: 'No text found in PDF' });
    }

    console.log(`Extracted ${bookText.length} characters from PDF`);

    // Step 2: Use AI to extract characters
    console.log(`Step 2: Using AI to identify characters...`);
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 4096, // Increased token limit
      }
    });

    // Use smaller text sample to avoid token limits
    const sampleText = bookText.substring(0, 10000);
    
    // Detect book language
    const bookLanguage = book.genre ? 'the original language of the book' : 'English';
    
    const prompt = `Analyze this book: "${book.title}" by ${book.author || 'Unknown'}.

IMPORTANT: This book may be in ANY language (English, Sinhala, Finnish, Spanish, etc.). Identify the language and provide ALL information in that SAME language.

List the 5 main characters from this book.

For each character provide:
- name: full character name (in the book's original language)
- description: one sentence description (in the book's original language)

Return as JSON array with NO other text:
[{"name":"Character Name","description":"Description in book's language"}]

Text sample:
${sampleText}`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    
    // Check for blocked content
    if (result.response.promptFeedback?.blockReason) {
      console.error('Content blocked:', result.response.promptFeedback.blockReason);
      return res.status(500).json({ 
        error: `AI blocked the request: ${result.response.promptFeedback.blockReason}` 
      });
    }

    const responseText = result.response.text();
    console.log('AI Response:', responseText.substring(0, 500));
    
    if (!responseText || responseText.trim().length === 0) {
      console.error('Empty response from AI');
      console.error('Full response object:', JSON.stringify(result.response, null, 2));
      return res.status(500).json({ error: 'AI returned empty response' });
    }
    
    // Extract JSON from response
    let jsonText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      console.error('Full AI Response:', responseText);
      return res.status(500).json({ error: 'Failed to extract characters from AI response' });
    }

    const characters = JSON.parse(jsonMatch[0]);
    console.log(`AI identified ${characters.length} characters`);

    // Step 3: Create characters in database
    console.log(`Step 3: Creating characters in database...`);
    const insertStmt = db.prepare(
      `INSERT INTO characters (book_id, name, personality, color, greeting, image, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    );

    const colors = ['from-blue-600 to-blue-700', 'from-purple-600 to-purple-700', 'from-green-600 to-green-700', 'from-pink-600 to-pink-700', 'from-amber-600 to-amber-700'];
    
    // Generate multilingual greetings based on the first character's description language
    const isEnglish = /^[a-zA-Z\s,.!?'-]+$/.test(characters[0]?.description || '');
    const greetings = isEnglish ? [
      'Hello, I am delighted to make your acquaintance.',
      'Greetings! What brings you to me today?',
      'Welcome! I am pleased to speak with you.',
      'Good day to you! How may I assist?',
      'Ah, a visitor! What would you like to discuss?'
    ] : [
      // Use generic greetings that work in any language
      '👋',
      '✨',
      '📖',
      '💬',
      '🌟'
    ];

    const createdCharacters = [];
    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      
      // Download character image
      console.log(`Downloading image for ${char.name}...`);
      const imagePath = await downloadCharacterImage(char.name, book.title);
      
      if (imagePath) {
        console.log(`Image downloaded: ${imagePath}`);
      } else {
        console.log(`Using default image for ${char.name}`);
      }
      
      const result = insertStmt.run(
        bookId, 
        char.name, 
        char.description,
        colors[i % colors.length],
        greetings[i % greetings.length],
        imagePath || '/book.svg' // Use downloaded image or fallback
      );
      createdCharacters.push({
        id: result.lastInsertRowid,
        name: char.name,
        personality: char.description,
        image: imagePath || '/book.svg'
      });
      console.log(`Created character: ${char.name}`);
    }

    res.json({
      success: true,
      message: `Successfully created ${createdCharacters.length} characters`,
      characters: createdCharacters
    });

  } catch (error) {
    console.error('Error in process-and-generate:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/process-book/:bookId', verifyAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get(bookId);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!book.pdf_file) {
      return res.status(400).json({ error: 'Book has no PDF file' });
    }

    const filePath = book.pdf_file.replace('/books/pdfs/', './public/books/pdfs/');

    // Process book in background
    processBook(bookId, filePath)
      .then(result => {
        console.log('Book processing completed:', result);
      })
      .catch(error => {
        console.error('Book processing failed:', error);
      });

    res.json({
      message: 'Book processing started',
      bookId,
      status: 'processing'
    });

  } catch (error) {
    console.error('Error starting book processing:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/extract-characters/:bookId', verifyAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Extract characters in background
    extractCharactersFromBook(bookId)
      .then(result => {
        console.log('Character extraction completed:', result);
      })
      .catch(error => {
        console.error('Character extraction failed:', error);
      });

    res.json({
      message: 'Character extraction started',
      bookId,
      status: 'extracting_characters'
    });

  } catch (error) {
    console.error('Error starting character extraction:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/extracted-characters/:bookId', verifyAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;
    const characters = getExtractedCharacters(bookId);
    
    res.json(characters);

  } catch (error) {
    console.error('Error getting extracted characters:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/approve-character/:extractedCharacterId', verifyAdmin, async (req, res) => {
  try {
    const { extractedCharacterId } = req.params;
    const additionalData = req.body;

    const characterId = approveExtractedCharacter(extractedCharacterId, additionalData);
    
    res.json({
      message: 'Character approved',
      characterId
    });

  } catch (error) {
    console.error('Error approving character:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/generate-persona/:characterId', verifyAdmin, async (req, res) => {
  try {
    const { characterId } = req.params;

    // Generate persona in background
    generateCharacterPersona(characterId)
      .then(result => {
        console.log('Persona generation completed:', result);
      })
      .catch(error => {
        console.error('Persona generation failed:', error);
      });

    res.json({
      message: 'Persona generation started',
      characterId,
      status: 'generating'
    });

  } catch (error) {
    console.error('Error starting persona generation:', error);
    res.status(500).json({ error: error.message });
  }
});


router.post('/generate-all-personas/:bookId', verifyAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;

    // Generate all personas in background
    generateAllPersonasForBook(bookId)
      .then(result => {
        console.log('All personas generation completed:', result);
      })
      .catch(error => {
        console.error('All personas generation failed:', error);
      });

    res.json({
      message: 'Persona generation started for all characters',
      bookId,
      status: 'generating'
    });

  } catch (error) {
    console.error('Error starting persona generation:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/persona/:characterId', verifyAdmin, async (req, res) => {
  try {
    const { characterId } = req.params;
    const persona = getCharacterPersona(characterId);
    
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json(persona);

  } catch (error) {
    console.error('Error getting persona:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/status/:bookId', verifyAdmin, async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const bookStmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = bookStmt.get(bookId);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const chunksStmt = db.prepare('SELECT COUNT(*) as count FROM book_chunks WHERE book_id = ?');
    const chunks = chunksStmt.get(bookId);

    const extractedStmt = db.prepare('SELECT COUNT(*) as count FROM extracted_characters WHERE book_id = ?');
    const extractedCharacters = extractedStmt.get(bookId);

    const charactersStmt = db.prepare('SELECT c.*, cp.id as persona_id FROM characters c LEFT JOIN character_personas cp ON c.id = cp.character_id WHERE c.book_id = ?');
    const characters = charactersStmt.all(bookId);

    res.json({
      bookId,
      status: book.processing_status,
      totalChunks: chunks.count,
      charactersExtracted: extractedCharacters.count,
      charactersApproved: characters.length,
      charactersWithPersona: characters.filter(c => c.persona_id).length,
      errorMessage: book.error_message,
      processedAt: book.processed_at
    });

  } catch (error) {
    console.error('Error getting processing status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
