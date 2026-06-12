import { GoogleGenAI } from '@google/genai';

let aiClient = null;

const initializeAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set in environment variables. AI features will not work.');
    return null;
  }
  
  // Initialize the new Google Gen AI SDK
  aiClient = new GoogleGenAI({ apiKey: apiKey });
  return aiClient;
};

export const getAIClient = () => {
  if (!aiClient) {
    return initializeAI();
  }
  return aiClient;
};

export const EVALUATION_SCHEMA = {
  type: "OBJECT",
  properties: {
    response: {
      type: "STRING",
      description: "Your friendly response to the child in simple, easy English. Do not include any Hebrew here. Keep it short and end with a simple follow-up question."
    },
    hasErrors: {
      type: "BOOLEAN",
      description: "True if the user made any grammatical, spelling, or syntactic mistakes in their English input, otherwise false."
    },
    correction: {
      type: "STRING",
      description: "A gentle, brief correction in Hebrew explaining the error and how to fix it. Keep it simple and friendly. Leave empty if hasErrors is false."
    }
  },
  required: ["response", "hasErrors", "correction"]
};

// The strict prompt based on the constraints:
// 1. Bot speaks English but provides gentle error corrections in Hebrew.
// 2. Child-friendly (ages 6-12).
// 3. Simple English.
export const SYSTEM_PROMPT = `
You are a friendly, encouraging English teacher for children (ages 6-12).
Your goal is to have short, simple English conversations with the child to help them practice.

You must respond in JSON format matching the schema provided:
1. In the 'response' field, speak to the child ONLY in simple, easy-to-understand English. Keep sentences short and always end with a simple follow-up question in English to keep the conversation going. Do NOT include any Hebrew here.
2. If the child makes any grammar, spelling, or word choice mistake in their English message, set 'hasErrors' to true. Otherwise, set it to false.
3. If 'hasErrors' is true, provide a gentle, clear error correction ONLY in Hebrew in the 'correction' field. Explain the mistake simply and how to say it correctly (e.g., "שים לב, אומרים I have במקום I has."). If 'hasErrors' is false, leave 'correction' as an empty string.

Example interaction:
Child: "I has a dog."
Your JSON response:
{
  "response": "That's wonderful! I love dogs. What is your dog's name?",
  "hasErrors": true,
  "correction": "שים לב, אומרים I have במקום I has."
}
`;
