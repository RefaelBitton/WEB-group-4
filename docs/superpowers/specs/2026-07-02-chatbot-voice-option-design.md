# Chatbot Voice Option (Talk Back) Design Spec

## Overview
Add a voice option (Text-to-Speech) to the English chatbot so that it talks back (reads responses aloud) after the user interacts using the microphone. This will be implemented entirely client-side using the browser's Web Speech API (`SpeechSynthesis`), ensuring zero latency, zero server costs, and instant audio feedback.

## Requirements
1. **Global Voice Mode Toggle**: A toggle button in the chat interface next to the microphone. When active (represented by `Volume2` icon), the bot will automatically read its English response aloud. When inactive (represented by `VolumeX` icon), automatic reading is disabled.
2. **Auto-Trigger on Microphone Use**: If the user sends a message using the voice-recording microphone, the voice option should automatically play the bot's response, or toggle the global voice mode to active.
3. **Replay Option on Messages**: A small replay speaker button (`Volume2` icon) next to or on each bot message bubble, allowing the child to replay the speech for that specific message at any time.
4. **English Only**: The SpeechSynthesis should only read the English response part (`evaluation.response`), skipping any Hebrew corrections, and use an English voice (`en-US`).
5. **No Emojis for Controls**: Use standard Lucide stock icons (`Volume2`, `VolumeX`) for the UI controls.

## Proposed Changes

### Frontend Component & Logic

#### [MODIFY] [botState.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/data/botState.js)
* **New States**:
  * `voiceEnabled`: Boolean state persisting in `localStorage` (defaulting to `false`).
  * `usedMicForMessage`: Boolean ref or state to track if the current message was recorded via mic.
* **Helper Function**:
  * `speakText(text)`:
    * Call `window.speechSynthesis.cancel()` to stop any current speech.
    * Parse/sanitize input (ensure we only read the English text).
    * Create a `SpeechSynthesisUtterance`.
    * Set `lang` to `'en-US'`.
    * Select an English voice if available (e.g. searching through `window.speechSynthesis.getVoices()`).
    * Call `window.speechSynthesis.speak(utterance)`.
* **Hooks & Logic**:
  * When `toggleRecording` completes successfully (and returns a transcription), set `usedMicForMessage` to `true`.
  * In the `sendMessage` function:
    * Keep track of the `usedMicForMessage` state for the message being sent.
    * Reset the `usedMicForMessage` ref to `false` for the next input.
    * In the `.then()` block after the bot's response arrives: if `voiceEnabled` is `true` OR if the message was sent via microphone, call `speakText(response.evaluation.response || response.content)`.
  * Return `voiceEnabled`, `setVoiceEnabled`, and a `speakText` function from `useBot()`.

#### [MODIFY] [BotChat.jsx](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/bot/presentation/BotChat.jsx)
* Import `Volume2` and `VolumeX` from `lucide-react`.
* In the bot message bubble:
  * Add a small replay button using the `Volume2` icon. Clicking it calls `speakText(message.text)` (filtering out the Hebrew correction portion).
* In the input control area (next to the mic button):
  * Add the global voice toggle button using `Volume2` (when `voiceEnabled` is true) and `VolumeX` (when `voiceEnabled` is false). Clicking it toggles `voiceEnabled`.
  * Keep visual styles premium, using existing Tailwind classes to style the buttons.

## Verification Plan

### Manual Verification
1. Open the Chatbot interface.
2. Toggle the Speaker button to "On" (active). Type a message and send it. Verify that the bot response is read aloud in English.
3. Toggle the Speaker button to "Off" (inactive). Type a message and send it. Verify that no speech is played.
4. With the Speaker button "Off", click the Microphone button, record a message, and send it. Verify that the bot response is automatically read aloud (or turns the Speaker option on).
5. Click the replay button next to a bot message. Verify that the English response is read aloud, and that any Hebrew correction in the bubble is NOT read aloud.
