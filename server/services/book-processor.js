const { PDFParse } = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const db = require('../database');

const MAX_CHUNK_SIZE = parseInt(process.env.MAX_CHUNK_SIZE) || 1000;
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP) || 100;


async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    // Use PDFParse v2 API with 'data' parameter
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}


async function extractTextFromFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read text file: ${error.message}`);
  }
}


function detectChapters(text) {
  const chapterPatterns = [
    /Chapter\s+(\d+|[IVXLCDM]+)/gi,
    /CHAPTER\s+(\d+|[IVXLCDM]+)/g,
    /^(\d+)\./gm,
  ];

  const chapters = [];
  let currentChapterStart = 0;

  for (const pattern of chapterPatterns) {
    const matches = [...text.matchAll(pattern)];
    
    if (matches.length > 2) {
      matches.forEach((match, index) => {
        const chapterStart = match.index;
        
        if (index > 0) {
          chapters.push({
            number: chapters.length + 1,
            text: text.slice(currentChapterStart, chapterStart).trim(),
          });
        }
        
        currentChapterStart = chapterStart;
      });

      chapters.push({
        number: chapters.length + 1,
        text: text.slice(currentChapterStart).trim(),
      });

      return chapters;
    }
  }

  return [{
    number: 1,
    text: text.trim(),
  }];
}


function chunkText(text, chapterNumber, maxChunkSize = MAX_CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentIndex = 0;

  while (currentIndex < words.length) {
    const chunk = words.slice(currentIndex, currentIndex + maxChunkSize);
    const chunkText = chunk.join(' ');

    chunks.push({
      text: chunkText,
      chapterNumber,
      startIndex: currentIndex,
      endIndex: currentIndex + chunk.length,
      wordCount: chunk.length,
    });

    currentIndex += maxChunkSize - overlap;
  }

  return chunks;
}


async function processBook(bookId, filePath) {
  try {
    const updateStmt = db.prepare('UPDATE books SET processing_status = ? WHERE id = ?');
    updateStmt.run('processing', bookId);

    const ext = path.extname(filePath).toLowerCase();
    let fullText;

    if (ext === '.pdf') {
      fullText = await extractTextFromPDF(filePath);
    } else if (ext === '.txt') {
      fullText = await extractTextFromFile(filePath);
    } else {
      throw new Error(`Unsupported file type: ${ext}`);
    }

    const chapters = detectChapters(fullText);
    console.log(`Detected ${chapters.length} chapters in book ${bookId}`);

    let totalChunks = 0;
    const insertStmt = db.prepare(
      'INSERT INTO book_chunks (book_id, chunk_id, chunk_text, chapter_number, word_count, chunk_index) VALUES (?, ?, ?, ?, ?, ?)'
    );

    for (const chapter of chapters) {
      const chunks = chunkText(chapter.text, chapter.number);

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${bookId}-ch${chapter.number}-${i + 1}`;
        insertStmt.run(bookId, chunkId, chunks[i].text, chapter.number, chunks[i].wordCount, i);
        totalChunks++;
      }
    }

    updateStmt.run('chunks_created', bookId);
    const updateChunksStmt = db.prepare('UPDATE books SET total_chunks = ?, processed_at = CURRENT_TIMESTAMP WHERE id = ?');
    updateChunksStmt.run(totalChunks, bookId);

    console.log(`Book ${bookId} processed: ${chapters.length} chapters, ${totalChunks} chunks`);

    return {
      success: true,
      bookId,
      chapters: chapters.length,
      totalChunks,
    };

  } catch (error) {
    const updateStmt = db.prepare('UPDATE books SET processing_status = ?, error_message = ? WHERE id = ?');
    updateStmt.run('error', error.message, bookId);
    throw error;
  }
}


function getBookChunks(bookId) {
  const stmt = db.prepare('SELECT * FROM book_chunks WHERE book_id = ? ORDER BY chapter_number, chunk_index');
  return stmt.all(bookId);
}


function getBookFullText(bookId) {
  const chunks = getBookChunks(bookId);
  return chunks.map(chunk => chunk.chunk_text).join('\n\n');
}

module.exports = {
  extractTextFromPDF,
  extractTextFromFile,
  detectChapters,
  chunkText,
  processBook,
  getBookChunks,
  getBookFullText,
};
