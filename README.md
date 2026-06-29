# English Quest - B4 English Learning Application for Children

<br />
<div align="center">
  <a href="https://github.com/RefaelBitton/WEB-group-4">
    <img src="./logo.png" alt="Logo" width="300" height="200" style="object-fit: cover; border-radius: 10px;">
  </a>

<h3 align="center">English Quest</h3>
  <p align="center">
    English Quest is an interactive, gamified microservices-based application designed to teach English to children.
  </p>
</div>

## About


English Quest is an interactive, gamified microservices-based application designed to teach English to children (Ages 6-12). The application combines advanced artificial intelligence (LLM), gamification mechanics, and peer-to-peer real-time communication to create a supportive and engaging environment for young English learners.



## 💡 The Core Idea

The main objective of **English Quest** is to help children practice and learn English in a fun, pressure-free environment while giving parents comprehensive tools to track their children's progress.

### Key Features
1. **Interactive AI Chatbot (Bot Service)**:
   - Powered by Google Gemini AI (`gemini-3.1-flash-lite`) via the `@google/genai` SDK.
   - Provides a conversational partner that adapts dynamically to the child's age and English level.
   - **Bilingual Interface**: The bot speaks strictly in English, but provides gentle, constructive grammar corrections in Hebrew.
   - Supports voice input (Speech-to-Text) using multimodal voice processing directly through Gemini API.
2. **Gamified Minigames (Game Service)**:
   - **Image Recognition**: Children identify items in images and type/select the correct English word.
   - **Sentence Completion**: Interactive exercises to practice grammar rules.
   - **Translation**: Translating words and sentences between Hebrew and English.
3. **P2P English Practice Arena**:
   - Allows two children to connect directly via WebSockets and WebRTC for peer-to-peer real-time voice calls.
   - Shows dynamic conversation prompt cards to help them converse in English.
4. **Parent Dashboard & Gamification (Reporting & User Services)**:
   - **Parent Portal**: View analytical progress reports (success rates, time spent, categories covered).
   - **Grammar Hero Points**: Child accounts earn experience points, ranks, and achievements (e.g. badges) for completing exercises.
   - **Real-Time Toast Notifications**: Parent dashboard listens to WebSockets and updates live when the child earns points/badges.
5. **Strict Hebrew UI Rule**:
   - To make the app accessible to children and parents, all UI buttons, menus, notifications, and navigation elements are in Hebrew. English is reserved exclusively for the learning material and conversations.

---

## 🛠️ Tech Stack

The application is architected as a **Monorepo** running independent microservices communicating through an **API Routing Gateway**.

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (configured via `@tailwindcss/vite` plugin)
- **State Management**: Zustand (for lightweight and reactive stores: user session, WebRTC arena, and gamification)
- **Real-Time Communication**: Socket.io-client (for signaling and live updates)
- **WebRTC**: Browser native WebRTC APIs for peer-to-peer voice streaming

### Backend Services (Express / Node.js)
1. **API Gateway**: Public entry point, proxy routing, and WebRTC Socket.io signaling server.
2. **User Service**: Parent/child registration and login with JWT and custom PIN protection.
3. **Bot Service**: Handles Gemini API calls, conversation starters, voice translation, and STT.
4. **Game Service**: Prepares and validates game sessions (InMemory JSON backups & DB collections).
5. **Reporting Service**: Point/achievement engine, logs actions, aggregates analytics for parents.

### Database & Resiliency
- **Database**: MongoDB & Mongoose ODM.
- **Database Fallback System**: To enable seamless local offline development and testing, both the Game and Reporting services feature an automatic in-memory fallback. If MongoDB is unavailable, the services automatically run using local memory queues and JSON files, avoiding system crashes.

---

## 🚀 Deployment Status

### Platform Details
- **Database**: Hosted on **MongoDB Atlas** (M0 Free Shared Cluster).
- **Backend Services**: Hosted on **Render** (Free Web Service). To stay within Render's free tier limits and prevent multi-service resource depletion, all 5 backend microservices are bundled and run inside a single container using a custom production launcher.
- **Frontend Assets**: Hosted on **Vercel / Netlify** (CDN static hosting for the React bundle).

### ⚠️ Crucial Deployment Note
> [!WARNING]
> **Active Directory Deployment Info**
> The current live deployment of this project is set up to build and deploy from the **`EX2`** folder. 
> The final, fully polished, and completed project code resides in the **`Project`** folder. 
> This separation exists because the deployment configuration was established prior to final project submission. The structure of both folders is identical, but the grading evaluation and final code check should refer to the **`Project`** directory.

---

## 📂 Project Structure

```
├── Project/                   # Final project monorepo folder
│   ├── packages/              # Monorepo workspaces
│   │   ├── api-gateway/       # Gateway & WebSockets server
│   │   ├── user-service/      # Authentication & profiles microservice
│   │   ├── bot-service/       # AI & audio-transcription microservice
│   │   ├── game-service/      # Games logic & validation microservice
│   │   ├── reporting-service/ # Points, achievements & reports microservice
│   │   └── frontend/          # React client application (Vertical Slicing)
│   ├── start-production.mjs   # Spawns all backend services in a single container
│   ├── package.json           # Monorepo root workspace settings
│   └── render.yaml            # Render deployment blueprint
│
├── EX2/                       # Active deployment monorepo folder (identical structure)
├── docs/                      # Extensive specifications, database diagrams, and API documentation
└── README.md                  # This file
```

---

## 💻 How to Run Locally

You can run the entire monorepo stack (frontend + all 5 microservices) simultaneously with a single command.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally, or a **MongoDB Atlas Connection URI**
- A **Google Gemini API Key** (for chatbot and voice transcription features)

### 2. Setting Up Environment Variables
Navigate to your desired workspace (e.g., the `Project` folder):
```bash
cd Project # Or "cd EX2"
```

Create a `.env` file in the root of the folder and configure the following variables (refer to `.env.example` as a template):
```env
# API Gateway Configuration
PORT=3000
API_GATEWAY_PORT=4000

# Microservice Local Inter-communication
USER_SERVICE_URL=http://127.0.0.1:3001
BOT_SERVICE_URL=http://127.0.0.1:3002
GAME_SERVICE_URL=http://127.0.0.1:3003
REPORTING_SERVICE_URL=http://127.0.0.1:3004

# Database Configuration (MongoDB URI)
MONGO_URI=mongodb://localhost:27017/english_learning_bot

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Installation
Install all dependencies for all workspace packages from the root of the folder:
```bash
npm install
```

### 4. Running in Development Mode
To start all 5 backend microservices and the React frontend concurrently with hot-reloading active:
```bash
npm run dev
```
Once run, the services will start:
- **React Frontend**: `http://localhost:5173`
- **API Gateway**: `http://localhost:4000`
- **Microservices**: Localhost ports `3001` through `3004`

### 5. Running in Production Mode (Unified Container Simulation)
To simulate the unified container deployment where all backend microservices are spawned as child processes under a single Node.js instance:
```bash
npm start
```
This runs the `start-production.mjs` wrapper script which orchestrates all backend components.
