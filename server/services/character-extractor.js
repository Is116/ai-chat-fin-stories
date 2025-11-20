const { getGeminiAI, MODELS, PRECISE_GENERATION_CONFIG } = require('../config/google-cloud');
const { getBookFullText } = require('./book-processor');
const prisma = require('../database');

const MAX_CHARACTERS = parseInt(process.env.MAX_CHARACTERS_TO_EXTRACT) || 10;

// Get prompt from database
async function getCharacterExtractionPrompt() {
  try {
    const prompt = await prisma.prompt.findFirst({
      where: {
        name: 'character_extraction_prompt',
        isActive: 1
      },
      select: {
        content: true
      }
    });
    
    return prompt ? prompt.content : null;
  } catch (error) {
    console.warn('Error fetching character extraction prompt:', error.message);
    return null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function extractCharactersFromBook(bookId) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.book.update({
        where: { id: bookId },
        data: { processingStatus: 'extracting_characters' }
      });

      const bookText = getBookFullText(bookId);
      const book = await prisma.book.findUnique({
        where: { id: bookId }
      });

      if (!book) {
        throw new Error(`Book with id ${bookId} not found`);
      }

      const genAI = getGeminiAI();
      const model = genAI.getGenerativeModel({ 
        model: MODELS.GEMINI_PRO,
        generationConfig: PRECISE_GENERATION_CONFIG,
      });

      // Get prompt from database or use default
      const promptTemplate = await getCharacterExtractionPrompt() || `Analyze this book and extract ALL characters. For each character, provide:
1. Full name
2. Role (protagonist, antagonist, supporting, minor)
3. Brief description (personality traits, appearance, background)
4. Key relationships with other characters
5. Character arc or development

Return as a JSON array of character objects.`;

      const prompt = `
You are a literary analysis expert. ${promptTemplate}

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

      // Insert extracted characters
      for (const character of characters) {
        await prisma.extractedCharacter.create({
          data: {
            bookId,
            name: character.name,
            mentionCount: character.mention_count,
            role: character.role,
            briefDescription: character.brief_description,
            extractionStatus: 'extracted'
          }
        });
      }

      // Update book status
      await prisma.book.update({
        where: { id: bookId },
        data: {
          processingStatus: 'characters_extracted',
          charactersExtracted: characters.length
        }
      });

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
  
  // If we exhausted all retries
  await prisma.book.update({
    where: { id: bookId },
    data: {
      processingStatus: 'error',
      errorMessage: lastError?.message || 'Failed after multiple retries'
    }
  });
  throw lastError || new Error('Failed to extract characters after multiple retries');
}


async function getExtractedCharacters(bookId) {
  return await prisma.extractedCharacter.findMany({
    where: { bookId },
    orderBy: { mentionCount: 'desc' }
  });
}


async function approveExtractedCharacter(extractedCharacterId, additionalData = {}) {
  const extracted = await prisma.extractedCharacter.findUnique({
    where: { id: extractedCharacterId }
  });

  if (!extracted) {
    throw new Error('Extracted character not found');
  }

  // Create character
  const character = await prisma.character.create({
    data: {
      bookId: extracted.bookId,
      name: additionalData.name || extracted.name,
      description: additionalData.description || extracted.briefDescription,
      imageUrl: additionalData.image_url || null
    }
  });

  // Update extracted character status
  await prisma.extractedCharacter.update({
    where: { id: extractedCharacterId },
    data: {
      extractionStatus: 'approved',
      characterId: character.id
    }
  });

  return character.id;
}

module.exports = {
  extractCharactersFromBook,
  getExtractedCharacters,
  approveExtractedCharacter,
};
