# Sprint 3 Frontend Implementation Guide (Dean's Tasks)

This document is a comprehensive guide to help you implement the frontend tasks for Sprint 3. The backend APIs, gamification mechanics, and WebRTC signaling have all been completed by Rafael and are ready for you to connect to.

## 1. Gamification: "Grammar Hero" Profile

You need to build the child-facing "Grammar Hero" profile view.
Remember the **Strict Hebrew UI Rule**: All text, buttons, and navigation must be in Hebrew!

### Backend Endpoints Available

- **Fetch Gamification Stats:**
  - **URL:** `GET /api/reports/gamification/:userId`
  - **Response Example:**
    ```json
    {
      "points": 150,
      "rank": "Intermediate Learner",
      "achievements": ["FIRST_CORRECT_SENTENCE", "FIRST_GAME_COMPLETED"]
    }
    ```

- **Award Points / Trigger Event (Simulate game finish or bot chat):**
  - **URL:** `POST /api/reports/gamification/award`
  - **Body Example:**
    ```json
    {
      "userId": "child-object-id-here",
      "eventType": "correct_sentence" // Options: correct_sentence, play_10_mins, game_completed
    }
    ```
  - **Response Example:**
    ```json
    {
      "success": true,
      "pointsAwarded": 10,
      "totalPoints": 160,
      "newRank": null, 
      "newAchievement": null,
      "achievements": ["FIRST_CORRECT_SENTENCE", "FIRST_GAME_COMPLETED"]
    }
    ```

### Animated Pop-ups (WebSockets)

Instead of manually polling for points, you can listen to real-time WebSockets to show animated popups when the child earns a badge.

1. Connect `socket.io-client` to the API Gateway.
2. Listen to the `gamification-milestone` event.
   ```javascript
   import io from 'socket.io-client';
   const socket = io('http://localhost:4000'); // the API gateway

   socket.on('gamification-milestone', (data) => {
     if (data.userId === currentChildId) {
       // Trigger Hebrew UI pop-up (e.g., "כל הכבוד! עלית רמה!")
     }
   });
   ```

---

## 2. English Practice Arena (WebRTC P2P)

You need to build the "English Practice Arena" UI for peer-to-peer voice rooms.

### WebRTC Connection Logic using Socket.IO Signaling

The API Gateway is now equipped with a signaling server. You will use it to exchange SDP offers/answers and ICE candidates.

**Steps to Implement:**

1. **Connect to WebSocket Server:**
   ```javascript
   const socket = io('http://localhost:4000');
   ```

2. **Join a Room:**
   ```javascript
   // Join a practice room when the child clicks "Join Arena"
   socket.emit('join-room', 'arena-room-1', currentChildId);
   ```

3. **Listen for peers joining:**
   ```javascript
   socket.on('user-joined', async (userId, peerSocketId) => {
     // A new child joined. Create a WebRTC RTCPeerConnection
     const peerConnection = new RTCPeerConnection(configuration);
     
     // Create an offer and send it
     const offer = await peerConnection.createOffer();
     await peerConnection.setLocalDescription(offer);
     
     socket.emit('offer', {
       target: peerSocketId,
       sdp: offer
     });
   });
   ```

4. **Handle Incoming Offers / Answers:**
   ```javascript
   socket.on('offer', async (payload) => {
     // Receive offer, set remote description, create answer
     const peerConnection = new RTCPeerConnection(configuration);
     await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
     
     const answer = await peerConnection.createAnswer();
     await peerConnection.setLocalDescription(answer);
     
     socket.emit('answer', {
       target: payload.callerId,
       sdp: answer
     });
   });

   socket.on('answer', async (payload) => {
     // Set remote description from answer
     await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.sdp));
   });
   ```

5. **Exchange ICE Candidates:**
   ```javascript
   // When your local connection finds an ICE candidate
   peerConnection.onicecandidate = (event) => {
     if (event.candidate) {
       socket.emit('ice-candidate', {
         target: peerSocketId,
         candidate: event.candidate
       });
     }
   };

   // Listen for incoming candidates
   socket.on('ice-candidate', async (payload) => {
     try {
       await peerConnection.addIceCandidate(payload.candidate);
     } catch (e) {
       console.error('Error adding received ice candidate', e);
     }
   });
   ```

### UI Requirements for Arena
- "Join Arena" button in Hebrew (e.g. `הצטרף לזירת האימון`).
- Microphone permission requests and error messages should be localized to Hebrew.
- Provide dynamic prompt cards (e.g., flashcards with English questions for them to ask each other).

---

## 3. Strict UI Review

Your final task is to perform a thorough review of the frontend.
- **Ensure ZERO English** in the UI elements.
- Verify: Buttons, Navigation, Alerts, Toasts, Form Labels.
- English is ONLY allowed in learning material (e.g., chat bubbles from the bot, game questions).
