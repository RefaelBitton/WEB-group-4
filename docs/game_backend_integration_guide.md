# Game Backend Integration Guide

This guide is for Tal (and their agent) to successfully integrate the `game-service` backend with the newly prepared frontend UI.

## Overview
The frontend Minigames Hub (`packages/frontend/src/features/game`) has been updated to be entirely data-driven. The UI components no longer contain hardcoded questions or answers. Instead, they dynamically render options based on the JSON payload they receive from the API.

To complete the frontend-backend integration, you only need to update the API functions and ensure the backend returns the data in the expected schema.

---

## 1. Where to Connect
All API calls for the game feature are located in a single file on the frontend:
[packages/frontend/src/features/game/logic/gameApi.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/frontend/src/features/game/logic/gameApi.js)

You will need to replace the placeholder/mock implementation of two specific functions:
- `fetchGameSession(gameId)`
- `submitGameAnswer(gameId, payload)`

Make sure your backend routes the requests properly through the **API Gateway** before hitting the Game Service microservice.

---

## 2. Expected Data Schema (fetchGameSession)

When a user selects a game or finishes a question, the frontend calls `fetchGameSession(gameId)` to get the next question. Your backend endpoint (e.g., `GET /api/games/:gameId/session`) **must** return a JSON object matching the following structure:

```json
{
  "id": "q123", // Unique ID for the question
  "text": "The cat is sitting ___ the table.", // Used for sentence-completion or quick-translation
  "imageUrl": "https://url.to/image.jpg", // Used ONLY for image-recognition (can be null for others)
  "options": [
    { "id": "opt1", "text": "on" },
    { "id": "opt2", "text": "in" },
    { "id": "opt3", "text": "under" },
    { "id": "opt4", "text": "above" }
  ]
}
```

### Component Breakdown
- **Image Recognition**: Ignores `text`, renders `imageUrl` as the main image, and maps the `options` array into clickable buttons.
- **Sentence Completion / Quick Translation**: Renders `text` prominently on the screen and maps the `options` array into clickable buttons.

---

## 3. Submitting Answers (submitGameAnswer)

When the child clicks one of the option buttons, the frontend will automatically call `submitGameAnswer(gameId, payload)`.

The frontend currently sends the following JSON payload via a `POST` request:
```json
{
  "answerId": "opt1" // The ID of the option the user selected
}
```

### Backend Responsibilities:
1. Validate if `answerId` is correct for the current session's active question.
2. Calculate and award points (Grammar Hero points).
3. Return the result (e.g., `{ correct: true, pointsEarned: 10 }`).
*(Note: After an answer is submitted, the frontend automatically triggers `fetchGameSession` again to load the next question).*

---

## Summary of Next Steps for Tal:
1. Build the Node.js/Express `game-service`.
2. Define the MongoDB schemas for questions, options, and game state.
3. Expose the `GET` (fetch question) and `POST` (submit answer) endpoints.
4. Route these endpoints through the `api-gateway`.
5. Remove the `Promise.resolve` mock code inside `frontend/.../gameApi.js` and replace it with a real `fetch()` call pointing to the gateway.
