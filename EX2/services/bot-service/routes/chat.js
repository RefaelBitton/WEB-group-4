const express = require('express');
const router = express.Router();
const { getAIClient, SYSTEM_PROMPT } = require('../utils/aiPromptSetup');

// Helper to format history for the Gemini API
const formatHistory = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return messages.map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
};

// POST /api/bot/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ 
        error: 'AI service is unavailable. API key might be missing.' 
      });
    }

    // Format previous history
    const formattedHistory = formatHistory(history);
    
    // We start a chat session. In the new @google/genai SDK:
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      }
    });

    // If there is history, we need to handle it. 
    // The @google/genai sdk allows passing history directly to the create method if needed,
    // but a common pattern is to just send the conversation as a list of contents.
    // Let's pass the history in the config or handle it via a multi-turn request.
    // For simplicity with the new SDK, we can pass history in `create` if supported, or manually construct the payload.
    // Let's use the explicit history parameter for create:
    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
      history: formattedHistory
    });

    // Send the new message
    const response = await chatSession.sendMessage({ message });

    res.json({
      role: 'bot',
      content: response.text
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// GET /api/bot/starter
// Generates a random English conversation starter
router.get('/starter', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      // Fallback if AI isn't configured yet
      const fallbacks = [
        "Hello! What is your favorite animal?",
        "Hi there! Do you like to play games?",
        "Welcome! What is your favorite color?"
      ];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.json({ starter: randomFallback });
    }

    // Use AI to generate a dynamic starter
    const prompt = `
      Generate a very simple, fun conversation starter in English for a child (age 6-12).
      It should be just one or two short sentences asking a question.
      Do not include any Hebrew. Do not include quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    res.json({ starter: response.text.trim() });

  } catch (error) {
    console.error('Error generating starter:', error);
    res.status(500).json({ error: 'Failed to generate starter' });
  }
});

module.exports = router;
