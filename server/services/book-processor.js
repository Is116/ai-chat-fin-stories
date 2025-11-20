const { PDFParse } = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');
const prisma = require('../database');

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
    await prisma.book.update({
      where: { id: bookId },
      data: { processingStatus: 'processing' }
    });

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

    for (const chapter of chapters) {
      const chunks = chunkText(chapter.text, chapter.number);

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = `${bookId}-ch${chapter.number}-${i + 1}`;
        await prisma.bookChunk.create({
          data: {
            bookId: bookId,
            chunkId: chunkId,
            chunkText: chunks[i].text,
            chapterNumber: chapter.number,
            wordCount: chunks[i].wordCount,
            chunkIndex: i
          }
        });
        totalChunks++;
      }
    }

    await prisma.book.update({
      where: { id: bookId },
      data: {
        processingStatus: 'chunks_created',
        totalChunks: totalChunks,
        processedAt: new Date()
      }
    });

    console.log(`Book ${bookId} processed: ${chapters.length} chapters, ${totalChunks} chunks`);

    return {
      success: true,
      bookId,
      chapters: chapters.length,
      totalChunks,
    };

  } catch (error) {
    await prisma.book.update({
      where: { id: bookId },
      data: {
        processingStatus: 'error',
        errorMessage: error.message
      }
    });
    throw error;
  }
}


async function getBookChunks(bookId) {
  const chunks = await prisma.bookChunk.findMany({
    where: { bookId: bookId },
    orderBy: [
      { chapterNumber: 'asc' },
      { chunkIndex: 'asc' }
    ]
  });
  
  // Transform to match old format for compatibility
  return chunks.map(c => ({
    id: c.id,
    book_id: c.bookId,
    chapter_number: c.chapterNumber,
    chunk_index: c.chunkIndex,
    chunk_text: c.chunkText,
    word_count: c.wordCount,
    chunk_id: c.chunkId,
    created_at: c.createdAt
  }));
}


async function getBookFullText(bookId) {
  const chunks = await getBookChunks(bookId);
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
