# Production Deployment Guide: English Learning Bot

> [!IMPORTANT]
> **NOTE FOR AI AGENTS:** If you modify configurations, add environment variables, or update services that affect how this application is run or deployed, **you MUST update this guide** to keep it current.

This document guides developers and autonomous agents on how to deploy the English Learning Bot microservices monorepo to production platforms (such as Render, Vercel, Railway, or AWS).

---

## 1. General Architecture & Web Traffic Flow

In production, all requests from the React frontend are routed as follows:
1. **Frontend Assets**: Deployed to Vercel/Netlify.
2. **API Requests**: Sent to the **API Gateway** endpoint.
3. **WebSockets/Signaling**: The frontend connects to the WebSocket server running directly inside the **API Gateway**.
4. **Service Proxying**: The API gateway proxies API endpoints `/api/users`, `/api/bot`, `/api/games`, `/api/reports` to their respective microservices.

---

## 2. Environment Variables Configuration

Ensure the following environment variables are configured in your production hosting dashboards.

### A. API Gateway
- `PORT`: The port the gateway server binds to (e.g., `4000`).
- `USER_SERVICE_URL`: Deployed URL of the User Service (e.g., `https://user-service.onrender.com`).
- `BOT_SERVICE_URL`: Deployed URL of the Bot/AI Service (e.g., `https://bot-service.onrender.com`).
- `GAME_SERVICE_URL`: Deployed URL of the Game Service (e.g., `https://game-service.onrender.com`).
- `REPORTING_SERVICE_URL`: Deployed URL of the Reporting Service (e.g., `https://reporting-service.onrender.com`).

### B. Frontend React App (Vercel / Netlify)
- `VITE_API_URL`: The URL of the deployed **API Gateway** (e.g., `https://api-gateway.onrender.com`).
- **Build Settings**:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Root directory constraint: Build from `EX2/packages/frontend`.

### C. Backend Microservices
All microservices must be connected to a shared production MongoDB database (e.g., MongoDB Atlas).
- `PORT`: Port the service runs on.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secure secret string for user token signatures.
- `OPENAI_API_KEY`: Required for the Bot/AI service.

---

## 3. WebSockets & WebRTC Production Checklist

1. **HTTPS and WSS Enforcement**:
   - WebRTC media device capture (`navigator.mediaDevices.getUserMedia`) and WebSocket secure handshakes **require HTTPS/WSS**. Ensure all production endpoints use SSL.
2. **WebSockets CORS**:
   - In `packages/api-gateway/index.js`, socket.io is configured to allow `origin: "*"`. In production, restrict this to your specific frontend domain:
     ```javascript
     const io = new Server(server, {
       cors: {
         origin: "https://your-frontend-domain.com",
         methods: ["GET", "POST"]
       }
     });
     ```
3. **STUN/TURN Configuration**:
   - The Practice Arena uses Google's public STUN servers for local NAT traversal.
   - For restricted networks (symmetric firewalls), configure a TURN server (e.g., via Coturn, Xirsys, or Twilio Network Traversal API) in `EX2/packages/frontend/src/features/arena/logic/webrtcHandler.js`:
     ```javascript
     const configuration = {
       iceServers: [
         { urls: "stun:stun.l.google.com:19302" },
         {
           urls: "turn:your-turn-server.com",
           username: "username",
           credential: "password"
         }
       ]
     };
     ```
