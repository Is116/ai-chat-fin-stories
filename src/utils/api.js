// Cache for prompts to avoid repeated API calls
let promptCache = null;
let promptCacheTime = 0;
const PROMPT_CACHE_TTL = 60000; // 1 minute

// Default fallback prompts
const DEFAULT_PROMPTS = {
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

const getPrompts = async () => {
  const now = Date.now();
  
  // Return cached prompts if still valid
  if (promptCache && (now - promptCacheTime < PROMPT_CACHE_TTL)) {
    return promptCache;
  }
  
  try {
    const response = await fetch('http://localhost:3001/api/books/prompts/active');
    if (!response.ok) {
      throw new Error('Failed to fetch prompts');
    }
    
    const prompts = await response.json();
    promptCache = prompts;
    promptCacheTime = now;
    
    return prompts;
  } catch (error) {
    console.warn('Using default prompts - could not fetch from server:', error.message);
    // Return default prompts as fallback
    return DEFAULT_PROMPTS;
  }
};

export const sendMessageToCharacter = async (character, conversationHistory) => {
  try {
    // Get prompts from database
    const prompts = await getPrompts();
    
    // Detect if there's an image in the conversation
    const hasImage = conversationHistory.some(msg => 
      Array.isArray(msg.content) && msg.content.some(part => part.type === 'image')
    );
    
    const characterInstructions = prompts.frontend_character_instructions || 
      'IMPORTANT: Stay in character at all times. Respond as {CHARACTER_NAME} would, using their voice, mannerisms, and perspective. Reference events and people from your story naturally.';
    const imageAnalysis = prompts.frontend_image_analysis || '';
    const languageRule = prompts.frontend_language_rule || 
      'CRITICAL: Always respond in the SAME LANGUAGE as the user\'s message. Match the user\'s language EXACTLY.';
    const characterRule = prompts.frontend_character_rule || 
      'DO NOT break character or mention that you are an AI.';
    
    const systemPrompt = `${character.personality}

${characterInstructions.replace('{CHARACTER_NAME}', character.name)}

${hasImage ? imageAnalysis : ''}

${languageRule}

${characterRule}`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("API key not found. Please set VITE_GEMINI_API_KEY in your .env file");
    }

    // Convert conversation history to Gemini format
    const geminiMessages = conversationHistory.map(msg => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        };
      } else {
        // Handle multimodal content (text + images)
        const parts = [];
        for (const part of msg.content) {
          if (part.type === 'text') {
            parts.push({ text: part.text });
          } else if (part.type === 'image') {
            parts.push({
              inlineData: {
                mimeType: part.source.media_type,
                data: part.source.data
              }
            });
          }
        }
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts
        };
      }
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error in Gemini completion:", error);
    throw error;
  }
};
