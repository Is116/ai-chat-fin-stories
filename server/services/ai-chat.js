const { getGeminiAI, MODELS, DEFAULT_GENERATION_CONFIG } = require('../config/google-cloud');
const { getCharacterPersona } = require('./persona-generator');
const { getBookChunks } = require('./book-processor');
const prisma = require('../database');

// Cache for prompts to avoid repeated DB queries
let promptCache = null;
let promptCacheTime = 0;
const PROMPT_CACHE_TTL = 60000; // 1 minute

async function getPrompts() {
  const now = Date.now();
  
  // Return cached prompts if still valid
  if (promptCache && (now - promptCacheTime < PROMPT_CACHE_TTL)) {
    return promptCache;
  }
  
  try {
    // Fetch active prompts from database
    const prompts = await prisma.prompt.findMany({
      where: { isActive: 1 },
      select: {
        name: true,
        type: true,
        content: true
      }
    });
    
    // Store as array for direct use
    promptCache = prompts;
    promptCacheTime = now;
    
    return prompts;
  } catch (error) {
    console.warn('Error fetching prompts, using empty defaults:', error.message);
    return [];
  }
}

// Helper function to get prompt content by name
function getPromptByName(prompts, name) {
  const prompt = prompts.find(p => p.name === name);
  return prompt ? prompt.content : '';
}

async function findRelevantContext(bookId, query, limit = 5) {
  const chunks = await getBookChunks(bookId);
  
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

// New function to analyze past conversations and extract key insights
async function analyzePastConversations(userId, characterId, limit = 5) {
  try {
    // Get past conversations between this user and character
    const pastConversations = await prisma.conversation.findMany({
      where: {
        userId: userId,
        characterId: characterId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 20 // Get last 20 messages from each conversation
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    });

    if (pastConversations.length === 0) {
      return null;
    }

    // Extract key information from past conversations
    const insights = {
      conversationCount: pastConversations.length,
      topics: [],
      userStyle: '',
      previousTopics: []
    };

    // Collect all past messages
    const allMessages = [];
    pastConversations.forEach(conv => {
      conv.messages.forEach(msg => {
        allMessages.push({
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        });
      });
    });

    // Build a summary of past conversations
    const recentMessages = allMessages.slice(0, 30);
    const conversationSummary = recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Character'}: ${msg.content.substring(0, 150)}`)
      .join('\n');

    insights.summary = conversationSummary;
    insights.totalMessages = allMessages.length;

    return insights;
  } catch (error) {
    console.error('Error analyzing past conversations:', error);
    return null;
  }
}


async function generateCharacterResponse(characterId, userMessage, conversationHistory = [], userImage = null, userId = null) {
  try {
    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });
    
    if (!character) {
      throw new Error('Character not found');
    }

    // Get prompts from database
    const prompts = await getPrompts();

    // Analyze past conversations if userId is provided
    let pastConversationContext = '';
    if (userId) {
      const pastInsights = await analyzePastConversations(userId, characterId, 3);
      if (pastInsights && pastInsights.totalMessages > 0) {
        pastConversationContext = `
MEMORY OF PAST CONVERSATIONS:
You have spoken with this user ${pastInsights.conversationCount} time(s) before (${pastInsights.totalMessages} messages total).

PREVIOUS CONVERSATION HIGHLIGHTS:
${pastInsights.summary}

IMPORTANT: Remember and reference these past interactions naturally. Show that you recognize this user and recall your previous discussions. Build continuity by:
- Referencing topics you've discussed before
- Showing character development based on past conversations
- Acknowledging the ongoing relationship
- Being more familiar and personal (as appropriate to your character)
- Following up on previously mentioned topics or questions

`;
      }
    }

    // Try to get persona, but fall back to basic personality if not found
    let persona = await getCharacterPersona(characterId);
    let systemInstruction;
    
    if (!persona) {
      // Fallback: Use basic character info without RAG
      const personalityInstructions = getPromptByName(prompts, 'fallback_personality_instructions');
      const imageAnalysisInstructions = getPromptByName(prompts, 'fallback_image_analysis');
      const responseStyle = getPromptByName(prompts, 'fallback_response_style');
      
      systemInstruction = `You are ${character.name}, a character from literature. ${character.personality || character.description || ''}

${personalityInstructions}

${userImage ? imageAnalysisInstructions : ''}

${responseStyle}

${pastConversationContext}`;
    } else {
      const enhancedPersonality = getPromptByName(prompts, 'persona_enhanced_personality');
      const imageResponse = getPromptByName(prompts, 'persona_image_response');
      const languageRule = getPromptByName(prompts, 'persona_language_rule');
      
      systemInstruction = persona.system_instruction + `

${enhancedPersonality}

${userImage ? imageResponse : ''}

${languageRule}

${pastConversationContext}`;
    }

    const relevantChunks = await findRelevantContext(character.bookId, userMessage, 5);
    const contextText = relevantChunks.length > 0
      ? relevantChunks.map(c => c.chunk_text).join('\n\n')
      : '';

    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: MODELS.GEMINI_PRO,
      generationConfig: DEFAULT_GENERATION_CONFIG,
    });

    // Build a more comprehensive conversation history (last 10 messages)
    const historyContext = conversationHistory
      .slice(-10)
      .map(msg => `${msg.role === 'user' ? 'User' : character.name}: ${msg.content}`)
      .join('\n');

    // Build the prompt with enhanced context and continuity
    let prompt = `${systemInstruction}

${contextText ? `RELEVANT CONTEXT FROM YOUR BOOK:\n${contextText}\n` : ''}

${historyContext ? `CURRENT CONVERSATION:\n${historyContext}\n` : ''}

User's message (RESPOND IN THE SAME LANGUAGE): ${userMessage}

IMPORTANT INSTRUCTIONS:
- Maintain consistency with the current conversation flow
- Reference earlier parts of THIS conversation when relevant
- Show emotional continuity and character development
- React naturally to the user's messages based on what's been discussed
- Stay true to your character's personality and knowledge from your book
- If this is a returning user (check MEMORY section above), acknowledge your history together

${character.name} (respond in the user's language):`;

    // Get image analysis instructions from prompts if image is present
    let imageAnalysisPrompt = '';
    if (userImage) {
      const imagePrompt = prompts.find(p => p.type === 'image_response');
      if (imagePrompt) {
        imageAnalysisPrompt = `\n\n--- IMAGE ANALYSIS GUIDELINES ---\n${imagePrompt.content}\n`;
      }
    }

    // Add image analysis instructions to the main prompt if present
    const finalPrompt = userImage ? prompt + imageAnalysisPrompt : prompt;

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
          finalPrompt
        ]);
      } else {
        // Fallback to text-only if image format is invalid
        result = await model.generateContent(finalPrompt);
      }
    } else {
      // Text-only generation
      result = await model.generateContent(finalPrompt);
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
