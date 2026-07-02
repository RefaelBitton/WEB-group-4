# Chatbot RTL Corrections Design Spec

## Overview
Modify the chatbot's AI generation schema and UI presentation to prevent mixing English and Hebrew characters in the same line of text. This resolves browser Right-to-Left (RTL) rendering bugs by isolating the Hebrew explanation (which will contain 100% Hebrew characters) from the English examples/sentences (which will contain 100% English characters).

## Requirements
1. **AI Response Schema Update**:
   - Add a new field `correctedSentence` (STRING) to the evaluation JSON.
   - Update `correction` field description to forbid any English characters or words (A-Z, a-z).
2. **System Prompt Update**:
   - Add explicit instructions to forbid English characters in the Hebrew `correction` field, requiring rules to be described purely in Hebrew.
   - Instruct the AI to output the correct English sentence in the `correctedSentence` field.
3. **Backend Legacy Compatibility**:
   - The backend `/api/bot/chat` endpoint should continue to append the corrections to `content` for legacy API clients. But it must also return the new `correctedSentence` in the `evaluation` payload.
   - Format `content` so that the Hebrew line has absolutely zero English prefix like `(Hebrew Correction: `. Instead, append the raw Hebrew correction.
4. **Frontend UI Rendering**:
   - Render the Hebrew correction in its own dedicated RTL block.
   - Render the correct English sentence in its own LTR block with a clean label like "Correct sentence:".
   - Parse messages in `botState.js` to preserve the structured `evaluation` metadata.

## Proposed Changes

### Backend - Bot Service

#### [MODIFY] [aiPromptSetup.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/bot-service/src/utils/aiPromptSetup.js)
* Update `EVALUATION_SCHEMA` to include `correctedSentence`.
* Update `EVALUATION_SCHEMA` and `SYSTEM_PROMPT` to enforce 100% Hebrew in `correction` and output the correct English version in `correctedSentence`.

#### [MODIFY] [chat.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/bot-service/src/routes/chat.js)
* Update legacy `content` formatting: do not prepend `(Hebrew Correction: ` to the Hebrew correction text.
* Append `\n\nCorrect: ${evaluation.correctedSentence}` to `content` for legacy compatibility.
* Return `correctedSentence` in the `/chat` response JSON evaluation object.

### Frontend - Chat Feature

#### [MODIFY] [botState.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/data/botState.js)
* When receiving the bot's response, store it as an object with `role`, `text` (which will be `response.evaluation?.hasErrors ? response.content.split('\n\n')[0] : response.content` to get the clean English response), and the `evaluation` metadata itself.

#### [MODIFY] [BotChat.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/presentation/BotChat.jsx)
* Update bot message rendering:
  * Check if `message.evaluation` is present.
  * Render the main English response (`message.text`) in LTR.
  * If `message.evaluation.hasErrors` is true, render the Hebrew explanation (`message.evaluation.correction`) in its own RTL-aligned styled card.
  * Render the `message.evaluation.correctedSentence` in its own LTR-aligned styled card with a "Correct sentence:" prefix.
  * Fall back to the old string splitting logic only if `message.evaluation` is not present (for backward compatibility with old local storage history).

## Verification Plan

### Automated Build Check
- Run `npm run build -w packages/frontend` to ensure compilation is successful.

### Manual Verification
1. Open the Chatbot interface.
2. Enter a message with a grammatical error (e.g., "I has a cat").
3. Verify that:
   - The bot replies with a clean English response.
   - The Hebrew correction box appears with 100% Hebrew text (no English letters/brackets) aligned to the right (RTL).
   - The English correct sentence appears in a separate box below, aligned to the left (LTR).
