# Game Sessions Metrics (CreatedAt and Length) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `createdAt` and `length` fields to `GameSession` and implement backend inactivity timeout logic to support multiple playthrough sessions.

**Architecture:** Transition from a single persistent game session document per user/game to multiple playthrough session documents using a partial unique index on `{ sessionKey, gameId }` where `status === "active"`. Implement inactivity timeout resolution when requesting questions and submitting answers.

**Tech Stack:** Node.js, Express, MongoDB, Mongoose

---

## User Review Required

> [!NOTE]
> Since we are transitioning to multiple playthrough session documents, the `game-service` will calculate and store the session duration (`length` in seconds) and creation date (`createdAt`) in each document. This will allow the `reporting-service` to easily query play frequency and session length statistics.

---

## Open Questions

None. The design and approaches have been approved.

---

## Proposed Changes

### Component 1: Codebase Cleanup

#### [DELETE] [GameSession.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/game-service/models/GameSession.js)
#### [DELETE] [Question.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/game-service/models/Question.js)

- [ ] **Step 1: Delete the legacy files**
  Delete the legacy models directory at `EX2/packages/game-service/models`.
  Command: `rm -rf "EX2/packages/game-service/models"`

---

### Component 2: GameSession Schema Updates

#### [MODIFY] [GameSession.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/game-service/src/models/GameSession.js)

- [ ] **Step 2: Update the `GameSession` model schema and indexes**
  Modify `EX2/packages/game-service/src/models/GameSession.js` to:
  1. Add `status: { type: String, enum: ["active", "completed"], default: "active", index: true }`
  2. Add `length: { type: Number, default: 0 }`
  3. Replace the unique compound index on `{ sessionKey: 1, gameId: 1 }` with a partial unique index filtering on `status: "active"`.

  ```javascript
  // Target file content update
  const gameSessionSchema = new Schema(
    {
      sessionKey: { type: String, required: true, index: true },
      gameId: { type: String, required: true, index: true, lowercase: true, trim: true },
      activeQuestionId: { type: String, default: null },
      score: { type: Number, default: 0, min: 0 },
      answeredQuestions: { type: [answeredQuestionSchema], default: [] },
      status: { type: String, enum: ["active", "completed"], default: "active", index: true },
      length: { type: Number, default: 0 },
    },
    { timestamps: true },
  );

  gameSessionSchema.index(
    { sessionKey: 1, gameId: 1 },
    { unique: true, partialFilterExpression: { status: "active" } }
  );
  ```

---

### Component 3: Game Service Logic Update

#### [MODIFY] [gameService.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/game-service/src/services/gameService.js)

- [ ] **Step 3: Implement active session helper and update endpoints**
  Update `EX2/packages/game-service/src/services/gameService.js` to:
  1. Add `SESSION_TIMEOUT_MS = 15 * 60 * 1000` (15 minutes).
  2. Implement an active session resolution function that checks if the active session is expired, marks it completed and calculates length if so, and returns a valid active session.
  3. Modify `saveActiveQuestion` and `submitAnswer` to resolve the active session through the helper.

  *Key Implementation snippet:*
  ```javascript
  const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

  async function getActiveSession(gameId) {
    if (!isDatabaseConnected()) {
      return null;
    }

    const now = new Date();
    // 1. Look for active session
    let session = await GameSession.findOne({
      sessionKey: DEFAULT_SESSION_KEY,
      gameId,
      status: "active",
    });

    if (session) {
      // 2. Check for timeout
      const timeElapsed = now - session.updatedAt;
      if (timeElapsed > SESSION_TIMEOUT_MS) {
        // Mark as completed
        session.status = "completed";
        session.length = Math.max(0, Math.round((session.updatedAt - session.createdAt) / 1000));
        session.activeQuestionId = null;
        await session.save();

        // Create new active session
        session = new GameSession({
          sessionKey: DEFAULT_SESSION_KEY,
          gameId,
          status: "active",
        });
        await session.save();
      }
    } else {
      // Create new session if none exists
      session = new GameSession({
        sessionKey: DEFAULT_SESSION_KEY,
        gameId,
        status: "active",
      });
      await session.save();
    }

    return session;
  }
  ```

---

### Component 4: Verification and Documentation

#### [NEW] [verifySession.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/game-service/src/verifySession.js)
#### [MODIFY] [db_structure.md](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/docs/db_structure.md)

- [ ] **Step 4: Create verification script**
  Create a standalone verification script `EX2/packages/game-service/src/verifySession.js` that tests:
  1. Initialization of a new session.
  2. Submitting an answer, asserting `length` increases and is correct.
  3. Mocking timeout (setting `updatedAt` to >15m in past) and fetching a new question, asserting a new active session is created and the old one is completed with correct final `length`.

- [ ] **Step 5: Run the verification script**
  Run the verification script to verify that session lifecycle, duration tracking, and timeout expiration all function correctly.
  Command: `node EX2/packages/game-service/src/verifySession.js`

- [ ] **Step 6: Update `docs/db_structure.md`**
  Modify the `gamesessions` schema table in `docs/db_structure.md` to document the new `status` and `length` fields.

---

## Verification Plan

### Automated Tests
* None. Standalone script verification will be executed.

### Manual Verification
* Run the standalone session lifecycle script: `node EX2/packages/game-service/src/verifySession.js`.
