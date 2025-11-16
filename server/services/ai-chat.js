/**
 * AI Chat Service - CommonJS
 * Phase 3: Chatbot Deployment with RAG
 */

const { getGeminiAI, MODELS, DEFAULT_GENERATION_CONFIG } = require('../config/google-cloud');
const { getCharacterPersona } = require('./persona-generator');
const { getBookChunks } = require('./book-processor');
const db = require('../database');

/**
 * Find relevant context chunks for a query
 * Simple keyword-based search (can be upgraded to vector embeddings)
 */
function findRelevantContext(bookId, query, limit = 5) {
  const chunks = getBookChunks(bookId);
  
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 3);
  
  const scoredChunks = chunks.map(chunk => {
    const text = chunk.chunk_text.toLowerCase();
    const score = queryTerms.reduce((sum, term) => {
      const matches = (text.match(new RegExp(term, 'g')) || []).length;
      return sum + matches;
    }, 0);
    
    return { ...chunk, score };
  });

  return scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generate AI response for character chat
 */
async function generateCharacterResponse(characterId, userMessage, conversationHistory = [], userImage = null) {
  try {
    const charStmt = db.prepare('SELECT * FROM characters WHERE id = ?');
    const character = charStmt.get(characterId);
    
    if (!character) {
      throw new Error('Character not found');
    }

    // Try to get persona, but fall back to basic personality if not found
    let persona = getCharacterPersona(characterId);
    let systemInstruction;
    
    if (!persona) {
      // Fallback: Use basic character info without RAG
      systemInstruction = `You are ${character.name}, a character from literature. ${character.personality || character.description || ''}

Key traits:
- Stay in character at all times
- Respond based on your personality and background
- Be conversational and engaging
- Keep responses concise (2-3 paragraphs max)
${userImage ? '- When shown an image, analyze it from your character\'s perspective' : ''}
- IMPORTANT: Always respond in the SAME LANGUAGE as the user's message. If they speak Sinhala, respond in Sinhala. If they speak Finnish, respond in Finnish. If they speak English, respond in English.

Respond naturally to the user's message in their language.`;
    } else {
      systemInstruction = persona.system_instruction + `

CRITICAL LANGUAGE RULE: Always respond in the SAME LANGUAGE as the user's message. If they write in Sinhala (සිංහල), respond in Sinhala. If they write in Finnish (suomi), respond in Finnish. If they write in English, respond in English. Match the user's language exactly.`;
    }

    const relevantChunks = findRelevantContext(character.book_id, userMessage, 5);
    const contextText = relevantChunks.length > 0
      ? relevantChunks.map(c => c.chunk_text).join('\n\n')
      : '';

    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: MODELS.GEMINI_PRO,
      generationConfig: DEFAULT_GENERATION_CONFIG,
    });

    const historyContext = conversationHistory
      .slice(-6)
      .map(msg => `${msg.role === 'user' ? 'User' : character.name}: ${msg.content}`)
      .join('\n');

    // Build the prompt with language instruction
    let prompt = `${systemInstruction}

${contextText ? `RELEVANT CONTEXT FROM YOUR BOOK:\n${contextText}\n` : ''}

${historyContext ? `CONVERSATION HISTORY:\n${historyContext}\n` : ''}

User's message (RESPOND IN THE SAME LANGUAGE): ${userMessage}

${character.name} (respond in the user's language):`;

    // If there's an image, use multimodal generation
    let result;
    if (userImage) {
      // Extract base64 data from data URL
      const base64Match = userImage.match(/^data:image\/(\w+);base64,(.+)$/);
      if (base64Match) {
        const mimeType = `image/${base64Match[1]}`;
        const base64Data = base64Match[2];
        
        // Use multimodal prompt with image
        result = await model.generateContent([
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          prompt
        ]);
      } else {
        // Fallback to text-only if image format is invalid
        result = await model.generateContent(prompt);
      }
    } else {
      // Text-only generation
      result = await model.generateContent(prompt);
    }

    const response = result.response;
    const aiMessage = response.text().trim();

    return {
      success: true,
      message: aiMessage,
      characterId,
      characterName: character.name,
      contextUsed: relevantChunks.length > 0,
    };

  } catch (error) {
    console.error('Failed to generate AI response:', error);
    throw error;
  }
}

module.exports = {
  generateCharacterResponse,
  findRelevantContext,
};
