import test from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createUserServiceApp } from "../src/app.js";
import { User } from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

let MONGO_TEST_URI = process.env.MONGO_URI || "mongodb://admin:admin123@localhost:27017/english_learning_bot_test?authSource=admin";
if (!MONGO_TEST_URI.includes("@")) {
  MONGO_TEST_URI = "mongodb://admin:admin123@localhost:27017/english_learning_bot_test?authSource=admin";
} else {
  MONGO_TEST_URI = MONGO_TEST_URI.replace("/english_learning_bot", "/english_learning_bot_test");
}

test("User Auth and Management Flow", async (t) => {
  try {
    // 1. Setup DB Connection
    await mongoose.connect(MONGO_TEST_URI);
    await User.deleteMany({});

    // 2. Start Express app on dynamic port
    const app = createUserServiceApp();
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/users`;

    let parentToken = "";
    let childUsername = "childtest";

    await t.test("Register a parent successfully", async () => {
      const res = await fetch(`${baseUrl}/parents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Parent Test",
          email: "parent@test.com",
          password: "password123",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.ok(data.accessToken);
      assert.strictEqual(data.user.role, "parent");
      assert.strictEqual(data.user.name, "Parent Test");
      parentToken = data.accessToken;
    });

    await t.test("Login a parent successfully", async () => {
      const res = await fetch(`${baseUrl}/parents/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "parent@test.com",
          password: "password123",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.accessToken);
    });

    await t.test("Create a child successfully under authenticated parent", async () => {
      const res = await fetch(`${baseUrl}/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${parentToken}`,
        },
        body: JSON.stringify({
          name: "Child Test",
          username: childUsername,
          pin: "1234",
          age: 8,
          englishLevel: "beginner",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 201);
      assert.strictEqual(data.user.role, "child");
      assert.strictEqual(data.user.username, childUsername);
    });

    await t.test("Login a child successfully", async () => {
      const res = await fetch(`${baseUrl}/children/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: childUsername,
          pin: "1234",
        }),
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.accessToken);
      assert.strictEqual(data.user.role, "child");
    });

    await t.test("Get children list of parent", async () => {
      const res = await fetch(`${baseUrl}/children`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${parentToken}`,
        },
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(data.children));
      assert.strictEqual(data.children.length, 1);
      assert.strictEqual(data.children[0].username, childUsername);
    });

    // Teardown
    server.close();
    await mongoose.connection.close();
  } catch (err) {
    console.error("TEST FAILED EXCEPTION:", err);
    throw err;
  }
});
