import mongoose from "mongoose";
import { connectToDatabase, isDatabaseConnected } from "./config/db.js";
import { GameSession } from "./models/GameSession.js";
import { Question } from "./models/Question.js";
import { fetchNextQuestion, submitAnswer } from "./services/gameService.js";

async function runTests() {
  console.log("🚀 Starting GameSession Metrics Verification...");

  // 1. Connect to DB
  await connectToDatabase();
  if (!isDatabaseConnected()) {
    console.error("❌ MongoDB is not connected! Cannot perform database verification.");
    process.exit(1);
  }

  // Drop old index so it can be re-created with the partialFilterExpression option
  try {
    await GameSession.collection.dropIndex("sessionKey_1_gameId_1");
    console.log("🗑️ Dropped old unique index sessionKey_1_gameId_1");
  } catch (err) {
    console.log("ℹ️ Index sessionKey_1_gameId_1 not found or already dropped.");
  }

  // Sync indexes
  await GameSession.syncIndexes();
  console.log("🔄 Re-built Mongoose indexes.");

  // Clear existing test sessions to start fresh
  const testSessionKey = "default-child-session";
  await GameSession.deleteMany({ sessionKey: testSessionKey });
  console.log("🧹 Cleared old test sessions.");

  // Make sure we have a question in DB or we seed it
  const gameId = "image-recognition";
  let dbQuestion = await Question.findOne({ gameId, active: true });
  if (!dbQuestion) {
    console.log("🌱 Seeding a test question in the database...");
    dbQuestion = new Question({
      id: "test-question-img-1",
      gameId,
      text: "What is this?",
      options: [
        { id: "opt-dog", text: "dog", isCorrect: true },
        { id: "opt-cat", text: "cat", isCorrect: false },
      ],
      points: 15,
      active: true,
    });
    await dbQuestion.save();
  }
  const qId = dbQuestion.id;
  const correctOptId = dbQuestion.options.find(o => o.isCorrect).id;

  // --- Test Case 1: Session Initialization ---
  console.log("\n🧪 Test Case 1: Initializing a new session...");
  const questionResult = await fetchNextQuestion(gameId);
  console.log("👉 Fetched next question:", questionResult.id);

  let activeSession = await GameSession.findOne({ sessionKey: testSessionKey, gameId, status: "active" });
  if (!activeSession) {
    throw new Error("FAIL: Active session not created in DB");
  }
  console.log("✅ Success: Active session created.");
  console.log("   - Session ID:", activeSession._id);
  console.log("   - Created At:", activeSession.createdAt);
  console.log("   - Status:", activeSession.status);
  console.log("   - Active Question ID:", activeSession.activeQuestionId);

  // --- Test Case 2: Submitting an Answer and Updating Length ---
  console.log("\n🧪 Test Case 2: Submitting an answer...");
  // Sleep for 1.5 seconds to ensure length can be calculated (> 0 seconds)
  console.log("⏳ Simulating play time (waiting 2 seconds)...");
  await new Promise(resolve => setTimeout(resolve, 2000));

  const answerResult = await submitAnswer(gameId, correctOptId);
  console.log("👉 Submitted answer:", answerResult);

  // Reload session to check updates
  const updatedSession = await GameSession.findById(activeSession._id);
  console.log("✅ Success: Session updated.");
  console.log("   - Score:", updatedSession.score);
  console.log("   - Answered Questions Count:", updatedSession.answeredQuestions.length);
  console.log("   - Session Length (seconds):", updatedSession.length);
  if (updatedSession.length < 1 || updatedSession.length > 5) {
    throw new Error(`FAIL: Length is incorrect (${updatedSession.length}s)`);
  }
  console.log("   - Active Question ID (should be null):", updatedSession.activeQuestionId);

  // --- Test Case 3: Inactivity Timeout Expiration ---
  console.log("\n🧪 Test Case 3: Simulating inactivity timeout (15+ minutes)...");
  // Fetch next question to make session active again
  await fetchNextQuestion(gameId);
  
  // Artificially modify updatedAt to be 20 minutes in the past
  const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000);
  await GameSession.updateOne(
    { _id: activeSession._id },
    { $set: { updatedAt: twentyMinsAgo } },
    { timestamps: false }
  );
  console.log("🕒 Artificially set session updatedAt to 20 minutes ago.");

  // Fetching a question now should trigger completion of the old session and start a new one
  const nextQ = await fetchNextQuestion(gameId);
  console.log("👉 Fetched next question after timeout:", nextQ.id);

  // Assert old session is completed
  const oldSession = await GameSession.findById(activeSession._id);
  console.log("👉 Old Session Final State:");
  console.log("   - Status (should be completed):", oldSession.status);
  console.log("   - Final Length:", oldSession.length);
  if (oldSession.status !== "completed") {
    throw new Error("FAIL: Old session status did not change to 'completed'");
  }

  // Assert new session is active
  const newActiveSession = await GameSession.findOne({
    sessionKey: testSessionKey,
    gameId,
    status: "active",
  });
  if (!newActiveSession || newActiveSession._id.toString() === oldSession._id.toString()) {
    throw new Error("FAIL: New active session was not created");
  }
  console.log("👉 New Active Session State:");
  console.log("   - Session ID:", newActiveSession._id);
  console.log("   - Status:", newActiveSession.status);

  // --- Test Case 4: Submit Answer Expiry Check ---
  console.log("\n🧪 Test Case 4: Simulating submission timeout...");
  // Artificially modify updatedAt of the new active session to be 20 minutes in the past
  await GameSession.updateOne(
    { _id: newActiveSession._id },
    { $set: { updatedAt: twentyMinsAgo } },
    { timestamps: false }
  );
  console.log("🕒 Artificially set new session updatedAt to 20 minutes ago.");

  try {
    await submitAnswer(gameId, correctOptId);
    throw new Error("FAIL: Allowed submission on an expired session");
  } catch (error) {
    console.log("✅ Success: submitAnswer correctly threw an error:", error.message);
    if (error.status !== 409) {
      throw new Error(`FAIL: Expected error status 409, got ${error.status}`);
    }
  }

  const expiredSessionCheck = await GameSession.findById(newActiveSession._id);
  console.log("👉 Expired Session Checked State:");
  console.log("   - Status (should be completed):", expiredSessionCheck.status);
  if (expiredSessionCheck.status !== "completed") {
    throw new Error("FAIL: Expired session status was not set to completed");
  }

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n");
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(async (error) => {
  console.error("\n❌ TEST FAILED:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
