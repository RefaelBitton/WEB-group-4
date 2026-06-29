import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const BOT_SERVICE_URL = "http://localhost:3002";
const API_GATEWAY_URL = "http://localhost:4000";

async function testHealth(baseUrl, name) {
  try {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    console.log(`[PASS] ${name} health check:`, data);
  } catch (err) {
    console.error(`[FAIL] ${name} health check failed:`, err.message);
  }
}

async function testChat(baseUrl, name) {
  try {
    const res = await fetch(`${baseUrl}/api/bot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "I has a big dog.",
        history: []
      })
    });
    const data = await res.json();
    console.log(`[TEST] ${name} chat response:`, data);
    if (data.content && data.role === "bot") {
      console.log(`[PASS] ${name} chat returned expected structure.`);
      if (data.content.includes("Correction:")) {
        console.log(`[PASS] ${name} chat correctly identified mistake and included Hebrew correction!`);
      } else {
        console.warn(`[WARN] ${name} chat response did not contain "Correction:". Maybe LLM did not correct. Response content was:`, data.content);
      }
    } else {
      console.error(`[FAIL] ${name} chat returned unexpected structure:`, data);
    }
  } catch (err) {
    console.error(`[FAIL] ${name} chat endpoint failed:`, err.message);
  }
}

async function testEvaluate(baseUrl, name) {
  try {
    const res = await fetch(`${baseUrl}/api/bot/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "I plays football yesterday.",
        history: []
      })
    });
    const data = await res.json();
    console.log(`[TEST] ${name} evaluate response:`, data);
    if (data.response && data.hasErrors !== undefined) {
      console.log(`[PASS] ${name} evaluate returned expected structure.`);
      if (data.hasErrors === true && data.correction) {
        console.log(`[PASS] ${name} evaluate correctly flagged errors and returned Hebrew correction:`, data.correction);
      } else {
        console.warn(`[WARN] ${name} evaluate did not flag errors. Response was:`, data);
      }
    } else {
      console.error(`[FAIL] ${name} evaluate returned unexpected structure:`, data);
    }
  } catch (err) {
    console.error(`[FAIL] ${name} evaluate endpoint failed:`, err.message);
  }
}

async function testTranscribe(baseUrl, name) {
  try {
    const dummyWebmBase64 = "GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibXRIQoWBAQDxhQOAgQy484GAdu2BlgOPQOqBlgCDgQCGgQGhgQGii3NlY3Rpb25faGVhZGVyQoWBAQDxhQOAgQy484GAdu2BlgOPQOqBlgCDgQCGgQGhgQGii3NlY3Rpb25faGVhZGVyQoWBAQDxhQOAgQy484GAdu2BlgOPQOqBlgCDgQCGgQGhgQGi";
    
    // JSON test
    const resJson = await fetch(`${baseUrl}/api/bot/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audio: dummyWebmBase64,
        mimeType: "audio/webm"
      })
    });
    const dataJson = await resJson.json();
    console.log(`[TEST] ${name} transcribe (JSON) response:`, dataJson);
    if (dataJson.transcription !== undefined || dataJson.text !== undefined) {
      console.log(`[PASS] ${name} transcribe (JSON) returned successfully.`);
    } else {
      console.error(`[FAIL] ${name} transcribe (JSON) returned unexpected structure:`, dataJson);
    }

    // Binary test
    const buffer = Buffer.from(dummyWebmBase64, "base64");
    const resBin = await fetch(`${baseUrl}/api/bot/transcribe`, {
      method: "POST",
      headers: { "Content-Type": "audio/webm" },
      body: buffer
    });
    const dataBin = await resBin.json();
    console.log(`[TEST] ${name} transcribe (Binary) response:`, dataBin);
    if (dataBin.transcription !== undefined || dataBin.text !== undefined) {
      console.log(`[PASS] ${name} transcribe (Binary) returned successfully.`);
    } else {
      console.error(`[FAIL] ${name} transcribe (Binary) returned unexpected structure:`, dataBin);
    }
  } catch (err) {
    console.error(`[FAIL] ${name} transcribe endpoint failed:`, err.message);
  }
}

async function runTests() {
  console.log("=== Testing Direct Bot Service ===");
  await testHealth(BOT_SERVICE_URL, "Bot Service");
  await testChat(BOT_SERVICE_URL, "Bot Service");
  await testEvaluate(BOT_SERVICE_URL, "Bot Service");
  await testTranscribe(BOT_SERVICE_URL, "Bot Service");

  console.log("\n=== Testing Via API Gateway ===");
  await testHealth(API_GATEWAY_URL, "API Gateway");
  await testChat(API_GATEWAY_URL, "API Gateway");
  await testEvaluate(API_GATEWAY_URL, "API Gateway");
  await testTranscribe(API_GATEWAY_URL, "API Gateway");
}

runTests();
