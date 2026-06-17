# Design Specification: Grammar Hero Gamification & English Practice Arena (WebRTC P2P)

This document specifies the technical design, directory layout, API interfaces, and user workflows for the child-facing gamification profile and WebRTC peer-to-peer audio practice rooms implemented in Sprint 3.

---

## 1. Directory Structure & Vertical Slicing

We adhere to the project's vertical slicing standard, separating logic, data, and presentation folders. The new features are located under the following directories:

```
EX2/packages/frontend/src/features/
├── gamification/
│   ├── data/
│   │   └── gamificationStore.js       # Zustand state management and WebSocket client logic
│   ├── logic/
│   │   └── gamificationApi.js         # API integration with Reporting Service endpoints
│   └── presentation/
│       ├── GrammarHeroProfile.jsx     # Profile page with level meters and achievement grids
│       └── MilestoneToast.jsx         # Custom animated popups for level-ups/badges
└── arena/
    ├── data/
    │   └── arenaStore.js              # Zustand store managing signaling status and room actions
    ├── logic/
    │   └── webrtcHandler.js           # Low-level RTCPeerConnection and stream tracking handler
    └── presentation/
        └── EnglishArena.jsx           # P2P voice room with custom/general room options & prompt cards
```

---

## 2. Gamification ("Grammar Hero") Feature

### Data Layer (`gamificationStore.js` & `gamificationApi.js`)
1. **API Endpoints Callers**:
   - `fetchStats(userId)` calls `GET /api/reports/gamification/:userId`
   - `awardPoints(userId, eventType)` calls `POST /api/reports/gamification/award`
2. **State Management**:
   - Tracks current points, Hebrew-mapped rank, unlocked achievements, loading, and error states.
   - Initialized upon mounting the child portal or the profile view.
   - **WebSocket Integration**: Initializes connection to `http://localhost:4000` (API Gateway) using `socket.io-client`. Listens to the `gamification-milestone` event to dynamically trigger milestone toast notifications in the UI when the current child levels up or unlocks an achievement.
   - **Simulation Helper**: Includes a function that triggers `awardPoints` via HTTP and then emits a socket message (`gamification-event`) so the API Gateway can broadcast it to any active parent dashboard or the current child dashboard instantly.

### List of Unlocked Achievements & Hebrew Translations
The gamification system handles the following achievements mapping:
- `FIRST_CORRECT_SENTENCE` -> **המשפט הנכון הראשון שלי! ✍️**
- `FIRST_GAME_COMPLETED` -> **אלוף המשחקים הראשון! 🎮**
- `PLAYED_10_MINS` -> **10 דקות של אימון! ⏱️**
- `ARENA_CHALLENGER` -> **לוחם זירת השיחה! 🎙️** (עבור הצטרפות לחדר ב arena)
- `CHAT_MASTER` -> **אלוף השיח! 💬** (עבור 5 משפטים תקינים)
- `VOCABULARY_EXPLORER` -> **חוקר אוצר המילים! 🔍** (עבור השלמת 3 משחקים)
- `POINT_CENTURY` -> **מאה ראשונה! 💯** (עבור צבירת 100 נקודות)
- `HALF_MILLENNIUM` -> **חצי דרך לפסגה! 🚀** (עבור צבירת 500 נקודות)

### UI Specifications (`GrammarHeroProfile.jsx` & `MilestoneToast.jsx`)
- **Hebrew UI**: Strict Hebrew texts. Points, level metrics, buttons, back navigation, and control instructions are fully localized.
- **Vibrant Game Aesthetic**: Designed with a glassmorphism container, gradient cards, smooth point-to-next-level progression bar, and a grid of medals showing locked/unlocked states with hover transitions.
- **Simulation Control Panel**: An administrative drawer containing simulation triggers for `correct_sentence` (+10 points), `game_completed` (+30 points), and `play_10_mins` (+50 points) to facilitate testing and verify live WebSocket triggers.

---

## 3. English Practice Arena (WebRTC P2P)

### P2P Voice & Signaling (`arenaStore.js` & `webrtcHandler.js`)
- **Connection Configuration**: Connects to the API Gateway at `http://localhost:4000` and uses standard STUN servers for network traversal:
  ```javascript
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
  ```
- **Signaling Relays**:
  1. Child joins a room by emitting `join-room` with `roomId` and `currentChildId`.
  2. The server responds by notifying other players inside the room via `user-joined` (passing the caller's ID and socket ID).
  3. The caller initiates an RTCPeerConnection, captures local microphone tracks via `getUserMedia`, appends them, generates an SDP offer, sets local description, and transmits the offer to the target.
  4. The target receives the offer, sets remote description, captures local tracks, generates an SDP answer, sets local description, and transmits it back.
  5. ICE Candidates are exchanged through socket messages.
  6. Upon track acquisition, the remote stream is bound to an `<audio>` tag playing the voice directly.

### UI Specifications (`EnglishArena.jsx`)
- **Join View**: Features a general matchmaking room entry button and a private room text input, styled in Hebrew.
- **Active Arena Room**: Shows connection status, mic mute toggles, and call disconnection hang-up controls.
- **Conversation Prompt Cards**: A beautiful interactive card deck showing English questions (e.g. *"What is your favorite animal?"*, *"What superpower would you like to have?"*) with Hebrew buttons to cycle through them, giving the children structured practice templates.

---

## 4. Verification and QA plan
1. **API Integration**: Validate that profile data loads correctly on the profile page using test child credentials.
2. **WebSocket Milestones**: Verify that completing simulation milestones triggers real-time toast pop-ups.
3. **WebRTC Voice Stream**: Open two browser tabs logged into different child accounts, join the same room, and verify signaling negotiation and direct P2P audio track states.
4. **Strict Hebrew Verification**: Confirm that absolutely zero English UI labels appear outside the English prompt cards and conversational texts.
