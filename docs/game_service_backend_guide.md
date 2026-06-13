# Game Service Backend Guide

This guide is for developers and AI agents working with Tal's Sprint 2 Game Service implementation.

## Overview

The Game Service is a Node.js/Express microservice that manages minigame types, questions, active sessions, answer validation, and point scoring for the English Learning Bot project.

- **Default Port:** `3003` via `GAME_SERVICE_PORT`
- **Base URL:** `http://localhost:3003`
- **Gateway URL:** `http://localhost:3000/api/games`

The service defines MongoDB schemas for:
- `GameType`
- `Question`
- `GameSession`

If MongoDB is not available during local development, the service still runs with seeded in-memory questions so the frontend can keep working.

## Environment Setup

Use the root `EX2/.env` file or copy from `EX2/.env.example`:

```env
GAME_SERVICE_PORT=3003
MONGO_URI=mongodb://localhost:27017/english_learning_bot
```

## API Endpoints

### 1. Health Check

- **Method:** `GET`
- **Path:** `/health`
- **Response:**

```json
{
  "status": "UP",
  "service": "Game Service",
  "dbConnected": true,
  "timestamp": "2026-06-13T00:00:00.000Z"
}
```

### 2. List Games

- **Method:** `GET`
- **Path:** `/api/games/list`
- **Gateway Path:** `/api/games/list`
- **Response:**

```json
{
  "games": [
    {
      "id": "image-recognition",
      "name": "משחק זיהוי תמונות",
      "description": "בחירת המילה באנגלית שמתארת את התמונה."
    }
  ]
}
```

### 3. Fetch Game Session Question

- **Method:** `GET`
- **Path:** `/api/games/:gameId/session`
- **Gateway Path:** `/api/games/:gameId/session`

Supported `gameId` values:
- `image-recognition`
- `sentence-completion`
- `quick-translation`

The endpoint selects the next active question and stores it as the active question for answer validation.

```json
{
  "id": "sent-cat-table-1",
  "text": "The cat is sitting ___ the table.",
  "imageUrl": null,
  "options": [
    { "id": "on", "text": "on" },
    { "id": "in", "text": "in" },
    { "id": "under", "text": "under" },
    { "id": "above", "text": "above" }
  ]
}
```

The response intentionally does not expose which option is correct.

### 4. Submit Answer

- **Method:** `POST`
- **Path:** `/api/games/:gameId/answer`
- **Gateway Path:** `/api/games/:gameId/answer`
- **Headers:** `Content-Type: application/json`

```json
{
  "answerId": "on"
}
```

Success response:

```json
{
  "correct": true,
  "pointsEarned": 10,
  "correctAnswerId": "on",
  "questionId": "sent-cat-table-1"
}
```

## Integration Notes

1. Frontend game calls should go through the API Gateway at `/api/games`.
2. The frontend should call `GET /api/games/:gameId/session` before submitting an answer.
3. The service currently uses a default session key until real child/session identity is passed from authentication.
4. When user identity is integrated, replace the default session key with the authenticated child id or a real game session id.
