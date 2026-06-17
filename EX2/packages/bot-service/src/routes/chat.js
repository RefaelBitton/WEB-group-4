import express from 'express';
import mongoose from 'mongoose';
import { getAIClient, SYSTEM_PROMPT, EVALUATION_SCHEMA } from '../utils/aiPromptSetup.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

const LEVEL_MAPPING = {
  beginner: 'A1 (Beginner)',
  basic: 'A2 (Basic/Elementary)',
  intermediate: 'B1 (Intermediate)'
};

async function getChildLevel(req) {
  let childLevel = 'beginner';
  const sessionKey = req.auth?.sub;
  
  if (sessionKey && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(sessionKey)) {
    try {
      const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(sessionKey) });
      if (user && user.englishLevel) {
        childLevel = user.englishLevel;
      }
    } catch (err) {
      console.error('Error fetching child level from users collection in bot-service:', err);
    }
  }
  return childLevel;
}

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
router.post('/chat', authenticateToken, async (req, res) => {
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
    
    const levelKey = await getChildLevel(req);
    const cefrLevel = LEVEL_MAPPING[levelKey] || 'A1 (Beginner)';

    const dynamicInstruction = `${SYSTEM_PROMPT}
    
CRITICAL CONSTRAINT: You must adjust your vocabulary, syntax, complexity, and topics to precisely target the English level: **${cefrLevel}**.
- If A1: Use only simple present tense, very common words (e.g. dog, cat, apple, like, run), and very short questions.
- If A2: Use simple present and simple past tense, simple conjunctions, and slightly broader vocabulary.
- If B1: Use a mix of tenses (including perfect tenses), more varied adjectives/adverbs, and discuss slightly more advanced everyday topics.`;

    const chatSession = ai.chats.create({
      model: 'gemini-3.1-flash-lite',
      config: {
        systemInstruction: dynamicInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: EVALUATION_SCHEMA
      },
      history: formattedHistory
    });

    let evaluation;
    try {
      // Send the new message
      const response = await chatSession.sendMessage({ message });
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
    } catch (apiError) {
      console.warn('Gemini API request failed, using fallback response. Error:', apiError.message);
      const fallbacks = [
        { response: "That's wonderful! Can you tell me more about it in simple words?", hasErrors: false, correction: "" },
        { response: "Nice! What is your favorite animal or hobby?", hasErrors: false, correction: "" },
        { response: "I like talking to you! What did you do today?", hasErrors: false, correction: "" }
      ];
      evaluation = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Format content by appending Hebrew correction if mistakes exist
    let content = evaluation.response;
    if (evaluation.hasErrors && evaluation.correction) {
      content += `\n(Hebrew Correction: ${evaluation.correction})`;
    }

    // Log chat activity to reporting service asynchronously
    const reportingServiceUrl = process.env.REPORTING_SERVICE_URL || 'http://localhost:3004';
    const userId = req.auth?.sub;
    if (userId) {
      fetch(`${reportingServiceUrl}/api/reports/activities/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityType: 'chat',
          chatTopic: 'General English Practice',
          successRate: evaluation.hasErrors ? 0 : 100,
          timeSpent: 15, // estimated time spent per message exchange
          details: {
            message,
            response: content,
            hasErrors: evaluation.hasErrors
          }
        })
      }).catch(err => {
        console.error('Failed to log chat activity to reporting service:', err.message);
      });
    }

    res.json({
      role: 'bot',
      content: content,
      evaluation: {
        hasErrors: evaluation.hasErrors,
        correction: evaluation.correction
      }
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// POST /api/bot/evaluate
// Returns structured evaluation JSON (response, hasErrors, correction)
router.post('/evaluate', authenticateToken, async (req, res) => {
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
    
    const levelKey = await getChildLevel(req);
    const cefrLevel = LEVEL_MAPPING[levelKey] || 'A1 (Beginner)';

    const dynamicInstruction = `${SYSTEM_PROMPT}
    
CRITICAL CONSTRAINT: You must adjust your vocabulary, syntax, complexity, and topics to precisely target the English level: **${cefrLevel}**.
- If A1: Use only simple present tense, very common words (e.g. dog, cat, apple, like, run), and very short questions.
- If A2: Use simple present and simple past tense, simple conjunctions, and slightly broader vocabulary.
- If B1: Use a mix of tenses (including perfect tenses), more varied adjectives/adverbs, and discuss slightly more advanced everyday topics.`;

    const chatSession = ai.chats.create({
      model: 'gemini-3.1-flash-lite',
      config: {
        systemInstruction: dynamicInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: EVALUATION_SCHEMA
      },
      history: formattedHistory
    });

    let evaluation;
    try {
      // Send the new message
      const response = await chatSession.sendMessage({ message });
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
    } catch (apiError) {
      console.warn('Gemini API request failed in evaluate, using fallback response. Error:', apiError.message);
      evaluation = {
        response: "I like talking to you! Let's practice more.",
        hasErrors: false,
        correction: ""
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

    // Call Gemini 3.1 Flash Lite native Speech-To-Text
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
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
router.get('/starter', authenticateToken, async (req, res) => {
  try {
    const ai = getAIClient();
    
    const levelKey = await getChildLevel(req);
    const cefrLevel = LEVEL_MAPPING[levelKey] || 'A1 (Beginner)';

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

    // Use AI to generate a dynamic starter matching the level
    const prompt = `
      Generate a very simple, fun conversation starter in English for a child (age 6-12).
      It should be just one or two short sentences asking a question.
      The starter must target the CEFR level: **${cefrLevel}**.
      Do not include any Hebrew. Do not include quotes.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
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
