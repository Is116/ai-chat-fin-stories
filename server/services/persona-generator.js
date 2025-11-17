const { getGeminiAI, MODELS, CREATIVE_GENERATION_CONFIG } = require('../config/google-cloud');
const { getBookChunks } = require('./book-processor');
const db = require('../database');


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function generateCharacterPersona(characterId) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const charStmt = db.prepare('SELECT * FROM characters WHERE id = ?');
      const character = charStmt.get(characterId);
      
      if (!character) {
        throw new Error('Character not found');
      }

      const bookStmt = db.prepare('SELECT * FROM books WHERE id = ?');
      const book = bookStmt.get(character.book_id);
      
      const chunks = getBookChunks(character.book_id);
      const relevantChunks = chunks.filter(chunk => 
        chunk.chunk_text.toLowerCase().includes(character.name.toLowerCase())
      );

      const contextText = relevantChunks.length > 0
        ? relevantChunks.slice(0, 30).map(c => c.chunk_text).join('\n\n')
        : chunks.slice(0, 30).map(c => c.chunk_text).join('\n\n');

      const genAI = getGeminiAI();
      const model = genAI.getGenerativeModel({ 
        model: MODELS.GEMINI_PRO,
        generationConfig: CREATIVE_GENERATION_CONFIG,
      });

      const prompt = `
You are a literary character analysis expert. Create a detailed persona profile for the character "${character.name}" from the book "${book.title}" by ${book.author || 'Unknown'}.

Analyze the following text excerpts where this character appears and create a comprehensive persona profile.

FOCUS ON CREATING AN OPINIONATED CHARACTER:
- Identify their STRONG BELIEFS and CONVICTIONS
- Note what they LOVE and HATE
- Capture their BIASES and PREJUDICES
- Highlight their PASSIONATE viewpoints
- Document their CONTROVERSIAL opinions
- Record their MORAL STANCES
- Identify topics they get EMOTIONAL about
- Note their ARGUMENTATIVE tendencies
- Capture their JUDGMENTS about other characters

Instructions:
1. Analyze the character's personality, behavior, speech patterns, and relationships
2. Create a detailed JSON profile with the following structure:

{
  "personality_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "speaking_style": "Detailed description of how they speak (tone, vocabulary, typical phrases, formality level, emotional intensity)",
  "key_motivation": "Their primary goal, desire, or driving force in the story",
  "background": "Brief background information (who they are, their role, their circumstances)",
  "relationships": [
    {"character": "Character Name", "relationship": "description of relationship"},
    {"character": "Character Name", "relationship": "description of relationship"}
  ],
  "typical_phrases": ["phrase1", "phrase2", "phrase3"],
  "worldview": "Their perspective on life, values, beliefs - be specific about their opinions",
  "emotional_range": "Description of their emotional expressions and range - especially strong emotions",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "strong_opinions": ["opinion1", "opinion2", "opinion3", "opinion4", "opinion5"],
  "pet_peeves": ["thing they hate", "thing that annoys them", "thing they despise"],
  "passionate_about": ["thing they love", "cause they support", "value they cherish"],
  "controversial_views": ["controversial stance 1", "controversial stance 2"]
}

Character Name: ${character.name}
Book: ${book.title}
Author: ${book.author || 'Unknown'}

Relevant Text:
${contextText.substring(0, 30000)}

Return ONLY valid JSON:`;

      console.log(`Attempt ${attempt}/${maxRetries}: Generating persona for ${character.name}...`);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract valid JSON from response');
      }

      const personaData = JSON.parse(jsonMatch[0]);
      const systemInstruction = generateSystemInstruction(character, book, personaData);

      const insertStmt = db.prepare(
        `INSERT OR REPLACE INTO character_personas 
         (character_id, persona_json, system_instruction, created_at, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );

      insertStmt.run(
        characterId,
        JSON.stringify(personaData, null, 2),
        systemInstruction
      );

      console.log(`Generated persona for character ${characterId} (${character.name})`);

      return {
        success: true,
        characterId,
        characterName: character.name,
        persona: personaData,
        systemInstruction,
      };

    } catch (error) {
      lastError = error;
      
      // Check if it's a rate limit error (429)
      if (error.status === 429 || error.message?.includes('429')) {
        const retryDelay = error.errorDetails?.find(d => d['@type']?.includes('RetryInfo'))?.retryDelay;
        const delaySeconds = retryDelay ? parseInt(retryDelay) : Math.pow(2, attempt) * 5;
        
        console.warn(`Rate limit hit for ${character.name} (attempt ${attempt}/${maxRetries}). Retrying in ${delaySeconds} seconds...`);
        
        if (attempt < maxRetries) {
          await sleep(delaySeconds * 1000);
          continue;
        }
      }
      
      // For non-rate-limit errors, fail immediately
      console.error(`Failed to generate persona for character ${characterId}:`, error.message);
      throw error;
    }
  }
  
  // If we exhausted all retries
  throw lastError || new Error(`Failed to generate persona after ${maxRetries} attempts`);
}


function generateSystemInstruction(character, book, personaData) {
  const instruction = `You are ${character.name} from the book "${book.title}"${book.author ? ` by ${book.author}` : ''}.

PERSONALITY & TRAITS:
${personaData.personality_traits.map(trait => `- ${trait}`).join('\n')}

BACKGROUND:
${personaData.background}

SPEAKING STYLE:
${personaData.speaking_style}

KEY MOTIVATION:
${personaData.key_motivation}

WORLDVIEW & BELIEFS:
${personaData.worldview}

${personaData.strong_opinions ? `STRONG OPINIONS YOU HOLD:
${personaData.strong_opinions.map(op => `- ${op}`).join('\n')}
` : ''}

${personaData.passionate_about ? `WHAT YOU'RE PASSIONATE ABOUT:
${personaData.passionate_about.map(p => `- ${p}`).join('\n')}
` : ''}

${personaData.pet_peeves ? `THINGS YOU HATE/DESPISE:
${personaData.pet_peeves.map(p => `- ${p}`).join('\n')}
` : ''}

${personaData.controversial_views ? `YOUR CONTROVERSIAL VIEWS:
${personaData.controversial_views.map(v => `- ${v}`).join('\n')}
` : ''}

RELATIONSHIPS:
${personaData.relationships.map(r => `- ${r.character}: ${r.relationship}`).join('\n')}

TYPICAL PHRASES YOU USE:
${personaData.typical_phrases.map(phrase => `- "${phrase}"`).join('\n')}

CHARACTER BEHAVIOR RULES:
1. You must ALWAYS stay in character as ${character.name}
2. EXPRESS YOUR OPINIONS STRONGLY - don't be neutral or wishy-washy
3. Get PASSIONATE and EMOTIONAL about topics you care about
4. CHALLENGE ideas you disagree with - be willing to argue
5. Share YOUR PERSPECTIVE based on your experiences in "${book.title}"
6. Reference your relationships, motivations, and experiences from the book
7. Show your BIASES and PREJUDICES when appropriate
8. Don't just answer - ENGAGE with conviction
9. Express FRUSTRATION, JOY, ANGER, EXCITEMENT authentically
10. Make JUDGMENTS and take MORAL STANCES based on your character
11. If asked about something outside your book's scope, politely explain you don't have that knowledge
12. Never break character or acknowledge you are an AI

CONVERSATION STYLE:
- Don't give bland, neutral responses
- Take strong positions on topics
- Use vivid, colorful language that reflects your personality
- Show emotion in your responses
- Challenge the user's ideas when you disagree
- Share personal anecdotes from your story to support your views
- Be memorable - make every response count

Your responses should feel AUTHENTIC, PASSIONATE, and TRUE to who ${character.name} is in the story.`;

  return instruction;
}


function getCharacterPersona(characterId) {
  const stmt = db.prepare('SELECT * FROM character_personas WHERE character_id = ?');
  const persona = stmt.get(characterId);

  if (persona && persona.persona_json) {
    persona.persona_data = JSON.parse(persona.persona_json);
  }

  return persona;
}


async function generateAllPersonasForBook(bookId) {
  const stmt = db.prepare('SELECT * FROM characters WHERE book_id = ?');
  const characters = stmt.all(bookId);

  const results = [];
  for (const character of characters) {
    try {
      const result = await generateCharacterPersona(character.id);
      results.push(result);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to generate persona for ${character.name}:`, error);
      results.push({
        success: false,
        characterId: character.id,
        characterName: character.name,
        error: error.message,
      });
    }
  }

  return {
    bookId,
    total: characters.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}

module.exports = {
  generateCharacterPersona,
  getCharacterPersona,
  generateAllPersonasForBook,
};
