import express from 'express';
const router = express.Router();
import { getAIClient, SYSTEM_PROMPT, EVALUATION_SCHEMA } from '../utils/aiPromptSetup.js';

// Helper to format history for the Gemini API
const formatHistory = (messages) => {
  if (!messages || !Array.isArray(messages)) return [];
  
  return messages.map(msg => ({
    role: msg.role === 'bot' ? 'model' : 'user',
    parts: [{ text: msg.content || msg.text || '' }]
  }));
};

// POST /api/bot/chat
// Returns a single text response with Hebrew correction appended (for backward-compatibility)
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
    
    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: EVALUATION_SCHEMA
      },
      history: formattedHistory
    });

    // Send the new message
    const response = await chatSession.sendMessage({ message });

    let evaluation;
    try {
      evaluation = JSON.parse(response.text);
    } catch (e) {
      console.error('Failed to parse structured JSON response from Gemini:', response.text);
      evaluation = {
        response: response.text,
        hasErrors: false,
        correction: ''
      };
    }

    // Format content by appending Hebrew correction if mistakes exist
    let content = evaluation.response;
    if (evaluation.hasErrors && evaluation.correction) {
      content += `\n(Hebrew Correction: ${evaluation.correction})`;
    }

    res.json({
      role: 'bot',
      content: content
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// POST /api/bot/evaluate
// Returns structured evaluation JSON (response, hasErrors, correction)
router.post('/evaluate', async (req, res) => {
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
    
    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: EVALUATION_SCHEMA
      },
      history: formattedHistory
    });

    // Send the new message
    const response = await chatSession.sendMessage({ message });

    let evaluation;
    try {
      evaluation = JSON.parse(response.text);
    } catch (e) {
      console.error('Failed to parse structured JSON response from Gemini in evaluate:', response.text);
      evaluation = {
        response: response.text,
        hasErrors: false,
        correction: ''
      };
    }

    res.json(evaluation);

  } catch (error) {
    console.error('Error in evaluate endpoint:', error);
    res.status(500).json({ error: 'Failed to evaluate message' });
  }
});

// Helper for Audio transcription (Speech-to-Text)
const handleTranscribe = async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({ 
        error: 'AI service is unavailable. API key might be missing.' 
      });
    }

    let audioBase64 = null;
    let mimeType = 'audio/webm';

    // 1. Check if the request is a raw binary body (Buffer)
    if (Buffer.isBuffer(req.body)) {
      audioBase64 = req.body.toString('base64');
      mimeType = req.headers['content-type'] || 'audio/webm';
    } 
    // 2. Check if the request is a JSON body with base64 audio
    else if (req.body && req.body.audio) {
      audioBase64 = req.body.audio;
      mimeType = req.body.mimeType || 'audio/webm';
    }

    if (!audioBase64) {
      return res.status(400).json({ 
        error: 'Audio data is required. Provide raw binary audio or a JSON payload with an "audio" base64 field.' 
      });
    }

    // Call Gemini 2.5 Flash native Speech-To-Text
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: audioBase64
          }
        },
        'Transcribe the speech in this audio file. Output only the transcript, with no extra text.'
      ]
    });

    const transcription = response.text ? response.text.trim() : '';

    // Return both for compatibility
    res.json({
      transcription: transcription,
      text: transcription
    });

  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
};

// Mount transcribe and stt routes
router.post('/transcribe', handleTranscribe);
router.post('/stt', handleTranscribe);

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

export default router;
