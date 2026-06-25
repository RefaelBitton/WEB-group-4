# Chatbot Age-Based Tailoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the chatbot backend in `bot-service` to query the user's age from MongoDB and customize the AI's tone and topics based on whether the user is a younger child (ages 6-8) or an older child (ages 9-12).

**Architecture:** We will update `bot-service` to retrieve the child's `age` during the request authentication/context generation phase, then construct dynamic system instructions for Gemini indicating the tone and topics to prioritize.

**Tech Stack:** Node.js, Express, Mongoose, Google Gen AI SDK (`@google/genai`), Node.js native test runner (`node:test`).

---

### Task 1: Refactor `bot-service` Database Helper and Routes
Refactor the helper to fetch both age and english level, and dynamically construct the system prompt based on both parameters.

**Files:**
- Modify: `packages/bot-service/src/routes/chat.js`

- [ ] **Step 1: Replace `getChildLevel` helper with `getChildDetails` helper**

Modify [chat.js](file:///home/deanza/Documents/semester%206/WEB/englishBotProject/WEB-group-4/EX2/packages/bot-service/src/routes/chat.js) by removing:
```javascript
async function getChildLevel(req) {
  let childLevel = 'beginner';
  const sessionKey = req.auth?.sub;
  
  if (sessionKey && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(sessionKey)) {
    try {
      const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(sessionKey) });
      if (user && user.englishLevel) {
        childLevel = user.englishLevel;
      }
    } catch (err) {
      console.error('Error fetching child level from users collection in bot-service:', err);
    }
  }
  return childLevel;
}
```
And replacing it with:
```javascript
async function getChildDetails(req) {
  let childLevel = 'beginner';
  let childAge = 8; // default fallback age to middle of 6-12 range
  const sessionKey = req.auth?.sub;
  
  if (sessionKey && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(sessionKey)) {
    try {
      const user = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(sessionKey) });
      if (user) {
        if (user.englishLevel) {
          childLevel = user.englishLevel;
        }
        if (user.age !== undefined && user.age !== null) {
          childAge = user.age;
        }
      }
    } catch (err) {
      console.error('Error fetching child details from users collection in bot-service:', err);
    }
  }
  return { childLevel, childAge };
}
```

- [ ] **Step 2: Update dynamic instruction builders in `/chat` and `/evaluate`**

Update both `/chat` and `/evaluate` endpoints to fetch `childAge` and prepend age-specific prompt tailoring.
For `/chat`:
```javascript
    const { childLevel, childAge } = await getChildDetails(req);
    const cefrLevel = LEVEL_MAPPING[childLevel] || 'A1 (Beginner)';

    let agePrompt = '';
    if (childAge <= 8) {
      agePrompt = `The child is ${childAge} years old. Adopt a highly playful, simple, and encouraging tone. Focus topics strictly on early-elementary interests: animals, toys, colors, pets, family, simple games, and school.`;
    } else {
      agePrompt = `The child is ${childAge} years old. Adopt a conversational, friendly, and slightly more mature tone. Focus topics on late-elementary interests: hobbies, video games, sports, favorite books/movies, friends, and school subjects.`;
    }

    const dynamicInstruction = `${SYSTEM_PROMPT}
    
CRITICAL CONSTRAINT: You must adjust your vocabulary, syntax, complexity, and topics to precisely target the English level: **${cefrLevel}**.
- If A1: Use only simple present tense, very common words (e.g. dog, cat, apple, like, run), and very short questions.
- If A2: Use simple present and simple past tense, simple conjunctions, and slightly broader vocabulary.
- If B1: Use a mix of tenses (including perfect tenses), more varied adjectives/adverbs, and discuss slightly more advanced everyday topics.

${agePrompt}`;
```
Apply the exact same configuration update to `/evaluate` as well.

- [ ] **Step 3: Update conversation starter prompt generator in `/starter`**

Modify `/starter` endpoint to use `getChildDetails` and append the age constraints:
```javascript
    const { childLevel, childAge } = await getChildDetails(req);
    const cefrLevel = LEVEL_MAPPING[childLevel] || 'A1 (Beginner)';

    if (!ai) {
      // Fallback if AI isn't configured yet
      const fallbacks = [
        "Hello! What is your favorite animal?",
        "Hi there! Do you like to play games?",
        "Welcome! What is your favorite color?"
      ];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      return res.json({ starter: randomFallback });
    }

    let ageStarterConstraint = '';
    if (childAge <= 8) {
      ageStarterConstraint = `The child is ${childAge} years old. The topic should be suitable for a young child (e.g., animals, toys, colors, pets).`;
    } else {
      ageStarterConstraint = `The child is ${childAge} years old. The topic should be suitable for an older child (e.g., hobbies, games, sports, school, movies).`;
    }

    // Use AI to generate a dynamic starter matching the level and age group
    const prompt = `
      Generate a very simple, fun conversation starter in English for a child.
      It should be just one or two short sentences asking a question.
      The starter must target the CEFR level: **${cefrLevel}**.
      ${ageStarterConstraint}
      Do not include any Hebrew. Do not include quotes.
    `;
```

---

### Task 2: Create automated test for chatbot age-tailoring
Create a unit/integration test verifying that both level and age configuration are properly retrieved and processed to construct prompts for the Gemini model.

**Files:**
- Create: `packages/bot-service/test/chat.test.js`

- [ ] **Step 1: Create the test file**

Write a test file `packages/bot-service/test/chat.test.js` that spins up a test MongoDB connection, seeds test users (one 7-year-old and one 11-year-old), and mocks or validates prompt construction.
Wait! Since the API key for Gemini might not be present or we don't want to call the real LLM during test runs, we should make sure we can mock the `aiClient` behavior, or verify the endpoint logic itself.
Let's define `packages/bot-service/test/chat.test.js` to mock/stub the `getAIClient` returned value or the `mongoose` DB call.

```javascript
import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import express from "express";
import chatRoutes from "../src/routes/chat.js";
import { User } from "../../user-service/src/models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

let MONGO_TEST_URI = process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/english_learning_bot_test?authSource=admin";
if (!MONGO_TEST_URI.includes("@")) {
  MONGO_TEST_URI = "mongodb://admin:admin123@localhost:27017/english_learning_bot_test?authSource=admin";
} else {
  MONGO_TEST_URI = MONGO_TEST_URI.replace("/english_learning_bot", "/english_learning_bot_test");
}

test("Chatbot Age and Level Tailoring", async (t) => {
  await mongoose.connect(MONGO_TEST_URI);
  await mongoose.connection.db.collection('users').deleteMany({});

  const app = express();
  app.use(express.json());
  app.use("/api/bot", chatRoutes);
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/bot`;

  const secret = process.env.JWT_SECRET || "default_dev_secret";

  // Create a young child user
  const youngChildId = new mongoose.Types.ObjectId();
  await mongoose.connection.db.collection('users').insertOne({
    _id: youngChildId,
    role: "child",
    parentId: new mongoose.Types.ObjectId(),
    name: "Young Child",
    username: "young_child",
    pinHash: "dummy",
    age: 7,
    englishLevel: "beginner",
    active: true
  });

  // Create an older child user
  const olderChildId = new mongoose.Types.ObjectId();
  await mongoose.connection.db.collection('users').insertOne({
    _id: olderChildId,
    role: "child",
    parentId: new mongoose.Types.ObjectId(),
    name: "Older Child",
    username: "older_child",
    pinHash: "dummy",
    age: 11,
    englishLevel: "intermediate",
    active: true
  });

  const youngToken = jwt.sign({ sub: youngChildId.toString() }, secret);
  const olderToken = jwt.sign({ sub: olderChildId.toString() }, secret);

  await t.test("Young child conversation starter returns successfully", async () => {
    const res = await fetch(`${baseUrl}/starter`, {
      headers: { "Authorization": `Bearer ${youngToken}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.starter);
  });

  await t.test("Older child conversation starter returns successfully", async () => {
    const res = await fetch(`${baseUrl}/starter`, {
      headers: { "Authorization": `Bearer ${olderToken}` }
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.starter);
  });

  // Teardown
  server.close();
  await mongoose.connection.close();
});
```

- [ ] **Step 2: Run the test to verify it works**

Run: `node --experimental-vm-modules packages/bot-service/test/chat.test.js` or run `node packages/bot-service/test/chat.test.js` directly.
Expected output: PASS

- [ ] **Step 3: Commit**

```bash
git add packages/bot-service/src/routes/chat.js packages/bot-service/test/chat.test.js
git commit -m "feat: implement age-based chatbot tailoring and add tests"
```
