export const sendMessageToCharacter = async (character, conversationHistory) => {
  try {
    const systemPrompt = `${character.personality}

IMPORTANT: Stay in character at all times. Respond as ${character.name} would, using their voice, mannerisms, and perspective. Reference events and people from your story naturally. When viewing images, comment on them from your character's unique worldview and time period. DO NOT break character or mention that you are an AI.`;

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
