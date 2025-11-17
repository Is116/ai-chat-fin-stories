const { getGeminiAI, MODELS, PRECISE_GENERATION_CONFIG } = require('../config/google-cloud');
const { getBookFullText } = require('./book-processor');
const db = require('../database');

const MAX_CHARACTERS = parseInt(process.env.MAX_CHARACTERS_TO_EXTRACT) || 10;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function extractCharactersFromBook(bookId) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const updateStmt = db.prepare('UPDATE books SET processing_status = ? WHERE id = ?');
      updateStmt.run('extracting_characters', bookId);

      const bookText = getBookFullText(bookId);
      const bookStmt = db.prepare('SELECT * FROM books WHERE id = ?');
      const book = bookStmt.get(bookId);

      const genAI = getGeminiAI();
      const model = genAI.getGenerativeModel({ 
        model: MODELS.GEMINI_PRO,
        generationConfig: PRECISE_GENERATION_CONFIG,
      });

      const prompt = `
You are a literary analysis expert. Analyze the following book text and identify the main characters.

Book Title: ${book.title}
Author: ${book.author || 'Unknown'}

Instructions:
1. Identify the ${MAX_CHARACTERS} most important characters in the book
2. For each character, provide:
   - name: The character's full name (exactly as it appears most frequently)
   - mention_count: Approximate number of times they are mentioned
   - role: Their primary role (e.g., "protagonist", "antagonist", "supporting character")
   - brief_description: A one-sentence description of who they are

Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "Character Name",
    "mention_count": 150,
    "role": "protagonist",
    "brief_description": "Brief description here"
  }
]

Book Text (first 50,000 characters):
${bookText.substring(0, 50000)}

JSON Array:`;

      console.log(`Attempt ${attempt}/${maxRetries}: Calling Gemini API for character extraction...`);
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      // Check for safety ratings or blocked content
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
      }
      
      const text = response.text();

      if (!text || text.trim().length === 0) {
        console.error('Empty response from AI');
        console.error('Response object:', JSON.stringify(response, null, 2));
        throw new Error('AI returned empty response');
      }

      console.log('Raw AI response:', text.substring(0, 1000));

      // Try to extract JSON array - handle markdown code blocks
      let jsonText = text;
      
      // Remove markdown code blocks if present
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('Failed to find JSON array in response:', text);
        throw new Error('Failed to extract valid JSON from response');
      }

      let characters;
      try {
        characters = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('Failed to parse JSON:', jsonMatch[0]);
        throw new Error(`JSON parsing failed: ${parseError.message}`);
      }

      if (!Array.isArray(characters) || characters.length === 0) {
        throw new Error('No characters found in response');
      }

      console.log(`Found ${characters.length} characters in AI response`);

      const insertStmt = db.prepare(
        'INSERT INTO extracted_characters (book_id, name, mention_count, role, brief_description, extraction_status) VALUES (?, ?, ?, ?, ?, ?)'
      );

      for (const character of characters) {
        insertStmt.run(
          bookId,
          character.name,
          character.mention_count,
          character.role,
          character.brief_description,
          'extracted'
        );
      }

      updateStmt.run('characters_extracted', bookId);
      const updateCountStmt = db.prepare('UPDATE books SET characters_extracted = ? WHERE id = ?');
      updateCountStmt.run(characters.length, bookId);

      console.log(`✅ Extracted ${characters.length} characters from book ${bookId}`);

      return {
        success: true,
        bookId,
        characters,
      };

    } catch (error) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error.status === 429 || error.message?.includes('429')) {
        const retryDelay = error.errorDetails?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay;
        const delaySeconds = retryDelay ? parseInt(retryDelay) : Math.pow(2, attempt) * 5;
        
        console.warn(`Rate limit hit (attempt ${attempt}/${maxRetries}). Retrying in ${delaySeconds} seconds...`);
        
        if (attempt < maxRetries) {
          await sleep(delaySeconds * 1000);
          continue;
        }
      }
      
      // For non-rate-limit errors, fail immediately
      console.error(`Character extraction failed:`, error.message);
      const updateStmt = db.prepare('UPDATE books SET processing_status = ?, error_message = ? WHERE id = ?');
      updateStmt.run('error', error.message, bookId);
      throw error;
    }
  }
  
  // If we exhausted all retries
  const updateStmt = db.prepare('UPDATE books SET processing_status = ?, error_message = ? WHERE id = ?');
  updateStmt.run('error', lastError?.message || 'Failed after multiple retries', bookId);
  throw lastError || new Error('Failed to extract characters after multiple retries');
}


function getExtractedCharacters(bookId) {
  const stmt = db.prepare('SELECT * FROM extracted_characters WHERE book_id = ? ORDER BY mention_count DESC');
  return stmt.all(bookId);
}


function approveExtractedCharacter(extractedCharacterId, additionalData = {}) {
  const stmt = db.prepare('SELECT * FROM extracted_characters WHERE id = ?');
  const extracted = stmt.get(extractedCharacterId);

  if (!extracted) {
    throw new Error('Extracted character not found');
  }

  const insertStmt = db.prepare(
    'INSERT INTO characters (book_id, name, description, image_url, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
  );

  const result = insertStmt.run(
    extracted.book_id,
    additionalData.name || extracted.name,
    additionalData.description || extracted.brief_description,
    additionalData.image_url || null
  );

  const characterId = result.lastInsertRowid;

  const updateStmt = db.prepare('UPDATE extracted_characters SET extraction_status = ?, character_id = ? WHERE id = ?');
  updateStmt.run('approved', characterId, extractedCharacterId);

  return characterId;
}

module.exports = {
  extractCharactersFromBook,
  getExtractedCharacters,
  approveExtractedCharacter,
};
