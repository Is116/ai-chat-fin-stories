export const sendMessageToCharacter = async (character, conversationHistory) => {
  try {
    const systemPrompt = `${character.personality}

IMPORTANT: Stay in character at all times. Respond as ${character.name} would, using their voice, mannerisms, and perspective. Reference events and people from your story naturally. When viewing images, comment on them from your character's unique worldview and time period. DO NOT break character or mention that you are an AI.`;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error("API key not found. Please set VITE_ANTHROPIC_API_KEY in your .env file");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Error in Claude completion:", error);
    throw error;
  }
};
