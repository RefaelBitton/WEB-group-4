# Bot Service Integration Guide

This guide is intended for developers and AI agents working on other parts of the English Learning Bot project (e.g., API Gateway, Frontend). It explains how to interact with the **Bot/AI Service** from a coding perspective.

## Overview

The Bot Service is a Node.js/Express microservice that handles AI chat capabilities. It uses the `@google/genai` SDK and the `gemini-2.5-flash` model to provide English conversation functionality with Hebrew error corrections (as defined by its system prompt).

- **Default Port:** `5002` (configurable via `.env`)
- **Base URL:** `http://localhost:5002`

## Environment Setup

To run the Bot Service locally, ensure you have a `.env` file in `EX2/services/bot-service/` with the following variables:

```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
PORT=5002
```

## API Endpoints

The service exposes the following endpoints. Note that CORS is currently enabled for testing purposes, allowing direct calls from the frontend if the API Gateway is not yet fully configured.

### 1. Health Check
Check if the service is running.

- **Method:** `GET`
- **Path:** `/health`
- **Response:**
  ```json
  {
    "status": "OK",
    "service": "Bot/AI Service"
  }
  ```

### 2. Get Conversation Starter
Generates a random, simple English conversation starter for a child (ages 6-12). If the AI client fails or is not configured, it returns a hardcoded fallback starter.

- **Method:** `GET`
- **Path:** `/api/bot/starter`
- **Response:**
  ```json
  {
    "starter": "Hello! What is your favorite animal?"
  }
  ```

### 3. Send Chat Message
Sends a new message from the user to the bot, taking previous conversation history into account.

- **Method:** `POST`
- **Path:** `/api/bot/chat`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "message": "The text the user just said or typed",
    "history": [
      {
        "role": "user",
        "content": "Hi bot!"
      },
      {
        "role": "bot",
        "content": "Hello! How are you today?"
      }
    ]
  }
  ```
  *Note:* The `history` array maps `user` to the user's messages and `bot` to the AI's previous responses. The backend automatically formats this for the Gemini API (`user` -> `user`, `bot` -> `model`).

- **Success Response (200 OK):**
  ```json
  {
    "role": "bot",
    "content": "I'm doing well, thank you! What did you do at school today?"
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: If the `message` field is missing.
  - `503 Service Unavailable`: If the AI service fails to initialize (e.g., missing API key).
  - `500 Internal Server Error`: If generating the response fails.

## Integration Notes for Frontend / API Gateway Agents

1. **Routing:** If you are building the API Gateway, you should route frontend requests from `/api/bot/*` to `http://bot-service:5002/api/bot/*` (or whatever the host/port is in your environment).
2. **State Management:** The frontend is responsible for maintaining the `history` array and sending the full history with every `POST /api/bot/chat` request. The Bot Service is stateless and does not store conversation history in a database directly.
3. **Audio Handling:** Currently, the endpoints only accept text (`message`). Any Speech-to-Text (STT) processing should happen before calling this endpoint (either in the frontend using Web Speech API or in a separate handler).
