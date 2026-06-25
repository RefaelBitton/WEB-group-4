import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import express from "express";
import chatRoutes from "../src/routes/chat.js";
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

  await t.test("Young child chat responds successfully", async () => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${youngToken}`
      },
      body: JSON.stringify({
        message: "hello",
        history: []
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.content);
    assert.strictEqual(data.role, "bot");
  });

  await t.test("Older child chat responds successfully", async () => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${olderToken}`
      },
      body: JSON.stringify({
        message: "hello, how are you?",
        history: []
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.content);
    assert.strictEqual(data.role, "bot");
  });

  await t.test("Young child evaluate responds successfully", async () => {
    const res = await fetch(`${baseUrl}/evaluate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${youngToken}`
      },
      body: JSON.stringify({
        message: "I has a cat.",
        history: []
      })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.response);
    assert.strictEqual(data.hasErrors, true);
  });

  // Teardown
  server.close();
  await mongoose.connection.close();
});
