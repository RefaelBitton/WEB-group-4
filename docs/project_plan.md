# Project Plan: English Learning Bot for Children (Ages 6-12)

## 1. Project Overview & Architecture Setup

**Tech Stack:** React, Node.js/Express, MongoDB, REST API, OpenAI API, Vercel/Render.
**Constraints:**
- **Hebrew UI Strict Rule:** All frontend UI elements, buttons, menus, and system prompts shown to the user MUST be in Hebrew. English is ONLY used for learning material/chat.
- **Architecture:** Microservices Architecture (User, Bot/AI, Game, Reporting) instead of a monolith.
- **API Gateway:** An API Routing Gateway must be established to manage communication between the React frontend and the backend microservices.
- **Frontend Architecture:** Vertical slicing. Reorganize the `EX2` directory so every frontend service has its own `logic` (API calls to gateway), `data` (state/models), and `presentation` (React components) folders.

### Microservices Definition
1. **API Gateway:** Routes frontend requests to the appropriate microservice.
2. **User Service:** Handles authentication (parents and kids), profiles, and session management.
3. **Bot/AI Service:** Manages Speech-to-Text, Text-to-Speech, OpenAI API interactions, and Hebrew error corrections.
4. **Game Service:** Manages minigames logic, validation, and scoring.
5. **Reporting Service:** Tracks user history, gamification ("Grammar Hero" points), and generates parent reports.

---

## Sprint 1: Infrastructure, Architecture & User Foundation (Week 1)

**Goal:** Set up the API Gateway, microservice skeletons, database schemas, and reorganize the frontend (`EX2` directory). Build basic user authentication.

### Oshri (Lead & DevOps)
- [ ] Initialize the mono-repo or multi-repo structure for the microservices.
- [ ] Create the **API Gateway** service (Node.js/Express) and set up routing to placeholder microservice ports.
- [ ] Set up the MongoDB cluster and configure connection strings for each microservice.
- [ ] Deploy the API Gateway and base microservices to Render/Vercel (CI/CD setup).

### Matan (Frontend Architect)
- [x] Reorganize the existing `EX2` frontend directory into a vertical slice architecture (e.g., `src/features/user`, `src/features/bot`).
- [x] Inside each feature folder, create `logic/`, `data/`, and `presentation/` subdirectories.
- [x] Set up the base React routing to connect to the API Gateway.
- [ ] Ensure the base layout and global styles (Tailwind/CSS) follow the Hebrew right-to-left (RTL) standard.

### Tal (Backend - User Service)
- [ ] Build the **User Service** (Node.js/Express).
- [ ] Create MongoDB schemas for `User` (Child/Parent roles).
- [ ] Implement REST endpoints for Parent Login, Child Login, and Profile creation.
- [ ] Integrate JWT authentication and connect it to the API Gateway routing.

### Refael (Frontend - User Service & UI)
- [ ] Create the Login/Signup components (`presentation`) with **strict Hebrew UI**.
- [ ] Implement state management (`data`) for user sessions.
- [ ] Implement API calls (`logic`) to the API Gateway `/api/users` endpoints.
- [ ] Build the Parent Portal dashboard skeleton (Hebrew UI).

### Dinza (Backend - Bot/AI Service Foundation)
- [ ] Build the **Bot/AI Service** skeleton (Node.js/Express).
- [ ] Set up OpenAI API connection and prompt engineering foundation.
- [ ] Implement a basic `/api/bot/chat` endpoint via the API Gateway.
- [ ] Create the logic to generate a random English conversation starter upon chat entry.

---

## Sprint 2: The Core Bot, Speech, & Minigames (Week 2)

**Goal:** Deliver the interactive English bot (with Speech-to-Text) and build the core minigames.

### Dev 1 (Backend - Bot/AI Service)
- [ ] Implement the prompt logic to enforce: Bot speaks English but provides gentle error corrections in Hebrew.
- [ ] Integrate a Speech-to-Text (STT) service (e.g., OpenAI Whisper or Web Speech API backend handler) in the Bot Service.
- [ ] Create an endpoint for evaluating student messages and returning the bot's response + Hebrew correction.
- [ ] Ensure all bot endpoints are correctly routed through the API Gateway.

### Dev 2 (Frontend - Bot UI)
- [ ] Build the Chat Interface (`presentation`) in the Bot feature slice (Hebrew UI for buttons/menus).
- [ ] Implement microphone recording functionality in the browser and send audio/text to the API Gateway (`logic`).
- [ ] Display the random conversation starter when the chat window opens.
- [ ] Render the bot's English response and highlight the Hebrew error corrections distinctively.

### Dev 3 (Backend - Game Service)
- [ ] Build the **Game Service** (Node.js/Express).
- [ ] Create MongoDB schemas for `GameType`, `Question`, and `GameSession`.
- [ ] Implement endpoints for fetching game data (Image Recognition, Sentence Completion, Translation).
- [ ] Implement an endpoint to validate answers and calculate score/points. Route through API Gateway.

### Dev 4 (Frontend - Minigames UI)
- [ ] Build the Minigames Hub (`presentation`) (Hebrew menus/instructions).
- [ ] Implement the Image Recognition game component.
- [ ] Implement the Sentence Completion game component.
- [ ] Implement the Translation game component.

### Dev 5 (Backend/Frontend - Integration)
- [ ] Connect the frontend game components to the API Gateway `/api/games` endpoints (`logic`).
- [ ] Manage the state of active games (`data`) and handle transitions between questions.
- [ ] Handle error states and loading screens (in Hebrew) during bot and game API calls.

---

## Sprint 3: Progress Tracking, Reports, & Deployment (Week 3)

**Goal:** Implement history tracking, gamification ("Grammar Hero"), parent reports, and finalize deployment.

### Dev 1 (Backend - Reporting Service)
- [ ] Build the **Reporting Service** (Node.js/Express).
- [ ] Create MongoDB schemas for `ActivityLog` and `Achievement`.
- [ ] Implement event listeners or endpoints to record chat activity and game scores into the history database.
- [ ] Expose API Gateway endpoints for fetching aggregated progress data (subjects covered, success rates, time spent).

### Dev 2 (Backend - Gamification)
- [ ] Implement the "Grammar Hero" points system in the Reporting Service.
- [ ] Create logic to award badges/points based on milestones (e.g., 5 correct sentences, 10 minutes played).
- [ ] Provide an API Gateway endpoint to fetch the child's current rank and point total.

### Dev 3 (Frontend - Parent Reports UI)
- [ ] Build the Parent Report Dashboard (`presentation`) (Strictly Hebrew UI).
- [ ] Create charts/visualizations for success rates, time spent, and subjects covered.
- [ ] Connect the dashboard to the API Gateway `/api/reports` endpoints (`logic`).
- [ ] Ensure data updates dynamically based on the selected child profile.

### Dev 4 (Frontend - Gamification UI & Polish)
- [ ] Build the child-facing "Grammar Hero" profile view (Hebrew UI).
- [ ] Implement animated pop-ups or notifications for when a child earns points/badges during chat or games.
- [ ] Conduct a thorough review of the entire frontend to ensure **zero English** exists in the UI elements (buttons, nav, prompts).

### Dev 5 (QA, Polish & Final Deployment)
- [ ] Conduct End-to-End (E2E) testing on the API Gateway routing and microservice intercommunication.
- [ ] Verify the vertical slicing folder structure in the frontend (`EX2`) adheres to the `logic`, `data`, `presentation` rule.
- [ ] Perform final deployment checks on Vercel/Render for all services and the frontend.
- [ ] Fix any outstanding UI bugs and optimize load times.
